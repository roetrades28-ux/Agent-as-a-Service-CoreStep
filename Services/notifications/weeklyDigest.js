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
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return result.candidates[0].content.parts[0].text.trim();
  } catch (err) {
    if (err?.status === 429 || err?.message?.includes('quota')) {
      // Fallback to paid key
      const result2 = await aiPaid.models.generateContent({
        model: 'gemini-2.5-flash',
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

  const sorted = [...trades].sort((a, b) => new Date(a.closed_at) - new Date(b.closed_at));
  const netPnl = Math.round(trades.reduce((s, t) => s + (t.realized_pnl || 0), 0));
  const wins = trades.filter(t => (t.realized_pnl || 0) > 0);
  const losses = trades.filter(t => (t.realized_pnl || 0) < 0);
  const winRate = Math.round((wins.length / trades.length) * 100);
  const flaggedCount = trades.filter(t => t.flagged).length;

  const byPnl = [...trades].sort((a, b) => (b.realized_pnl || 0) - (a.realized_pnl || 0));
  const bestTrade = byPnl[0] || null;
  const worstTrade = byPnl[byPnl.length - 1] || null;

  const grossWins = wins.reduce((s, t) => s + (t.realized_pnl || 0), 0);
  const grossLosses = Math.abs(losses.reduce((s, t) => s + (t.realized_pnl || 0), 0));
  const profitFactor = grossLosses > 0 ? Math.round((grossWins / grossLosses) * 100) / 100 : grossWins > 0 ? 9.99 : 0;
  const avgWin = wins.length > 0 ? Math.round(grossWins / wins.length) : 0;
  const avgLoss = losses.length > 0 ? Math.round(grossLosses / losses.length) : 0;
  const avgPnlPerTrade = Math.round(netPnl / trades.length);

  // Day win rate — % of trading days with net positive P&L
  const dayMap = {};
  for (const t of trades) {
    const day = new Date(t.closed_at).toISOString().slice(0, 10);
    if (!dayMap[day]) dayMap[day] = 0;
    dayMap[day] += t.realized_pnl || 0;
  }
  const days = Object.values(dayMap);
  const dayWinRate = days.length > 0 ? Math.round((days.filter(d => d > 0).length / days.length) * 100) : 0;

  // Consistency score — composite of winRate + dayWinRate + profitFactor capped at 100
  const consistencyScore = Math.min(100, Math.round((winRate * 0.4) + (dayWinRate * 0.4) + (Math.min(profitFactor, 5) / 5 * 100 * 0.2)));

  // Equity curve — cumulative P&L over time (sorted by closed_at)
  let cumulative = 0;
  const equityCurve = sorted.map(t => {
    cumulative += t.realized_pnl || 0;
    return Math.round(cumulative);
  });

  // Group by hour for AI context
  const tradesByHour = {};
  for (const t of trades) {
    const hour = new Date(t.closed_at).getHours();
    const bucket = hour < 12 ? 'morning' : hour < 15 ? 'midday' : 'afternoon';
    if (!tradesByHour[bucket]) tradesByHour[bucket] = { count: 0, pnl: 0 };
    tradesByHour[bucket].count++;
    tradesByHour[bucket].pnl += t.realized_pnl || 0;
  }

  return {
    netPnl, winRate, tradeCount: trades.length, flaggedCount,
    bestTrade, worstTrade, tradesByHour,
    wins: wins.length, losses: losses.length,
    profitFactor, avgWin, avgLoss, avgPnlPerTrade,
    dayWinRate, consistencyScore, equityCurve,
  };
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
async function processUser(user, { preview, previewFakeData, deliverTo } = {}) {
  const email = user.email;
  const sendToEmail = deliverTo || email; // actual delivery address (may differ in preview)
  const name = email.split('@')[0]; // fallback name — replace with profile first_name if available

  // ── Preview shortcut: use fake sample data, skip all DB queries ────────────
  if (previewFakeData) {
    const fakeTrades = [
      { id: '1', symbol: 'SPY', realized_pnl: 320, closed_at: new Date(Date.now() - 1 * 86400000).toISOString(), flagged: false, opened_at: new Date().toISOString() },
      { id: '2', symbol: 'AAPL', realized_pnl: -95, closed_at: new Date(Date.now() - 2 * 86400000).toISOString(), flagged: true, opened_at: new Date().toISOString() },
      { id: '3', symbol: 'TSLA', realized_pnl: 210, closed_at: new Date(Date.now() - 3 * 86400000).toISOString(), flagged: false, opened_at: new Date().toISOString() },
      { id: '4', symbol: 'QQQ', realized_pnl: -45, closed_at: new Date(Date.now() - 3 * 86400000).toISOString(), flagged: true, opened_at: new Date().toISOString() },
      { id: '5', symbol: 'NVDA', realized_pnl: 180, closed_at: new Date(Date.now() - 4 * 86400000).toISOString(), flagged: false, opened_at: new Date().toISOString() },
    ];
    const stats = computeStats(fakeTrades);
    let ralleInsight = '';
    try {
      ralleInsight = await generateRalleInsight(stats);
    } catch (err) {
      ralleInsight = 'Your 2 flagged trades this week both hit their stop early — consider reviewing your entry timing on high-volatility names like AAPL and QQQ before sizing in full.';
    }
    const html = weeklyDigest({ name, email, stats, ralleInsight });
    const pnlStr = `${stats.netPnl >= 0 ? '+' : ''}$${Math.abs(stats.netPnl)}`;
    const subject = `Your week in review — ${pnlStr} P&L, ${stats.winRate}% win rate`;
    try {
      await sendEmail({ to: sendToEmail, subject, html });
      console.log(`[WeeklyDigest] ✓ Preview digest sent to ${sendToEmail}`);
      return { email, status: 'sent', type: 'weekly_digest', preview: true };
    } catch (err) {
      console.error(`[WeeklyDigest] ✗ Preview send failed:`, err.message);
      return { email, status: 'failed', error: err.message };
    }
  }

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
    .select('id, symbol, realized_pnl, closed_at, flagged, opened_at, source, broker')
    .eq('app_user_id', user.id)
    .not('closed_at', 'is', null)
    .gte('closed_at', weekAgo.toISOString())
    .order('closed_at', { ascending: false });

  // Deduplicate trades by (symbol, closed_at rounded to minute, realized_pnl)
  // The app deduplicates; CSV imports can create exact duplicates in the DB
  const seen = new Set();
  const dedupedTrades = (weekTrades || []).filter(t => {
    const key = `${t.symbol}|${t.realized_pnl}|${t.closed_at?.slice(0, 16)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (weekTrades && dedupedTrades.length !== weekTrades.length) {
    console.log(`[WeeklyDigest] ${email} — deduped ${weekTrades.length} → ${dedupedTrades.length} trades (removed ${weekTrades.length - dedupedTrades.length} duplicates)`);
  }

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

  } else if (dedupedTrades.length === 0) {
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
    const stats = computeStats(dedupedTrades);
    let ralleInsight = '';
    try {
      ralleInsight = await generateRalleInsight(stats);
    } catch (err) {
      console.error(`[WeeklyDigest] Gemini error for ${email}:`, err.message);
      ralleInsight = 'Review your flagged trades from this week — they often contain the most actionable lessons.';
    }
    const digestResult = weeklyDigest({ name, email, stats, ralleInsight });
    html = digestResult.html;
    const pnlStr = `${stats.netPnl >= 0 ? '+' : ''}$${Math.abs(stats.netPnl)}`;
    subject = `Your week in review — ${pnlStr} P&L, ${stats.winRate}% win rate`;
    notifType = 'weekly_digest';
  }

  // 5. Send
  try {
    await sendEmail({ to: sendToEmail, subject, html });
    if (!preview) await logSend({ email, type: notifType, status: 'sent', metadata: { daysSince } });
    console.log(`[WeeklyDigest] ✓ Sent ${notifType} to ${sendToEmail}`);
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
async function runWeeklyDigest({ preview = false, previewEmail, sendTo } = {}) {
  console.log(`[WeeklyDigest] Starting run — preview=${preview}`);

  if (preview && previewEmail) {
    // Preview mode: use real data if user exists in app_users, otherwise fake data
    const { data: realUser } = await supabase
      .from('app_users')
      .select('id, email')
      .eq('email', previewEmail)
      .maybeSingle();

    const user = realUser || { id: 'preview-id', email: previewEmail };
    // sendTo lets you deliver to a different inbox while pulling real data for previewEmail
    const result = await processUser(user, { preview: true, previewFakeData: !realUser, deliverTo: sendTo || previewEmail });
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
