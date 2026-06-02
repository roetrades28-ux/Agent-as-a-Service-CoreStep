'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const supabase = require('./src/db/supabaseAdmin');
const { runWeeklyDigest } = require('./Services/notifications/weeklyDigest');
const { runWaitlistDrip, sendWelcomeEmail } = require('./Services/notifications/waitlistDrip');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Auth middleware ─────────────────────────────────────────────────────────
// Same mvpGate pattern as main strategylab-backend
function mvpGate(req, res, next) {
  const key = req.headers['x-internal-key'];
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ service: 'CoreStep Agent-as-a-Service', status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ─── POST /api/notifications/run-weekly-digest ───────────────────────────────
// Called by Render Cron every Sunday at 5:00pm EST (0 21 * * 0 UTC summer / 0 22 * * 0 winter)
//
// Query params:
//   ?preview=true&email=you@email.com   → send only to that address, no logging
app.post('/api/notifications/run-weekly-digest', mvpGate, async (req, res) => {
  try {
    const preview = req.query.preview === 'true';
    const previewEmail = req.query.email;
    const sendTo = req.query.sendTo; // optional: deliver to a different address than previewEmail

    if (preview && !previewEmail) {
      return res.status(400).json({ error: 'preview=true requires ?email= param' });
    }

    console.log(`[server] POST /api/notifications/run-weekly-digest preview=${preview}`);
    const result = await runWeeklyDigest({ preview, previewEmail, sendTo });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[server] Weekly digest error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/notifications/run-waitlist-drip ───────────────────────────────
// Called by Render Cron every Sunday at 5:15pm EST (15 21 * * 0 UTC summer / 15 22 * * 0 winter)
//
// Query params:
//   ?preview=true&email=you@email.com         → send current step to that address
//   ?preview=true&email=you@email.com&step=3  → force a specific step (1–5, or >5 for newsletter)
app.post('/api/notifications/run-waitlist-drip', mvpGate, async (req, res) => {
  try {
    const preview = req.query.preview === 'true';
    const previewEmail = req.query.email;
    const previewStep = req.query.step ? parseInt(req.query.step, 10) : undefined;

    if (preview && !previewEmail) {
      return res.status(400).json({ error: 'preview=true requires ?email= param' });
    }

    console.log(`[server] POST /api/notifications/run-waitlist-drip preview=${preview}`);
    const result = await runWaitlistDrip({ preview, previewEmail, previewStep });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[server] Waitlist drip error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/waitlist ───────────────────────────────────────────────────────
// Public endpoint — user signs up for waitlist.
// Saves to waitlist_submissions and fires welcome email immediately.
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    // Upsert into waitlist_submissions
    const { error } = await supabase
      .from('waitlist_submissions')
      .upsert({ email, name: name || null, subscribed_at: new Date().toISOString() }, { onConflict: 'email', ignoreDuplicates: true });

    if (error) {
      console.error('[server] Waitlist insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Fire welcome email async — don't block the response
    sendWelcomeEmail(email).catch(err => console.error('[server] Welcome email error:', err));

    return res.json({ ok: true, message: 'Added to waitlist' });
  } catch (err) {
    console.error('[server] Waitlist error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/notifications/log ──────────────────────────────────────────────
// Admin view — recent sends. Protected by internal key.
app.get('/api/notifications/log', mvpGate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const type = req.query.type; // optional filter

    let query = supabase
      .from('notification_log')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (type) query = query.eq('notification_type', type);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true, count: data.length, log: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/notifications/unsubscribe ──────────────────────────────────────
// User opt-out via unsubscribe link in email footer.
// No auth required — link is in the email.
app.put('/api/notifications/unsubscribe', async (req, res) => {
  try {
    const email = req.query.email || req.body.email;
    const type = req.query.type || req.body.type; // 'digest' | 'waitlist'

    if (!email) return res.status(400).json({ error: 'email is required' });

    if (type === 'waitlist') {
      await supabase
        .from('waitlist_submissions')
        .update({ opted_out: true })
        .eq('email', email);
    } else {
      // Beta user — write to user_preferences
      const { data: user } = await supabase
        .from('app_users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (user) {
        await supabase.from('user_preferences').upsert({
          app_user_id: user.id,
          key: 'notifications.weekly_digest',
          value: false,
        }, { onConflict: 'app_user_id,key' });
      }
    }

    // Return a simple HTML confirmation page
    res.setHeader('Content-Type', 'text/html');
    return res.send(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Unsubscribed — CoreStep</title>
<style>body{font-family:Inter,sans-serif;background:#f2f0eb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.card{background:#fff;border-radius:8px;padding:48px;max-width:400px;text-align:center;border:0.5px solid #ddd9d2;}
h2{font-size:22px;color:#1a1a18;margin-bottom:12px;}
p{font-size:14px;color:#807b74;line-height:1.7;}
a{color:#00d4a8;text-decoration:none;}</style>
</head>
<body>
<div class="card">
  <h2>You've been unsubscribed.</h2>
  <p>You won't receive any more ${type === 'waitlist' ? 'waitlist' : 'weekly digest'} emails from CoreStep.<br><br>
  Changed your mind? <a href="mailto:team@corestep.app">Email us</a> and we'll re-add you.</p>
</div>
</body>
</html>`);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`\n  CoreStep Agent-as-a-Service`);
  console.log(`  Running on port ${PORT}`);
  console.log(`  Digest cron:  Sunday 5:00pm EST → POST /api/notifications/run-weekly-digest`);
  console.log(`  Drip cron:    Sunday 5:15pm EST → POST /api/notifications/run-waitlist-drip\n`);
});
