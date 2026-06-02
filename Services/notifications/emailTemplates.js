'use strict';

// ─── Shared design tokens ───────────────────────────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://corestep.app';

const LOGO_SVG = `
<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 1L19 8L15.5 10.5L10 6L4.5 10.5L1 8L10 1Z" fill="white" opacity="0.85"/>
  <path d="M10 7L17 13L13.5 15.5L10 12.5L6.5 15.5L3 13L10 7Z" fill="#00d4a8" opacity="0.75"/>
  <path d="M10 13L15 17.5L12.5 19L10 17L7.5 19L5 17.5L10 13Z" fill="#00d4a8" opacity="0.35"/>
</svg>`;

const BASE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.shell{background:#f2f0eb;padding:40px 20px 60px;font-family:'Inter',sans-serif;}
.email{max-width:540px;margin:0 auto;}
.email-chrome{background:#fff;border-radius:6px;border:0.5px solid #ddd9d2;overflow:hidden;}
.chrome-bar{background:#f7f5f1;border-bottom:0.5px solid #e4e0d9;padding:14px 20px;display:flex;align-items:center;gap:14px;}
.chrome-dots{display:flex;gap:6px;}
.chrome-dot{width:10px;height:10px;border-radius:50%;}
.chrome-meta{flex:1;margin-left:4px;}
.chrome-subject{font-size:12px;font-weight:500;color:#1a1a18;letter-spacing:-0.01em;}
.chrome-from{font-size:10.5px;color:#999490;margin-top:2px;font-weight:300;}
.email-header{background:#111914;padding:24px 44px;display:flex;align-items:center;justify-content:space-between;}
.logo-wrap{display:flex;align-items:center;gap:8px;}
.logo-name{font-size:13px;font-weight:500;color:#fff;}
.logo-name span{color:#00d4a8;}
.header-tagline{font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.2);}
.hero-band{background:#111914;border-top:0.5px solid rgba(255,255,255,0.04);padding:40px 44px 36px;border-bottom:2px solid #00d4a8;position:relative;overflow:hidden;}
.hero-watermark{position:absolute;right:-10px;bottom:-24px;font-family:'DM Serif Display',serif;font-size:120px;font-style:italic;font-weight:400;color:rgba(255,255,255,0.03);line-height:1;pointer-events:none;white-space:nowrap;}
.hero-label{display:inline-flex;align-items:center;gap:7px;font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:#00d4a8;margin-bottom:18px;font-weight:500;}
.hero-label-dot{width:5px;height:5px;border-radius:50%;background:#00d4a8;}
.hero-h{font-family:'DM Serif Display',serif;font-size:34px;line-height:1.12;font-weight:400;color:#fff;margin-bottom:16px;}
.hero-h em{font-style:italic;color:rgba(255,255,255,0.38);}
.hero-sub{font-size:12.5px;color:rgba(255,255,255,0.3);font-weight:300;line-height:1.6;border-left:1.5px solid rgba(0,212,168,0.4);padding-left:14px;max-width:380px;}
.email-body{padding:36px 44px 32px;background:#fff;}
.greeting{font-size:15px;color:#1a1a18;font-weight:400;margin-bottom:20px;}
.para{font-size:14px;line-height:1.82;color:#3a3833;font-weight:300;margin-bottom:18px;}
.para b{color:#111;font-weight:500;}
.dark-card{background:#111914;border-radius:4px;padding:28px 28px 24px;margin:24px 0;position:relative;overflow:hidden;}
.card-glow{position:absolute;right:-16px;top:-16px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,168,0.10) 0%,transparent 70%);pointer-events:none;}
.card-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(0,212,168,0.1);border:0.5px solid rgba(0,212,168,0.3);border-radius:2px;padding:5px 12px;margin-bottom:16px;}
.card-badge-dot{width:5px;height:5px;border-radius:50%;background:#00d4a8;}
.card-badge-text{font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#00d4a8;font-weight:500;}
.stats-period{font-size:11px;color:rgba(255,255,255,0.2);font-weight:300;margin-bottom:20px;letter-spacing:0.04em;}
.stats-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:20px;}
.stat-box{background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:3px;padding:14px 12px;}
.stat-box.flagged{background:rgba(245,158,11,0.06);border-color:rgba(245,158,11,0.2);}
.stat-val{font-size:20px;font-weight:500;color:#fff;letter-spacing:-0.02em;margin-bottom:4px;}
.stat-val.green{color:#00d4a8;}
.stat-val.red{color:#ef4444;}
.stat-val.amber{color:#f59e0b;}
.stat-lbl{font-size:10px;color:rgba(255,255,255,0.3);font-weight:300;letter-spacing:0.04em;}
.bw-divider{height:0.5px;background:rgba(255,255,255,0.06);margin-bottom:14px;}
.bw-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:0.5px solid rgba(255,255,255,0.04);}
.bw-row:last-child{border-bottom:none;padding-bottom:0;}
.bw-left{display:flex;align-items:center;gap:10px;}
.bw-arrow{font-size:10px;width:16px;}
.bw-sym{font-size:13px;font-weight:500;color:#fff;}
.bw-meta{font-size:11px;color:rgba(255,255,255,0.25);font-weight:300;}
.bw-pnl{font-size:13px;font-weight:500;}
.ralle-block{background:#f0faf8;border:0.5px solid #c8ede6;border-left:2px solid #00d4a8;border-radius:3px;padding:20px 22px;margin:24px 0;}
.ralle-tag{font-size:9.5px;letter-spacing:0.18em;text-transform:uppercase;color:#00d4a8;font-weight:500;margin-bottom:10px;}
.ralle-text{font-size:13.5px;line-height:1.75;color:#2a4a43;font-weight:300;}
.ralle-text b{color:#111914;font-weight:500;}
.cta-row{display:flex;gap:10px;margin:24px 0 0;flex-wrap:wrap;}
.cta-primary{background:#00d4a8;color:#111914;padding:13px 22px;border-radius:3px;font-size:12.5px;font-weight:500;text-decoration:none;letter-spacing:0.02em;white-space:nowrap;display:inline-block;}
.cta-secondary{background:rgba(245,158,11,0.08);border:0.5px solid rgba(245,158,11,0.35);color:#f59e0b;padding:13px 22px;border-radius:3px;font-size:12.5px;font-weight:500;text-decoration:none;letter-spacing:0.02em;white-space:nowrap;display:inline-block;}
.cta-button{display:block;background:#00d4a8;color:#111914;text-align:center;padding:15px 28px;border-radius:3px;font-size:13px;font-weight:500;text-decoration:none;letter-spacing:0.02em;margin:24px 0 0;}
.rule{height:0.5px;background:#ece9e3;margin:28px 0;}
.next-title{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#aaa69f;font-weight:500;margin-bottom:14px;}
.item{display:grid;grid-template-columns:18px 1fr;gap:0 14px;margin-bottom:14px;}
.item:last-child{margin-bottom:0;}
.item-n{font-size:9px;font-weight:500;color:#00d4a8;padding-top:3px;letter-spacing:0.06em;}
.item-t{font-size:13px;font-weight:500;color:#1a1a18;margin-bottom:3px;}
.item-d{font-size:12.5px;line-height:1.68;color:#807b74;font-weight:300;}
.soft-strip{background:#f7f9f8;border:0.5px solid #d4ede7;border-radius:3px;padding:16px 20px;margin-top:24px;display:flex;align-items:center;gap:14px;}
.soft-strip-icon{width:36px;height:36px;border-radius:50%;background:rgba(0,212,168,0.1);border:0.5px solid rgba(0,212,168,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.soft-strip-label{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#00d4a8;font-weight:500;margin-bottom:3px;}
.soft-strip-desc{font-size:12.5px;color:#807b74;font-weight:300;line-height:1.5;}
.soft-strip-desc b{color:#3a3833;font-weight:500;}
.progress-bar{background:#f7f9f8;border:0.5px solid #d4ede7;border-radius:3px;padding:14px 20px;margin-top:24px;display:flex;align-items:center;gap:14px;}
.pdots{display:flex;gap:5px;}
.pdot{width:7px;height:7px;border-radius:50%;}
.pdot.done{background:#00d4a8;}
.pdot.active{background:#00d4a8;opacity:0.4;}
.pdot.upcoming{background:#d4ede7;}
.progress-text{font-size:11.5px;color:#807b74;font-weight:300;line-height:1.5;}
.progress-text b{color:#3a3833;font-weight:500;}
.sign{padding:24px 44px 32px;background:#fff;border-top:0.5px solid #ece9e3;}
.sign-close{font-family:'DM Serif Display',serif;font-size:15px;font-style:italic;color:#807b74;margin-bottom:12px;}
.sign-name{font-size:13px;font-weight:500;color:#1a1a18;}
.sign-role{font-size:11.5px;color:#aaa69f;margin-top:2px;font-weight:300;}
.email-footer{background:#f7f5f1;border-top:0.5px solid #e4e0d9;padding:14px 44px;text-align:center;}
.footer-text{font-size:10.5px;color:#b5b0a8;line-height:1.7;font-weight:300;}
.footer-link{color:#999490;text-decoration:none;border-bottom:0.5px solid #d4cfc8;}

@media only screen and (max-width:600px){
  .shell{padding:0 0 40px;}
  .email{max-width:100%;}
  .email-chrome{border-radius:0;border-left:none;border-right:none;}
  .chrome-bar{padding:12px 16px;}
  .chrome-dots{display:none;}
  .chrome-subject{font-size:11px;}
  .chrome-from{font-size:10px;}
  .email-header{padding:18px 20px;}
  .header-tagline{display:none;}
  .hero-band{padding:28px 20px 24px;}
  .hero-h{font-size:26px;}
  .hero-sub{font-size:12px;max-width:100%;}
  .hero-watermark{font-size:80px;}
  .email-body{padding:24px 20px 20px;}
  .dark-card{padding:20px 16px 18px;margin:18px 0;}
  .stats-grid{grid-template-columns:1fr 1fr;gap:8px;}
  .stat-val{font-size:18px;}
  .cta-row{flex-direction:column;gap:8px;}
  .cta-primary,.cta-secondary{display:block;text-align:center;white-space:normal;}
  .cta-button{padding:14px 20px;}
  .sign{padding:20px 20px 24px;}
  .email-footer{padding:14px 20px;}
  .soft-strip{flex-direction:column;align-items:flex-start;gap:10px;}
  .progress-bar{flex-direction:column;align-items:flex-start;gap:8px;}
  .bw-meta{display:none;}
}
`;

// ─── Shared shell wrapper ────────────────────────────────────────────────────
function shell({ subject, fromLabel, headerTagline, heroWatermark, heroLabelText, heroH, heroSub, body, signClose, signName, signRole, footerAudience, unsubscribeUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="x-apple-disable-message-reformatting"/>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<title>${subject}</title>
<style>${BASE_STYLES}</style>
</head>
<body>
<div class="shell">
  <div class="email">
    <div class="email-chrome">

      <div class="chrome-bar">
        <div class="chrome-dots">
          <div class="chrome-dot" style="background:#ff5f57;"></div>
          <div class="chrome-dot" style="background:#febc2e;"></div>
          <div class="chrome-dot" style="background:#28c840;"></div>
        </div>
        <div class="chrome-meta">
          <div class="chrome-subject">${subject}</div>
          <div class="chrome-from">${fromLabel || 'ralle@corestep.app'} → me</div>
        </div>
      </div>

      <div class="email-header">
        <div class="logo-wrap">
          ${LOGO_SVG}
          <div class="logo-name">Core<span>Step</span></div>
        </div>
        <div class="header-tagline">${headerTagline}</div>
      </div>

      <div class="hero-band">
        <div class="hero-watermark">${heroWatermark}</div>
        <div class="hero-label"><div class="hero-label-dot"></div>${heroLabelText}</div>
        <h1 class="hero-h">${heroH}</h1>
        <p class="hero-sub">${heroSub}</p>
      </div>

      <div class="email-body">${body}</div>

      <div class="sign">
        <p class="sign-close">${signClose}</p>
        <p class="sign-name">${signName}</p>
        <p class="sign-role">${signRole}</p>
      </div>

      <div class="email-footer">
        <p class="footer-text">
          CoreStep TradingLab &middot; <a class="footer-link" href="${FRONTEND_URL}">corestep.app</a><br/>
          ${footerAudience} <a class="footer-link" href="${unsubscribeUrl}">Unsubscribe</a> &middot; <a class="footer-link" href="${FRONTEND_URL}/settings/profile">Email preferences</a>
        </p>
      </div>

    </div>
  </div>
</div>
</body>
</html>`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtPnl(n) {
  const sign = n >= 0 ? '+' : '';
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function weekRange() {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// BETA USER EMAILS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Full weekly digest — user has closed trades this week.
 * @param {object} p
 * @param {string} p.name
 * @param {string} p.email
 * @param {object} p.stats  { netPnl, winRate, tradeCount, flaggedCount, bestTrade, worstTrade }
 * @param {string} p.ralleInsight  — Gemini-generated coaching sentence(s)
 * @param {string} [p.unsubscribeUrl]
 */
function weeklyDigest({ name, email, stats, ralleInsight, unsubscribeUrl }) {
  const { netPnl, winRate, tradeCount, flaggedCount, bestTrade, worstTrade } = stats;
  const pnlClass = netPnl >= 0 ? 'green' : 'red';
  const range = weekRange();
  const unsubUrl = unsubscribeUrl || `${FRONTEND_URL}/api/notifications/unsubscribe?email=${encodeURIComponent(email)}&type=digest`;

  const body = `
<p class="greeting">Hey ${name},</p>
<p class="para">Here's what your trading looked like this week. Numbers are pulled directly from your connected accounts.</p>

<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">Performance snapshot</div></div>
  <div class="stats-period">${range}</div>
  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-val ${pnlClass}">${fmtPnl(netPnl)}</div>
      <div class="stat-lbl">Net P&amp;L</div>
    </div>
    <div class="stat-box">
      <div class="stat-val">${winRate}%</div>
      <div class="stat-lbl">Win Rate</div>
    </div>
    <div class="stat-box">
      <div class="stat-val">${tradeCount}</div>
      <div class="stat-lbl">Trades</div>
    </div>
    <div class="stat-box ${flaggedCount > 0 ? 'flagged' : ''}">
      <div class="stat-val ${flaggedCount > 0 ? 'amber' : ''}">${flaggedCount}</div>
      <div class="stat-lbl">Flagged</div>
    </div>
  </div>
  <div class="bw-divider"></div>
  ${bestTrade ? `
  <div class="bw-row">
    <div class="bw-left">
      <span class="bw-arrow" style="color:#00d4a8;">▲</span>
      <span class="bw-sym">${bestTrade.symbol}</span>
      <span class="bw-meta">${bestTrade.side || ''} &middot; ${fmtDate(bestTrade.closed_at)}</span>
    </div>
    <span class="bw-pnl" style="color:#00d4a8;">${fmtPnl(bestTrade.realized_pnl)}</span>
  </div>` : ''}
  ${worstTrade ? `
  <div class="bw-row">
    <div class="bw-left">
      <span class="bw-arrow" style="color:#ef4444;">▼</span>
      <span class="bw-sym">${worstTrade.symbol}</span>
      <span class="bw-meta">${worstTrade.side || ''} &middot; ${fmtDate(worstTrade.closed_at)}</span>
    </div>
    <span class="bw-pnl" style="color:#ef4444;">${fmtPnl(worstTrade.realized_pnl)}</span>
  </div>` : ''}
</div>

<div class="ralle-block">
  <div class="ralle-tag">Rall-E noticed</div>
  <p class="ralle-text">${ralleInsight}</p>
</div>

<div class="cta-row">
  <a class="cta-primary" href="${FRONTEND_URL}/JournalDashboard">Review my journal &rarr;</a>
  ${flaggedCount > 0 ? `<a class="cta-secondary" href="${FRONTEND_URL}/JournalDashboard?filter=flagged">Review ${flaggedCount} flagged trade${flaggedCount > 1 ? 's' : ''}</a>` : ''}
</div>

<div class="rule"></div>
<div class="next-title">While you're here</div>

<div class="item">
  <div class="item-n">01</div>
  <div>
    <p class="item-t">Check your P&amp;L calendar</p>
    <p class="item-d">See which days of the week you consistently win or lose. The pattern is almost always there — most traders just haven't looked.</p>
  </div>
</div>
<div class="item">
  <div class="item-n">02</div>
  <div>
    <p class="item-t">Tag this week's trades</p>
    <p class="item-d">Ask Rall-E to tag your trades by setup type. 10 seconds now makes next week's review far more useful.</p>
  </div>
</div>`;

  return shell({
    subject: `Your week in review — ${fmtPnl(netPnl)} P&L, ${winRate}% win rate`,
    headerTagline: 'Weekly digest',
    heroWatermark: 'Week',
    heroLabelText: range,
    heroH: `${netPnl >= 0 ? 'Good week' : 'Tough week'}, ${name}.<br><em>Let's look closer.</em>`,
    heroSub: `Your performance snapshot is ready. Rall-E reviewed your trades and flagged one pattern worth your attention.`,
    body,
    signClose: 'See you next Sunday,',
    signName: 'Rall-E · CoreStep',
    signRole: 'Your AI trading analyst',
    footerAudience: "You're receiving this as a beta user.",
    unsubscribeUrl: unsubUrl,
  });
}

/**
 * Quiet week — no closed trades this week.
 */
function quietWeek({ name, email, unsubscribeUrl }) {
  const range = weekRange();
  const unsubUrl = unsubscribeUrl || `${FRONTEND_URL}/api/notifications/unsubscribe?email=${encodeURIComponent(email)}&type=digest`;

  const body = `
<p class="greeting">Hey ${name},</p>
<p class="para">No closed trades in your account this week. Sometimes the best trade is no trade — professional traders sit on their hands more than most people realise.</p>

<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">Worth remembering</div></div>
  <p style="font-family:'DM Serif Display',serif;font-size:20px;font-style:italic;font-weight:400;color:#fff;line-height:1.45;margin-bottom:10px;">
    "The best trade is sometimes no trade. Professional traders sit on their hands 60–70% of the time. Patience isn't weakness — it's edge."
  </p>
  <p style="font-size:11px;color:rgba(255,255,255,0.2);font-weight:300;letter-spacing:0.04em;">— Trading desk principle, prop trading firms</p>
</div>

<div class="rule"></div>
<div class="next-title">Make next week count</div>

<div class="item">
  <div class="item-n">01</div>
  <div>
    <p class="item-t">Review your last 5 closed trades</p>
    <p class="item-d">What setup did they share? What made you pull the trigger? Pattern recognition starts with looking back.</p>
  </div>
</div>
<div class="item">
  <div class="item-n">02</div>
  <div>
    <p class="item-t">Check your P&amp;L calendar</p>
    <p class="item-d">Your patterns don't disappear when you take a week off. Your calendar shows which days and times you consistently perform.</p>
  </div>
</div>
<div class="item">
  <div class="item-n">03</div>
  <div>
    <p class="item-t">Ask Rall-E one question</p>
    <p class="item-d">Open the journal and ask: "What's my biggest recurring mistake?" Let your data answer before markets open Monday.</p>
  </div>
</div>

<a class="cta-button" href="${FRONTEND_URL}/JournalDashboard">Open my journal &rarr;</a>`;

  return shell({
    subject: `Quiet week, ${name} — that's sometimes the right call`,
    headerTagline: 'Weekly digest',
    heroWatermark: 'Rest',
    heroLabelText: range,
    heroH: `Quiet week.<br><em>That's okay.</em>`,
    heroSub: `No trades synced this week. Sometimes the best trade is no trade — professional traders sit on their hands more than you'd think.`,
    body,
    signClose: 'See you next Sunday,',
    signName: 'Rall-E · CoreStep',
    signRole: 'Your AI trading analyst',
    footerAudience: "You're receiving this as a beta user.",
    unsubscribeUrl: unsubUrl,
  });
}

/**
 * Re-engagement — user hasn't traded in 14+ days.
 */
function reEngagement({ name, email, daysSince, lastStats, unsubscribeUrl }) {
  const { netPnl, winRate, tradeCount, lastTradeDate, flaggedCount } = lastStats || {};
  const unsubUrl = unsubscribeUrl || `${FRONTEND_URL}/api/notifications/unsubscribe?email=${encodeURIComponent(email)}&type=digest`;

  const body = `
<p class="greeting">Hey ${name},</p>
<p class="para">We haven't seen any activity from your account in <b>${daysSince} days</b>. Whatever's kept you away — that's completely fine. But before you step back in, here's where you left off.</p>

${lastStats ? `
<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">Your last session</div></div>
  <p style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;color:#fff;margin-bottom:6px;line-height:1.2;">
    ${lastTradeDate ? `Week of ${fmtDate(lastTradeDate)}.` : 'Your last session.'}<br>
    <em style="color:rgba(255,255,255,0.38);">You finished ${netPnl >= 0 ? 'green' : 'in the red'}.</em>
  </p>
  ${lastTradeDate ? `<p style="font-size:11px;color:rgba(255,255,255,0.2);font-weight:300;margin-bottom:18px;letter-spacing:0.04em;">Last closed trade &middot; ${fmtDate(lastTradeDate)}</p>` : ''}
  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-val ${netPnl >= 0 ? 'green' : 'red'}">${fmtPnl(netPnl)}</div>
      <div class="stat-lbl">Net P&amp;L</div>
    </div>
    <div class="stat-box">
      <div class="stat-val">${winRate}%</div>
      <div class="stat-lbl">Win Rate</div>
    </div>
    <div class="stat-box">
      <div class="stat-val">${tradeCount}</div>
      <div class="stat-lbl">Trades</div>
    </div>
    ${flaggedCount > 0 ? `
    <div class="stat-box flagged">
      <div class="stat-val amber">${flaggedCount}</div>
      <div class="stat-lbl">Flagged</div>
    </div>` : ''}
  </div>
</div>` : ''}

<p class="para">You left on a positive note. The best time to review what worked — and build on it — is before you start trading again, not after.</p>

<a class="cta-button" href="${FRONTEND_URL}/JournalDashboard">Pick up where I left off &rarr;</a>

${flaggedCount > 0 ? `
<div class="soft-strip" style="margin-top:16px;">
  <div style="font-size:12.5px;color:#807b74;font-weight:300;line-height:1.6;">
    Rall-E flagged <b style="color:#3a3833;">${flaggedCount} trade${flaggedCount > 1 ? 's' : ''}</b> from your last session worth a second look. Still in your journal whenever you're ready.
  </div>
</div>` : ''}`;

  return shell({
    subject: `${name}, your journal is waiting${lastStats ? ` — last session: ${fmtPnl(lastStats.netPnl)}` : ''}`,
    headerTagline: 'Weekly digest',
    heroWatermark: 'Back',
    heroLabelText: `${daysSince} days since last session`,
    heroH: `Your journal<br><em>is waiting.</em>`,
    heroSub: `It's been a couple of weeks. Your data is still here — and so are the patterns worth reviewing before you trade again.`,
    body,
    signClose: 'Good to have you back,',
    signName: 'Rall-E · CoreStep',
    signRole: 'Your AI trading analyst',
    footerAudience: "You're receiving this as a beta user.",
    unsubscribeUrl: unsubUrl,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WAITLIST DRIP EMAILS (steps 1–5)
// ═══════════════════════════════════════════════════════════════════════════

function waitlistUnsubUrl(email) {
  return `${FRONTEND_URL}/api/notifications/unsubscribe?email=${encodeURIComponent(email)}&type=waitlist`;
}

function waitlistFooter() {
  return "You're on the early access waitlist.";
}

function waitlistSign() {
  return {
    signClose: 'Looking forward to it,',
    signName: 'Roelisa Santos',
    signRole: 'COO & Co-Founder, CoreStep',
  };
}

/** Step 1 — Day 0: Welcome */
function dripStep1({ email }) {
  const body = `
<p class="greeting">Hey,</p>
<p class="para">Most traders lose not because they're bad at reading charts. They lose because they <b>repeat the same mistakes</b> — and never know it.</p>
<p class="para">CoreStep is an AI-powered trading journal that syncs your trades, finds your patterns, and tells you what your data actually means — in plain English.</p>

<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">What you get when you're in</div></div>
  <div class="item" style="margin-top:4px;">
    <div class="item-n">01</div>
    <div><p class="item-t" style="color:#fff;">Auto-sync from Tradovate, Webull, TradeStation & more</p></div>
  </div>
  <div class="item">
    <div class="item-n">02</div>
    <div><p class="item-t" style="color:#fff;">Rall-E — AI that tags, flags &amp; reviews your trades</p></div>
  </div>
  <div class="item">
    <div class="item-n">03</div>
    <div><p class="item-t" style="color:#fff;">P&amp;L calendar, win-rate breakdowns, execution quality</p></div>
  </div>
  <div class="item">
    <div class="item-n">04</div>
    <div><p class="item-t" style="color:#fff;">BacktestLab — test strategies on your own trade history</p></div>
  </div>
</div>

<div class="rule"></div>
<div class="next-title">What's coming your way</div>
<div class="item">
  <div class="item-n">01</div>
  <div><p class="item-t">Weekly trading education</p><p class="item-d">One email per week. Real concepts, no fluff. Starts next Sunday.</p></div>
</div>
<div class="item">
  <div class="item-n">02</div>
  <div><p class="item-t">Feature previews before public launch</p><p class="item-d">You'll see what we're building before anyone else.</p></div>
</div>
<div class="item">
  <div class="item-n">03</div>
  <div><p class="item-t">Your beta invite when a slot opens</p><p class="item-d">We're letting people in in small batches. You're in the queue.</p></div>
</div>

<div class="progress-bar">
  <div class="pdots">
    <div class="pdot done"></div><div class="pdot upcoming"></div><div class="pdot upcoming"></div><div class="pdot upcoming"></div><div class="pdot upcoming"></div>
  </div>
  <div class="progress-text"><b>1 of 5</b> · Next Sunday: the real reason traders don't improve.</div>
</div>`;

  return shell({
    subject: "You're on the list — here's what CoreStep actually does",
    headerTagline: 'Early access',
    heroWatermark: 'Welcome',
    heroLabelText: 'Private beta waitlist',
    heroH: `You're in.<br><em>Now let's build your edge.</em>`,
    heroSub: `Your waitlist spot is confirmed. We'll send you one useful email per week about trading while you wait — no spam, no pitch decks.`,
    body,
    ...waitlistSign(),
    footerAudience: waitlistFooter(),
    unsubscribeUrl: waitlistUnsubUrl(email),
  });
}

/** Step 2 — Day 7: The feedback loop problem */
function dripStep2({ email }) {
  const body = `
<p class="greeting">Hey,</p>
<p class="para">Here's a question worth sitting with: <b>how many times have you repeated the same losing trade before realising it was a pattern?</b></p>
<p class="para">Most traders can't answer that — because they were never tracking it.</p>

<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">Research insight</div></div>
  <p style="font-family:'DM Serif Display',serif;font-size:38px;font-style:italic;color:#fff;line-height:1;margin-bottom:8px;">7–12<span style="font-size:18px;color:rgba(255,255,255,0.3);font-style:normal;font-family:'Inter',sans-serif;font-weight:300;">× on average</span></p>
  <p style="font-size:12.5px;color:rgba(255,255,255,0.3);font-weight:300;line-height:1.6;margin-top:10px;">Retail traders repeat the same losing patterns 7 to 12 times before recognising them — not because they lack discipline, but because they have no feedback loop.</p>
</div>

<p class="para">Professional traders have two things retail traders almost never do:</p>

<div class="rule"></div>
<div class="next-title">What separates professionals</div>
<div class="item">
  <div class="item-n">01</div>
  <div><p class="item-t">A structured post-session review</p><p class="item-d">Every session gets logged — entry reason, exit reason, outcome. Not for record-keeping. For pattern detection. The journal is the edge.</p></div>
</div>
<div class="item">
  <div class="item-n">02</div>
  <div><p class="item-t">Someone tracking their patterns</p><p class="item-d">Prop traders have desk managers. Hedge fund traders have risk teams. Retail traders have nobody. CoreStep is built to fill that role.</p></div>
</div>
<div class="item">
  <div class="item-n">03</div>
  <div><p class="item-t">Data before emotion</p><p class="item-d">When you feel like you're in a slump, a review of your last 20 trades either confirms it — or shows you it's recency bias. Data beats gut feel.</p></div>
</div>

<div class="progress-bar">
  <div class="pdots">
    <div class="pdot done"></div><div class="pdot done"></div><div class="pdot upcoming"></div><div class="pdot upcoming"></div><div class="pdot upcoming"></div>
  </div>
  <div class="progress-text"><b>2 of 5</b> · Next: what your P&amp;L calendar is really showing you.</div>
</div>`;

  return shell({
    subject: "The #1 reason traders don't improve (it's not discipline)",
    headerTagline: 'Trading education · Week 2',
    heroWatermark: 'Patterns',
    heroLabelText: 'Trading psychology',
    heroH: `It's not discipline.<br><em>It's the loop.</em>`,
    heroSub: `Most trading advice gets this wrong. The real reason traders don't improve isn't mindset — it's that they have no feedback system.`,
    body,
    ...waitlistSign(),
    footerAudience: waitlistFooter(),
    unsubscribeUrl: waitlistUnsubUrl(email),
  });
}

/** Step 3 — Day 21: P&L calendar */
function dripStep3({ email }) {
  const body = `
<p class="greeting">Hey,</p>
<p class="para">Pull up any retail trader's P&L data and you'll almost always find a pattern they don't know about.</p>
<p class="para">They kill it Monday and Tuesday. They give it back Thursday and Friday. Or they win in the morning and bleed in the afternoon. Or they're fine on calm days but blow up on FOMC weeks.</p>
<p class="para"><b>These aren't random.</b> They're behavioral patterns tied to energy, screen time, the news cycle, and emotional state.</p>

<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">Common patterns we see</div></div>
  <div class="item" style="margin-top:4px;">
    <div class="item-n">01</div>
    <div><p class="item-t" style="color:#fff;">Red Fridays</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Usually revenge trading into the close after a flat week.</p></div>
  </div>
  <div class="item">
    <div class="item-n">02</div>
    <div><p class="item-t" style="color:#fff;">Red after big green days</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Overconfidence. Bigger size, less caution, worse outcomes.</p></div>
  </div>
  <div class="item">
    <div class="item-n">03</div>
    <div><p class="item-t" style="color:#fff;">Red on FOMC / earnings weeks</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Sizing up on catalysts without a real edge on that event type.</p></div>
  </div>
  <div class="item">
    <div class="item-n">04</div>
    <div><p class="item-t" style="color:#fff;">Afternoon losses</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Boredom trading after 11am when your real edge has already closed.</p></div>
  </div>
</div>

<div class="soft-strip">
  <div>
    <div class="soft-strip-label">In CoreStep</div>
    <div class="soft-strip-desc">Your P&amp;L calendar is live the moment you sync. <b>Rall-E flags these patterns automatically</b> — you don't have to go looking for them.</div>
  </div>
</div>

<div class="progress-bar">
  <div class="pdots">
    <div class="pdot done"></div><div class="pdot done"></div><div class="pdot done"></div><div class="pdot upcoming"></div><div class="pdot upcoming"></div>
  </div>
  <div class="progress-text"><b>3 of 5</b> · Next: the one metric that predicts long-term profitability better than win rate.</div>
</div>`;

  return shell({
    subject: "Your P&L calendar is trying to tell you something",
    headerTagline: 'Trading education · Week 3',
    heroWatermark: 'Calendar',
    heroLabelText: 'Market patterns',
    heroH: `Your calendar<br><em>knows the truth.</em>`,
    heroSub: `Every trader has behavioral patterns tied to day-of-week, time-of-day, and market conditions. Most have never looked at the data.`,
    body,
    ...waitlistSign(),
    footerAudience: waitlistFooter(),
    unsubscribeUrl: waitlistUnsubUrl(email),
  });
}

/** Step 4 — Day 35: Expectancy / win rate myth */
function dripStep4({ email }) {
  const body = `
<p class="greeting">Hey,</p>
<p class="para">Ask most traders what their win rate is — they'll tell you instantly. Ask them their <b>expectancy</b> and you'll get silence.</p>
<p class="para">That's a problem. Expectancy is the only number that actually tells you if your strategy makes money long-term.</p>

<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">The formula</div></div>
  <p style="font-family:'DM Serif Display',serif;font-size:20px;font-style:italic;color:#fff;line-height:1.45;margin-bottom:16px;">
    Expectancy =<br>(Win% &times; Avg Win) &minus; (Loss% &times; Avg Loss)
  </p>
  <div style="height:0.5px;background:rgba(255,255,255,0.07);margin-bottom:16px;"></div>
  <p style="font-size:12.5px;color:rgba(255,255,255,0.3);font-weight:300;line-height:1.7;">
    Example: <span style="color:#00d4a8;font-weight:500;">40% win rate</span> &middot; <span style="color:#00d4a8;font-weight:500;">$300 avg win</span> &middot; <span style="color:#00d4a8;font-weight:500;">$100 avg loss</span><br>
    = (0.40 &times; $300) &minus; (0.60 &times; $100) = $120 &minus; $60
  </p>
  <p style="font-size:14px;font-weight:500;color:#fff;margin-top:10px;">= <span style="color:#00d4a8;">+$60 per trade &middot; Positive expectancy ✓</span></p>
</div>

<p class="para">A trader winning only 40% of the time can be <b>more profitable</b> than one winning 65% — if they cut losses fast and let winners run.</p>

<div class="rule"></div>
<div class="next-title">What to check in your own trading</div>
<div class="item">
  <div class="item-n">01</div>
  <div><p class="item-t">Calculate your actual expectancy</p><p class="item-d">Pull your last 30 trades. Separate wins from losses. Calculate averages. Plug into the formula. The number will surprise you.</p></div>
</div>
<div class="item">
  <div class="item-n">02</div>
  <div><p class="item-t">Track your R-multiple</p><p class="item-d">R = profit or loss divided by initial risk. A trade risking $100 that makes $300 is 3R. Most profitable traders average 1.5R+ over time.</p></div>
</div>
<div class="item">
  <div class="item-n">03</div>
  <div><p class="item-t">Stop chasing win rate</p><p class="item-d">If your avg win is $50 and avg loss is $200, a 70% win rate still loses money. Protect the downside and win rate stops mattering as much.</p></div>
</div>

<div class="soft-strip">
  <div>
    <div class="soft-strip-label">In CoreStep</div>
    <div class="soft-strip-desc">Expectancy and R-multiple are <b>calculated automatically</b> from every synced trade. No spreadsheet needed.</div>
  </div>
</div>

<div class="progress-bar">
  <div class="pdots">
    <div class="pdot done"></div><div class="pdot done"></div><div class="pdot done"></div><div class="pdot done"></div><div class="pdot upcoming"></div>
  </div>
  <div class="progress-text"><b>4 of 5</b> · Next: you're almost in — here's what to do on day one.</div>
</div>`;

  return shell({
    subject: "Win rate is lying to you. Here's what actually matters.",
    headerTagline: 'Trading education · Week 4',
    heroWatermark: 'Edge',
    heroLabelText: 'Trading fundamentals',
    heroH: `Win rate<br><em>is lying to you.</em>`,
    heroSub: `The metric every retail trader obsesses over is almost meaningless without this one calculation next to it.`,
    body,
    ...waitlistSign(),
    footerAudience: waitlistFooter(),
    unsubscribeUrl: waitlistUnsubUrl(email),
  });
}

/** Step 5 — Day 42: You're almost in */
function dripStep5({ email }) {
  const body = `
<p class="greeting">Hey,</p>
<p class="para">You're near the front of the list. When you get access, here's exactly what to do on day one — so you get value in the first 20 minutes, not after a week of setup.</p>

<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">Your day one plan</div></div>
  <div class="item" style="margin-top:4px;">
    <div class="item-n">01</div>
    <div><p class="item-t" style="color:#fff;">Connect your broker</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Tradovate, Webull, TradeStation, or CSV upload. Takes 2 minutes.</p></div>
  </div>
  <div class="item">
    <div class="item-n">02</div>
    <div><p class="item-t" style="color:#fff;">Sync your last 90 days of trades</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Your history imports automatically. No manual entry.</p></div>
  </div>
  <div class="item">
    <div class="item-n">03</div>
    <div><p class="item-t" style="color:#fff;">Open your P&amp;L calendar</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Find your worst day of the week. It's almost always there.</p></div>
  </div>
  <div class="item">
    <div class="item-n">04</div>
    <div><p class="item-t" style="color:#fff;">Ask Rall-E one question</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">"What patterns do you see in my losing trades?" — and listen.</p></div>
  </div>
</div>

<p class="para">That first session usually takes 20 minutes and shows most traders something they've never seen in their own data.</p>

<div class="rule"></div>
<p class="para">While you wait — think about this: <b>what's one trading rule you keep breaking?</b> Do you know why you break it?</p>
<p class="para" style="font-size:13px;color:#807b74;">That's the question CoreStep is built to answer.</p>

<div class="soft-strip">
  <div>
    <div class="soft-strip-label">Referral</div>
    <div class="soft-strip-desc">Know another trader who'd benefit? Reply to this email with their name and we'll <b>bump you both up the list</b>.</div>
  </div>
</div>

<div class="progress-bar">
  <div class="pdots">
    <div class="pdot done"></div><div class="pdot done"></div><div class="pdot done"></div><div class="pdot done"></div><div class="pdot done"></div>
  </div>
  <div class="progress-text"><b>5 of 5</b> · You'll keep receiving our weekly market education until your slot opens.</div>
</div>`;

  return shell({
    subject: "You're almost in — here's what to do on day one",
    headerTagline: 'Early access · Almost there',
    heroWatermark: 'Soon',
    heroLabelText: 'Beta access update',
    heroH: `Almost there.<br><em>Here's day one.</em>`,
    heroSub: `You're near the front of the list. We want you to get real value in the first 20 minutes — so here's exactly what to do when you're in.`,
    body,
    ...waitlistSign(),
    footerAudience: waitlistFooter(),
    unsubscribeUrl: waitlistUnsubUrl(email),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WAITLIST NEWSLETTER (phase 2 — after step 5, ongoing weekly)
// ═══════════════════════════════════════════════════════════════════════════

const NEWSLETTER_TOPICS = [
  {
    subject: "How to size a position — fixed risk vs. % of account",
    watermark: 'Size',
    heroH: `Position sizing<br><em>is risk management.</em>`,
    heroSub: 'Most traders focus on which trades to take. Professionals focus on how much to risk on each one.',
    labelText: 'Risk management',
    body: (email) => `
<p class="greeting">Hey,</p>
<p class="para">Two traders. Same strategy. One goes broke, one thrives. The only difference: <b>how much they risked per trade.</b></p>
<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">Two approaches</div></div>
  <div class="item" style="margin-top:4px;">
    <div class="item-n">01</div>
    <div><p class="item-t" style="color:#fff;">Fixed dollar risk</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Risk the same dollar amount every trade (e.g. $100). Simple, predictable, immune to account size swings.</p></div>
  </div>
  <div class="item">
    <div class="item-n">02</div>
    <div><p class="item-t" style="color:#fff;">% of account</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Risk 1–2% of your total account per trade. Scales with growth. Naturally shrinks position size during drawdowns.</p></div>
  </div>
</div>
<div class="rule"></div>
<div class="next-title">The rule professionals live by</div>
<div class="item">
  <div class="item-n">—</div>
  <div><p class="item-t">Never risk more than 2% per trade</p><p class="item-d">At 2% risk, you can lose 10 trades in a row and still have 82% of your account. At 10% risk, 10 losses wipes you out entirely. Survival is the edge.</p></div>
</div>
<div class="soft-strip"><div><div class="soft-strip-label">In CoreStep</div><div class="soft-strip-desc">CoreStep tracks your <b>average risk per trade</b> and flags when you're sizing outside your own historical norm.</div></div></div>`,
  },
  {
    subject: "What implied volatility actually tells options traders",
    watermark: 'Vol',
    heroH: `IV is the market<br><em>pricing in fear.</em>`,
    heroSub: `Implied volatility is the most misunderstood number in options trading — and it costs retail traders billions every year.`,
    labelText: 'Options education',
    body: (email) => `
<p class="greeting">Hey,</p>
<p class="para">Most retail options traders focus on direction. Professionals focus on <b>implied volatility (IV)</b> — and that's why they have an edge.</p>
<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">What IV actually means</div></div>
  <p style="font-size:13.5px;color:rgba(255,255,255,0.35);font-weight:300;line-height:1.7;">IV is the market's forecast of how much a stock will move over the next 30 days — expressed as an annualised percentage. High IV = expensive options. Low IV = cheap options. Neither is inherently good or bad.</p>
</div>
<div class="rule"></div>
<div class="next-title">Three things to know</div>
<div class="item"><div class="item-n">01</div><div><p class="item-t">IV Crush is real</p><p class="item-d">Options lose value rapidly after earnings even when you're directionally right — because IV collapses after the event. Buying options before earnings is one of the most consistent ways to lose money.</p></div></div>
<div class="item"><div class="item-n">02</div><div><p class="item-t">IV rank matters more than IV</p><p class="item-d">30% IV means nothing without context. IV rank tells you where that 30% sits relative to the past year. High IV rank = sell premium. Low IV rank = buy options.</p></div></div>
<div class="item"><div class="item-n">03</div><div><p class="item-t">Vega is your exposure</p><p class="item-d">Long options gain from rising IV. Short options gain from falling IV. Know your vega before every trade.</p></div></div>`,
  },
  {
    subject: "The psychology of drawdowns — why you overtrade after losses",
    watermark: 'Mind',
    heroH: `Drawdowns aren't<br><em>the real problem.</em>`,
    heroSub: `Your reaction to a drawdown is what determines whether you recover — or whether it becomes a catastrophic loss.`,
    labelText: 'Trading psychology',
    body: (email) => `
<p class="greeting">Hey,</p>
<p class="para">Every trader goes through drawdowns. What separates professionals from retail traders isn't that they avoid them — it's what they do when it happens.</p>
<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">The revenge trading spiral</div></div>
  <p style="font-family:'DM Serif Display',serif;font-size:18px;font-style:italic;color:#fff;line-height:1.5;margin-bottom:10px;">"One bad trade leads to a larger trade to 'make it back' — which leads to a larger loss — which leads to abandoning the strategy entirely."</p>
  <p style="font-size:11px;color:rgba(255,255,255,0.2);font-weight:300;">This cycle is the most common cause of blown accounts in retail trading.</p>
</div>
<div class="rule"></div>
<div class="next-title">Three rules for surviving drawdowns</div>
<div class="item"><div class="item-n">01</div><div><p class="item-t">Set a daily loss limit before you trade</p><p class="item-d">Decide in advance: if I lose X today, I stop. Not after it happens — before. Write it down. Automation enforces what emotion ignores.</p></div></div>
<div class="item"><div class="item-n">02</div><div><p class="item-t">Size down, not up, after losses</p><p class="item-d">Counterintuitive but critical. Drawdowns impair decision-making. Smaller size lets you stay in the game while your head clears.</p></div></div>
<div class="item"><div class="item-n">03</div><div><p class="item-t">Review before you trade again</p><p class="item-d">Was the loss from a bad setup, bad execution, or just variance? You can only know by looking at the data — not by feeling it.</p></div></div>`,
  },
  {
    subject: "Understanding the VIX — what the fear index actually tells you",
    watermark: 'VIX',
    heroH: `The VIX isn't fear.<br><em>It's expectation.</em>`,
    heroSub: `Most traders use the VIX backwards. Here's what it actually measures — and how to use it as a trading input.`,
    labelText: 'Market structure',
    body: (email) => `
<p class="greeting">Hey,</p>
<p class="para">The VIX gets called "the fear index" — but that's misleading. It's actually a <b>30-day forward-looking measure of expected S&P 500 volatility</b>, derived from options pricing.</p>
<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">VIX levels as context</div></div>
  <div class="item" style="margin-top:4px;"><div class="item-n" style="color:#00d4a8;">~12</div><div><p class="item-t" style="color:#fff;">Complacency</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Markets calm, trends strong. Mean-reversion strategies underperform. Breakouts more reliable.</p></div></div>
  <div class="item"><div class="item-n" style="color:#f59e0b;">~20</div><div><p class="item-t" style="color:#fff;">Normal range</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Historical average. Both trend and mean-reversion can work. Conditions balanced.</p></div></div>
  <div class="item"><div class="item-n" style="color:#ef4444;">30+</div><div><p class="item-t" style="color:#fff;">Elevated fear</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Options expensive, whipsaws common, gaps larger. This is when retail traders get destroyed — and pros find opportunity.</p></div></div>
</div>
<div class="rule"></div>
<div class="next-title">How to use it practically</div>
<div class="item"><div class="item-n">01</div><div><p class="item-t">Adjust position size with VIX</p><p class="item-d">High VIX = higher daily ranges = more risk per trade at the same share size. Scale down mechanically when VIX spikes.</p></div></div>
<div class="item"><div class="item-n">02</div><div><p class="item-t">VIX spikes are mean-reverting</p><p class="item-d">VIX rarely stays above 40 for long. Historically, buying quality names when VIX exceeds 35 has been one of the strongest long-term signals.</p></div></div>`,
  },
  {
    subject: "How earnings seasons affect your strategy",
    watermark: 'Earnings',
    heroH: `Earnings season<br><em>changes the rules.</em>`,
    heroSub: `Four times a year the market shifts into a different regime. Most retail traders trade it exactly the same way — and pay for it.`,
    labelText: 'Market calendar',
    body: (email) => `
<p class="greeting">Hey,</p>
<p class="para">Earnings season runs roughly January, April, July, and October. During these weeks, individual stocks can move 10–30% overnight — on results that were already priced in.</p>
<div class="dark-card">
  <div class="card-glow"></div>
  <div class="card-badge"><div class="card-badge-dot"></div><div class="card-badge-text">What changes during earnings</div></div>
  <div class="item" style="margin-top:4px;"><div class="item-n">01</div><div><p class="item-t" style="color:#fff;">IV spikes before, collapses after</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Options pricing doubles or triples before earnings. The day after, IV crashes regardless of which direction the stock moves.</p></div></div>
  <div class="item"><div class="item-n">02</div><div><p class="item-t" style="color:#fff;">Gap risk is extreme</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Stop losses don't protect you from gaps. A stock can open 20% below your stop. Overnight positions in earnings names carry undefined risk.</p></div></div>
  <div class="item"><div class="item-n">03</div><div><p class="item-t" style="color:#fff;">"Buy the rumor, sell the news" is real</p><p style="font-size:12px;color:rgba(255,255,255,0.3);font-weight:300;margin-top:2px;">Stocks that ran into earnings often sell off on good results. Expectations were already priced in. Direction is harder to call than you think.</p></div></div>
</div>
<div class="rule"></div>
<div class="next-title">Simple rules for earnings weeks</div>
<div class="item"><div class="item-n">01</div><div><p class="item-t">Know your holdings' earnings dates</p><p class="item-d">Check before every session. Holding overnight into earnings is a coin flip with asymmetric downside.</p></div></div>
<div class="item"><div class="item-n">02</div><div><p class="item-t">Reduce size, not frequency</p><p class="item-d">You don't have to sit out earnings season. But you should trade smaller on names reporting that week.</p></div></div>`,
  },
];

/**
 * Newsletter email — sent weekly after drip step 5 completes.
 * Rotates through NEWSLETTER_TOPICS based on weeksSincePhase2.
 */
function newsletter({ email, weekNumber }) {
  const topic = NEWSLETTER_TOPICS[weekNumber % NEWSLETTER_TOPICS.length];
  const body = typeof topic.body === 'function' ? topic.body(email) : topic.body;

  return shell({
    subject: topic.subject,
    headerTagline: 'Market education · Weekly',
    heroWatermark: topic.watermark,
    heroLabelText: topic.labelText,
    heroH: topic.heroH,
    heroSub: topic.heroSub,
    body: body + `
<div class="soft-strip" style="margin-top:24px;">
  <div>
    <div class="soft-strip-label">Your spot</div>
    <div class="soft-strip-desc">You're still on the CoreStep waitlist. We'll notify you the moment your slot opens — <b>no action needed</b>.</div>
  </div>
</div>`,
    signClose: 'More next Sunday,',
    signName: 'Roelisa Santos',
    signRole: 'COO & Co-Founder, CoreStep',
    footerAudience: waitlistFooter(),
    unsubscribeUrl: waitlistUnsubUrl(email),
  });
}

// ─── Drip dispatcher ────────────────────────────────────────────────────────
const DRIP_STEPS = [dripStep1, dripStep2, dripStep3, dripStep4, dripStep5];

function getDripEmail({ step, email }) {
  const fn = DRIP_STEPS[step - 1];
  if (!fn) throw new Error(`Unknown drip step: ${step}`);
  return fn({ email });
}

function getDripSubject(step) {
  const subjects = [
    "You're on the list — here's what CoreStep actually does",
    "The #1 reason traders don't improve (it's not discipline)",
    "Your P&L calendar is trying to tell you something",
    "Win rate is lying to you. Here's what actually matters.",
    "You're almost in — here's what to do on day one",
  ];
  return subjects[step - 1] || '';
}

module.exports = {
  weeklyDigest,
  quietWeek,
  reEngagement,
  getDripEmail,
  getDripSubject,
  newsletter,
  NEWSLETTER_TOPICS,
  DRIP_STEPS,
};
