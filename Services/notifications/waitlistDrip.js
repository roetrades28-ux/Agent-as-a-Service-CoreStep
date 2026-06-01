'use strict';
require('dotenv').config();
const supabase = require('../../src/db/supabaseAdmin');
const { sendEmail } = require('./resendClient');
const { getDripEmail, getDripSubject, newsletter } = require('./emailTemplates');

// Days to wait between each drip step
const DRIP_SCHEDULE = {
  0: 0,   // step 1 sent immediately on signup (handled in server.js)
  1: 7,   // step 2 sent 7 days after step 1
  2: 14,  // step 3 sent 14 days after step 2 (21 days total)
  3: 14,  // step 4 sent 14 days after step 3 (35 days total)
  4: 7,   // step 5 sent 7 days after step 4  (42 days total)
};

// After step 5: weekly newsletter every 7 days
const NEWSLETTER_INTERVAL_DAYS = 7;

function daysSince(date) {
  if (!date) return Infinity;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

async function logSend({ email, step, type, status, metadata }) {
  await supabase.from('notification_log').insert({
    recipient_email: email,
    recipient_type: 'waitlist',
    notification_type: type,
    sequence_step: step,
    status,
    metadata: metadata || {},
  });
}

async function processSubscriber(sub, { preview = false } = {}) {
  const { email, drip_step, opted_out, subscribed_at, last_sent_at, phase2_started_at } = sub;

  if (opted_out) return { email, status: 'skipped', reason: 'opted_out' };

  // ── Phase 1: onboarding sequence (steps 1–5) ────────────────────────────
  if (drip_step < 5) {
    const nextStep = drip_step + 1;
    const daysRequired = DRIP_SCHEDULE[drip_step] || 7;
    const referenceDate = last_sent_at || subscribed_at;
    const daysElapsed = daysSince(referenceDate);

    if (daysElapsed < daysRequired) {
      return { email, status: 'skipped', reason: `waiting (${daysElapsed}/${daysRequired} days)` };
    }

    const html = getDripEmail({ step: nextStep, email });
    const subject = getDripSubject(nextStep);

    try {
      await sendEmail({ to: email, subject, html });

      if (!preview) {
        // Increment drip_step and set phase2_started_at when reaching step 5
        const update = {
          drip_step: nextStep,
          last_sent_at: new Date().toISOString(),
        };
        if (nextStep === 5) {
          update.phase2_started_at = new Date().toISOString();
        }
        await supabase.from('waitlist_submissions').update(update).eq('email', email);
        await logSend({ email, step: nextStep, type: 'waitlist_drip', status: 'sent' });
      }

      console.log(`[WaitlistDrip] ✓ Step ${nextStep} → ${email}`);
      return { email, status: 'sent', step: nextStep };
    } catch (err) {
      console.error(`[WaitlistDrip] ✗ Step ${nextStep} failed for ${email}:`, err.message);
      if (!preview) await logSend({ email, step: nextStep, type: 'waitlist_drip', status: 'failed', metadata: { error: err.message } });
      return { email, status: 'failed', step: nextStep, error: err.message };
    }
  }

  // ── Phase 2: ongoing weekly newsletter (after step 5) ───────────────────
  const daysElapsed = daysSince(last_sent_at || phase2_started_at);
  if (daysElapsed < NEWSLETTER_INTERVAL_DAYS) {
    return { email, status: 'skipped', reason: `newsletter waiting (${daysElapsed}/${NEWSLETTER_INTERVAL_DAYS} days)` };
  }

  // Calculate which newsletter topic to send based on weeks since phase 2 started
  const weeksSincePhase2 = Math.floor(daysSince(phase2_started_at) / 7);
  const html = newsletter({ email, weekNumber: weeksSincePhase2 });

  // Derive subject from the topic that newsletter() selected
  const { NEWSLETTER_TOPICS } = require('./emailTemplates');
  const topic = NEWSLETTER_TOPICS[weeksSincePhase2 % NEWSLETTER_TOPICS.length];
  const subject = topic.subject;

  try {
    await sendEmail({ to: email, subject, html });

    if (!preview) {
      await supabase.from('waitlist_submissions')
        .update({ last_sent_at: new Date().toISOString() })
        .eq('email', email);
      await logSend({ email, step: 5, type: 'waitlist_newsletter', status: 'sent', metadata: { weekNumber: weeksSincePhase2 } });
    }

    console.log(`[WaitlistDrip] ✓ Newsletter week ${weeksSincePhase2} → ${email}`);
    return { email, status: 'sent', type: 'newsletter', weekNumber: weeksSincePhase2 };
  } catch (err) {
    console.error(`[WaitlistDrip] ✗ Newsletter failed for ${email}:`, err.message);
    if (!preview) await logSend({ email, type: 'waitlist_newsletter', status: 'failed', metadata: { error: err.message } });
    return { email, status: 'failed', type: 'newsletter', error: err.message };
  }
}

/**
 * Run waitlist drip for all eligible subscribers.
 * @param {object} opts
 * @param {boolean} [opts.preview]
 * @param {string}  [opts.previewEmail]
 * @param {number}  [opts.previewStep] — force a specific step in preview
 */
async function runWaitlistDrip({ preview = false, previewEmail, previewStep } = {}) {
  console.log(`[WaitlistDrip] Starting run — preview=${preview}`);

  if (preview && previewEmail) {
    // Build a fake subscriber object for preview
    const fakeSub = {
      email: previewEmail,
      drip_step: previewStep ? previewStep - 1 : 0,
      opted_out: false,
      subscribed_at: new Date(Date.now() - 99 * 86400000).toISOString(), // 99 days ago → always eligible
      last_sent_at: new Date(Date.now() - 99 * 86400000).toISOString(),
      phase2_started_at: previewStep > 5 ? new Date(Date.now() - 30 * 86400000).toISOString() : null,
    };
    const result = await processSubscriber(fakeSub, { preview: true });
    return { results: [result] };
  }

  // Fetch all non-opted-out waitlist subscribers
  const { data: subs, error } = await supabase
    .from('waitlist_submissions')
    .select('email, drip_step, opted_out, subscribed_at, last_sent_at, phase2_started_at')
    .eq('opted_out', false);

  if (error) throw new Error(`Failed to fetch waitlist: ${error.message}`);

  const results = [];
  for (const sub of subs) {
    if (results.length > 0) await new Promise(r => setTimeout(r, 200));
    const result = await processSubscriber(sub);
    results.push(result);
  }

  const sent = results.filter(r => r.status === 'sent').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const failed = results.filter(r => r.status === 'failed').length;
  console.log(`[WaitlistDrip] Done — sent:${sent} skipped:${skipped} failed:${failed}`);
  return { results, summary: { sent, skipped, failed } };
}

/**
 * Send step 1 immediately when a new user joins the waitlist.
 * Called from server.js POST /api/waitlist handler.
 */
async function sendWelcomeEmail(email) {
  try {
    const html = getDripEmail({ step: 1, email });
    const subject = getDripSubject(1);
    await sendEmail({ to: email, subject, html });
    await supabase.from('waitlist_submissions').update({
      drip_step: 1,
      last_sent_at: new Date().toISOString(),
      subscribed_at: new Date().toISOString(),
    }).eq('email', email);
    await logSend({ email, step: 1, type: 'waitlist_drip', status: 'sent' });
    console.log(`[WaitlistDrip] ✓ Welcome email → ${email}`);
  } catch (err) {
    console.error(`[WaitlistDrip] ✗ Welcome email failed for ${email}:`, err.message);
  }
}

module.exports = { runWaitlistDrip, sendWelcomeEmail };
