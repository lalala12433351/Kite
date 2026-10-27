import nodemailer from 'nodemailer';

function transport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendFormMail({ subject, replyTo, replyName, lines }) {
  const mailer = transport();
  if (!mailer) {
  const error = new Error('Email is not configured') as Error & { status?: number };
    error.status = 503;
    throw error;
  }
  const to = process.env.MAIL_TO || process.env.SMTP_USER;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const text = lines.map(([label, value]) => `${label}: ${value || ''}`).join('\n');
  const html = lines
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`)
    .join('');
  await mailer.sendMail({
    from,
    to,
    replyTo: replyTo ? { address: replyTo, name: replyName || replyTo } : undefined,
    subject,
    text,
    html: `<html><body style="font-family:Arial,sans-serif;font-size:14px;">${html}</body></html>`,
  });
}
