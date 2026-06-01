'use strict';
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const supabase = require('../../src/db/supabaseAdmin');
const { sendEmail } = require('./resendClient');
const { weeklyDigest, quietWeek, reEngagement } = require('./emailTemplates');

const aiFree = new GoogleGenAI({ apiKey: process.env.Default_Gemini_API_KEY });
const aiPaid = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://corestep.app';
const REENGAGE_DAYS = 14;

// ─── Gemini insight generation ───────────────────────────────────────────────
async function generateRalleInsight(stats) {
  const prompt = `You are Rall-E, a direct and honest AI trading coach inside CoreStep TradingLab.

A trader's weekly stats:
- Net P&L: $${stats.netPnl}
- Win rate: ${stats.winRate}%
- Total trades: ${stats.tradeCount}
- Flagged trades: ${stats.flaggedCount}
- Best trade: ${stats.bestTrade ? `${stats.bestTrade.symbol} +$${stats.bestTrade.realized_pnl}` : 'none'}
- Worst trade: ${stats.worstTrade ? `${stats.worstTrade.symbol} $${stats.worstTrade.realized_pnl}` : 'none'}
- Trades by time of day: ${JSON.stringify(stats.tradesByHour || {})}

Write exactly 2–3 sentences of honest, specific coaching. Reference actual numbers. Identify one concrete pattern or risk.
Do NOT use generic advice. Do NOT be encouraging for the sake of it. Be like a sharp trading coach — direct, useful, honest.
Use first person ("You..."). Do not include quotes around your response.`;

  try {
    const result = await aiFree.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return result.candidates[0].content.parts[0].text.trim();
  } catch (err) {
    if (err?.status === 429 || err?.message?.includes('quota')) {
      // Fallback to paid key
      const result2 = await aiPaid.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return result2.candidates[0].content.parts[0].text.trim();
    }
    throw err;
  }
}

// ─── Stats computation ───────────────────────────────────────────────────────
function computeStats(trades) {
  if (!trades || trades.length === 0) return null;

  const netPnl = Math.round(trades.reduce((s, t) => s + (t.realized_pnl || 0), 0));
  const wins = trades.filter(t => (t.realized_pnl || 0) > 0);
  const winRate = Math.round((wins.length / trades.length) * 100);
  const flaggedCount = trades.filter(t => t.flagged).length;
  const sorted = [...trades].sort((a, b) => (b.realized_pnl || 0) - (a.realized_pnl || 0));
  const bestTrade = sorted[0] || null;
  const worstTrade = sorted[sorted.length - 1] || null;

  // Group by hour for AI context
  const tradesByHour = {};
  for (const t of trades) {
    const hour = new Date(t.closed_at).getHours();
    const bucket = hour < 12 ? 'morning' : hour < 15 ? 'midday' : 'afternoon';
    if (!tradesByHour[bucket]) tradesByHour[bucket] = { count: 0, pnl: 0 };
    tradesByHour[bucket].count++;
    tradesByHour[bucket].pnl += t.realized_pnl || 0;
  }

  return { netPnl, winRate, tradeCount: trades.length, flaggedCount, bestTrade, worstTrade, tradesByHour };
}

// ─── Duplicate send guard ────────────────────────────────────────────────────
async function alreadySentThisWeek(email, type) {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  const { data } = await supabase
    .from('notification_log')
    .select('id')
    .eq('recipient_email', email)
    .eq('notification_type', type)
    .gte('sent_at', since.toISOString())
    .limit(1);
  return data && data.length > 0;
}

async function logSend({ email, type, status, metadata }) {
  await supabase.from('notification_log').insert({
    recipient_email: email,
    recipient_type: 'beta_user',
    notification_type: type,
    status,
    metadata: metadata || {},
  });
}

