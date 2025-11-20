require('dotenv').config();

const nodemailer = require('nodemailer');

let transporter;

/**
 * Initialize or return existing transporter
 */
function getTransporter() {
  if (transporter) return transporter;

  // Use environment variables for config
  const host = process.env.EMAIL_HOST || 'localhost';
  const port = parseInt(process.env.EMAIL_PORT || '1025', 10);
  const secure = process.env.EMAIL_SECURE === 'true'; // true for TLS
  const user = process.env.EMAIL_USER || null;
  const pass = process.env.EMAIL_PASS || null;

  const auth = user && pass ? { user, pass } : undefined;

  transporter = nodemailer.createTransport({ host, port, secure, auth });
  return transporter;
}

/**
 * Send email
 * @param {string} to - recipient
 * @param {string} subject - email subject
 * @param {string} text - plain text content
 * @param {string} html - optional HTML content
 */
async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
  };

  return t.sendMail(mailOptions);
}

module.exports = { sendMail, getTransporter };
