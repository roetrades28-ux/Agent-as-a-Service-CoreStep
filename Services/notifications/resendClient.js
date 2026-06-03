'use strict';
const { Resend } = require('resend');

let _client = null;

function getResendClient() {
  if (!_client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }
    _client = new Resend(process.env.RESEND_API_KEY);
  }
  return _client;
}

const FROM = `${process.env.NOTIFICATIONS_FROM_NAME || 'CoreStep TradingLab'} <${process.env.NOTIFICATIONS_FROM_EMAIL || 'ralle@corestep.app'}>`;

/**
 * Send an email via Resend.
 * @param {object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 * @returns {Promise<{id: string}>}
 */
async function sendEmail({ to, subject, html, attachments }) {
  const resend = getResendClient();
  const payload = { from: FROM, to, subject, html };
  if (attachments && attachments.length > 0) payload.attachments = attachments;
  const { data, error } = await resend.emails.send(payload);
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  return data;
}

module.exports = { sendEmail };