// ─── Per-user digest logic ───────────────────────────────────────────────────
async function processUser(user, { preview } = {}) {
  const email = user.email;
  const name = email.split('@')[0]; // fallback name — replace with profile first_name if available

  // 1. Check opt-out preference
  const { data: pref } = await supabase
    .from('user_preferences')
    .select('value')
    .eq('app_user_id', user.id)
    .eq('key', 'notifications.weekly_digest')
    .maybeSingle();
  if (pref?.value === false || pref?.value === 'false') {
    return { email, status: 'skipped', reason: 'opted_out' };
  }

  // 2. Get this week's closed trades
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data: weekTrades } = await supabase
    .from('trades')
    .select('id, symbol, side, realized_pnl, closed_at, flagged, opened_at')
    .eq('app_user_id', user.id)
    .not('closed_at', 'is', null)
    .gte('closed_at', weekAgo.toISOString())
    .order('closed_at', { ascending: false });

  // 3. Get last trade date for re-engagement check
  const { data: lastTradeRows } = await supabase
    .from('trades')
    .select('closed_at, realized_pnl')
    .eq('app_user_id', user.id)
    .not('closed_at', 'is', null)
    .order('closed_at', { ascending: false })
    .limit(1);
  const lastTradeDate = lastTradeRows?.[0]?.closed_at;
  const daysSince = lastTradeDate
    ? Math.floor((Date.now() - new Date(lastTradeDate).getTime()) / 86400000)
    : null;

  let html, subject, notifType;

  // 4. Route to correct email variant
  if (daysSince !== null && daysSince >= REENGAGE_DAYS) {
    // Re-engagement — haven't traded in 14+ days
    if (!preview && await alreadySentThisWeek(email, 'reengagement')) {
      return { email, status: 'skipped', reason: 'already_sent' };
    }
    // Build last session stats from last 7 trades
    const { data: lastTrades } = await supabase
      .from('trades')
      .select('realized_pnl, flagged, closed_at')
      .eq('app_user_id', user.id)
      .not('closed_at', 'is', null)
      .order('closed_at', { ascending: false })
      .limit(10);
    const lastStats = lastTrades ? {
      netPnl: Math.round(lastTrades.reduce((s, t) => s + (t.realized_pnl || 0), 0)),
      winRate: Math.round((lastTrades.filter(t => t.realized_pnl > 0).length / lastTrades.length) * 100),
      tradeCount: lastTrades.length,
      flaggedCount: lastTrades.filter(t => t.flagged).length,
      lastTradeDate,
    } : null;
    html = reEngagement({ name, email, daysSince, lastStats });
    subject = `${name}, your journal is waiting${lastStats ? ` — last session: ${lastStats.netPnl >= 0 ? '+' : ''}$${Math.abs(lastStats.netPnl)}` : ''}`;
    notifType = 'reengagement';

  } else if (!weekTrades || weekTrades.length === 0) {
    // Quiet week — no trades
    if (!preview && await alreadySentThisWeek(email, 'quiet_week')) {
      return { email, status: 'skipped', reason: 'already_sent' };
    }
    html = quietWeek({ name, email });
    subject = `Quiet week, ${name} — that's sometimes the right call`;
    notifType = 'quiet_week';

  } else {
    // Normal digest with stats
    if (!preview && await alreadySentThisWeek(email, 'weekly_digest')) {
      return { email, status: 'skipped', reason: 'already_sent' };
    }
    const stats = computeStats(weekTrades);
    let ralleInsight = '';
    try {
      ralleInsight = await generateRalleInsight(stats);
    } catch (err) {
      console.error(`[WeeklyDigest] Gemini error for ${email}:`, err.message);
      ralleInsight = 'Review your flagged trades from this week — they often contain the most actionable lessons.';
    }
    html = weeklyDigest({ name, email, stats, ralleInsight });
    const pnlStr = `${stats.netPnl >= 0 ? '+' : ''}$${Math.abs(stats.netPnl)}`;
    subject = `Your week in review — ${pnlStr} P&L, ${stats.winRate}% win rate`;
    notifType = 'weekly_digest';
  }

  // 5. Send
  try {
    await sendEmail({ to: email, subject, html });
    if (!preview) await logSend({ email, type: notifType, status: 'sent', metadata: { daysSince } });
    console.log(`[WeeklyDigest] ✓ Sent ${notifType} to ${email}`);
    return { email, status: 'sent', type: notifType };
  } catch (err) {
    console.error(`[WeeklyDigest] ✗ Failed for ${email}:`, err.message);
    if (!preview) await logSend({ email, type: notifType, status: 'failed', metadata: { error: err.message } });
    return { email, status: 'failed', error: err.message };
  }
}

// ─── Main runner ─────────────────────────────────────────────────────────────
/**
 * Run weekly digest for all beta users.
 * @param {object} opts
 * @param {boolean} [opts.preview] — if true, send only to opts.previewEmail, don't log
 * @param {string}  [opts.previewEmail]
 */
async function runWeeklyDigest({ preview = false, previewEmail } = {}) {
  console.log(`[WeeklyDigest] Starting run — preview=${preview}`);

  if (preview && previewEmail) {
    // Preview mode: send to single address using a fake user object
    const { data: user } = await supabase
      .from('app_users')
      .select('id, email')
      .eq('email', previewEmail)
      .maybeSingle();
    if (!user) return { error: `User not found: ${previewEmail}` };
    const result = await processUser(user, { preview: true });
    return { results: [result] };
  }

  // Fetch all beta users
  const { data: users, error } = await supabase
    .from('app_users')
    .select('id, email');
  if (error) throw new Error(`Failed to fetch users: ${error.message}`);

  const results = [];
  for (const user of users) {
    // Small delay between sends to avoid rate limits
    if (results.length > 0) await new Promise(r => setTimeout(r, 300));
    const result = await processUser(user);
    results.push(result);
  }

  const sent = results.filter(r => r.status === 'sent').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const failed = results.filter(r => r.status === 'failed').length;
  console.log(`[WeeklyDigest] Done — sent:${sent} skipped:${skipped} failed:${failed}`);
  return { results, summary: { sent, skipped, failed } };
}

module.exports = { runWeeklyDigest };
