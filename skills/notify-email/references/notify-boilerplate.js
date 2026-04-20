// notify.js — Run this after your agent task completes
// Usage: node notify.js
// Or: gemini "do the task" && node notify.js

const nodemailer = require('nodemailer');

const SENDER     = '{{SENDER_EMAIL}}';
const RECEIVER   = '{{RECEIVER_EMAIL}}';
const APP_PASS   = '{{APP_PASSWORD}}';
const AGENT_NAME = '{{AGENT_NAME}}';
const BRAND_COLOR= '{{BRAND_COLOR}}';
const LOGO_URL   = '{{LOGO_URL}}';
const TIMESTAMP  = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

const htmlTemplate = `{{HTML_TEMPLATE}}`;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER,
    pass: APP_PASS,
  },
});

transporter.sendMail({
  from: `"${AGENT_NAME} Notifier" <${SENDER}>`,
  to: RECEIVER,
  subject: `✅ ${AGENT_NAME} — Task Complete`,
  html: htmlTemplate,
}, (err, info) => {
  if (err) {
    console.error('❌ Failed to send email:', err.message);
    process.exit(1);
  }
  console.log(`✅ Notification sent to ${RECEIVER}`);
  console.log(`   Message ID: ${info.messageId}`);
});
