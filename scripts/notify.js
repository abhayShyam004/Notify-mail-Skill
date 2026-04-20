// notify.js — Run this after your agent task completes
// Usage: node notify.js
// Or: gemini "do the task" && node notify.js

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Load config from home directory
const configPath = path.join(os.homedir(), '.notify-email', 'config.json');
let config = {};

try {
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    console.error(`❌ Config file not found at ${configPath}`);
    console.error('Please run the installation step described in README.md');
    process.exit(1);
  }
} catch (err) {
  console.error(`❌ Error reading config: ${err.message}`);
  process.exit(1);
}

const SENDER     = config.sender;
const RECEIVER   = config.receiver;
const APP_PASS   = config.appPassword;
const AGENT_NAME = process.env.AGENT_NAME || 'Coding Agent';
const BRAND_COLOR= process.env.BRAND_COLOR || '#1B72E8';
const LOGO_URL   = process.env.LOGO_URL || 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg';
const TIMESTAMP  = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

if (!SENDER || !RECEIVER || !APP_PASS) {
  console.error('❌ Missing required configuration (sender, receiver, or appPassword).');
  process.exit(1);
}

if (!config.enabled) {
  console.log('ℹ️ Notifications are disabled in config. Skipping.');
  process.exit(0);
}

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Task Complete</title>
</head>
<body style="margin:0;padding:0;background-color:#0D0D0D;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#141414;border:0.5px solid rgba(255,255,255,0.08);max-width:580px;width:100%;">

          <!-- Header with agent branding -->
          <tr>
            <td style="background:${BRAND_COLOR};padding:32px 40px;text-align:left;">
              <img src="${LOGO_URL}" width="36" height="36" alt="${AGENT_NAME}" 
                   style="vertical-align:middle;margin-right:12px;border-radius:6px;" />
              <span style="color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;vertical-align:middle;">
                ${AGENT_NAME}
              </span>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:48px 40px 32px;">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-family:monospace;">
                Task Status
              </p>
              <h1 style="margin:0 0 24px;color:#EBEBEB;font-size:32px;font-weight:700;line-height:1.1;letter-spacing:-0.02em;">
                Implementation<br/>Complete ✓
              </h1>
              <p style="margin:0 0 32px;color:rgba(235,235,235,0.6);font-size:15px;line-height:1.65;">
                Your agent has finished the task and exited cleanly. 
                Everything ran as expected.
              </p>

              <!-- Divider -->
              <div style="height:0.5px;background:rgba(255,255,255,0.08);margin-bottom:32px;"></div>

              <!-- Meta info -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <span style="color:rgba(255,255,255,0.35);font-size:11px;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;">Agent</span><br/>
                    <span style="color:#EBEBEB;font-size:14px;font-family:monospace;margin-top:4px;display:inline-block;">${AGENT_NAME}</span>
                  </td>
                  <td style="padding-bottom:16px;">
                    <span style="color:rgba(255,255,255,0.35);font-size:11px;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;">Completed At</span><br/>
                    <span style="color:#EBEBEB;font-size:14px;font-family:monospace;margin-top:4px;display:inline-block;">${TIMESTAMP}</span>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height:0.5px;background:rgba(255,255,255,0.08);margin:16px 0 32px;"></div>

              <p style="margin:0;color:rgba(235,235,235,0.35);font-size:12px;line-height:1.6;">
                This is an automated notification sent by your local agent workflow.<br/>
                You're receiving this because you set up notify.js.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:0.5px solid rgba(255,255,255,0.06);">
              <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;font-family:monospace;letter-spacing:0.08em;">
                SENT VIA NOTIFY.JS — ${AGENT_NAME} WORKFLOW
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

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
