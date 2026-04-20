---
name: notify-email
description: >
  Send professional, company-grade HTML email notifications via Nodemailer after agent tasks 
  complete or when files are edited. Trigger this skill when: user mentions "notify me", 
  "email me when done", "send completion email", "notify when file is touched", OR at the START 
  of any task if the user previously requested notifications. Also triggers proactively after 
  EVERY file edit/creation unless disabled. NEVER ask for credentials or agent identity — 
  read from global config. NEVER wait until reminded.
---

# Notify Email Skill

## Core Rules (Read First)

1. **NEVER ask for credentials.** Stored globally at `~/.notify-email/config.json`. Read from there.
2. **NEVER ask which agent is running.** Auto-detect from environment (see Agent Detection).
3. **NEVER wait to be reminded.** If ON and task completes or file is touched → send immediately.
4. **ONE global notify.js** at `~/.notify-email/notify.js`. Call from anywhere. No per-project copies.
5. **Respect the toggle.** `"enabled": false` → exit silently, never crash the task.

---

## Installation (One-Time Only)

Run only when user says "install notify-email" or `~/.notify-email/config.json` does not exist.

### Ask credentials (only during install)

```
Setting up notify-email globally — you'll never be asked this again.

1. Sender Gmail address?
2. Receiver email? (can be the same)
3. Gmail App Password? → myaccount.google.com/apppasswords (requires 2FA on your Google account)
```

### Write global config

```bash
mkdir -p ~/.notify-email
```

`~/.notify-email/config.json`:
```json
{
  "sender": "<SENDER_EMAIL>",
  "receiver": "<RECEIVER_EMAIL>",
  "appPassword": "<APP_PASSWORD>",
  "enabled": true,
  "notifyOnFileTouch": true,
  "notifyOnTaskComplete": true,
  "timezone": "Asia/Kolkata"
}
```

### Install nodemailer

```bash
cd ~/.notify-email && npm init -y && npm install nodemailer
```

### Write global notify.js

`~/.notify-email/notify.js` — copy this exactly:

```js
#!/usr/bin/env node
// ~/.notify-email/notify.js
// node ~/.notify-email/notify.js --event task_complete --detail "Built auth module" --agent claude
// node ~/.notify-email/notify.js --event file_touch   --detail "/abs/path/file.py"  --agent gemini

const nodemailer = require('nodemailer');
const path = require('path');
const fs   = require('fs');
const os   = require('os');

// ── Config ──────────────────────────────────────────────────────────────────
const configPath = path.join(os.homedir(), '.notify-email', 'config.json');
if (!fs.existsSync(configPath)) { console.error('notify-email: run install first'); process.exit(0); }
const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (!cfg.enabled) process.exit(0);

// ── Args ────────────────────────────────────────────────────────────────────
const args   = process.argv.slice(2);
const get    = f => { const i = args.indexOf(f); return i !== -1 ? args[i+1] : null; };
const event  = get('--event')  || 'task_complete';
const detail = get('--detail') || '';
const agentArg = get('--agent') || detectAgent();

if (event === 'file_touch'    && !cfg.notifyOnFileTouch)    process.exit(0);
if (event === 'task_complete' && !cfg.notifyOnTaskComplete) process.exit(0);

// ── Agent Detection ─────────────────────────────────────────────────────────
function detectAgent() {
  if (process.env.CLAUDE_CODE_ENTRYPOINT || process.env.CLAUDE_CODE) return 'claude';
  if (process.env.GEMINI_CLI || process.env.GOOGLE_GENAI_API_KEY)    return 'gemini';
  if (process.env.OPENAI_API_KEY)   return 'openai';
  if (process.env.COPILOT_LANGUAGE_SERVER_PATH) return 'copilot';
  const p = process.env.npm_lifecycle_script || '';
  if (p.includes('gemini')) return 'gemini';
  if (p.includes('claude')) return 'claude';
  return process.env.AGENT_NAME || 'agent';
}

// ── Brand definitions ────────────────────────────────────────────────────────
// Each brand has:
//   color      → header background (matches real brand)
//   textColor  → header text color
//   name       → display name
//   logoSvg    → inline SVG string (never fails to load, no external img)
//   footerName → footer label

const BRANDS = {
  claude: {
    color: '#CC785C',
    textColor: '#FFFFFF',
    name: 'Claude Code',
    footerName: 'CLAUDE CODE · ANTHROPIC',
    // Anthropic/Claude logomark — stylized A
    logoSvg: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#CC785C"/>
      <path d="M16 7L23.5 22H8.5L16 7Z" fill="white" opacity="0.95"/>
      <path d="M13 18H19" stroke="#CC785C" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  gemini: {
    color: '#1A1A2E',
    textColor: '#FFFFFF',
    name: 'Gemini CLI',
    footerName: 'GEMINI CLI · GOOGLE',
    // Gemini sparkle mark — 4-point star, official shape
    logoSvg: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#1A1A2E"/>
      <path d="M16 4 C16 4 17.5 12 24 16 C17.5 20 16 28 16 28 C16 28 14.5 20 8 16 C14.5 12 16 4 16 4Z"
        fill="url(#gem_grad)"/>
      <defs>
        <linearGradient id="gem_grad" x1="8" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#4285F4"/>
          <stop offset="50%" stop-color="#9B72CB"/>
          <stop offset="100%" stop-color="#EA4335"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
  gemini_cli: {  // alias
    color: '#1A1A2E',
    textColor: '#FFFFFF',
    name: 'Gemini CLI',
    footerName: 'GEMINI CLI · GOOGLE',
    logoSvg: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#1A1A2E"/>
      <path d="M16 4 C16 4 17.5 12 24 16 C17.5 20 16 28 16 28 C16 28 14.5 20 8 16 C14.5 12 16 4 16 4Z"
        fill="url(#gem_grad2)"/>
      <defs>
        <linearGradient id="gem_grad2" x1="8" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#4285F4"/>
          <stop offset="50%" stop-color="#9B72CB"/>
          <stop offset="100%" stop-color="#EA4335"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
  openai: {
    color: '#000000',
    textColor: '#FFFFFF',
    name: 'OpenAI Agent',
    footerName: 'OPENAI AGENT · OPENAI',
    logoSvg: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#000000"/>
      <circle cx="16" cy="16" r="8" stroke="white" stroke-width="1.5" fill="none"/>
      <circle cx="16" cy="16" r="3" fill="white"/>
    </svg>`,
  },
  copilot: {
    color: '#0078D4',
    textColor: '#FFFFFF',
    name: 'GitHub Copilot',
    footerName: 'GITHUB COPILOT · MICROSOFT',
    logoSvg: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#0078D4"/>
      <circle cx="16" cy="13" r="5" fill="white" opacity="0.9"/>
      <rect x="10" y="20" width="12" height="5" rx="2.5" fill="white" opacity="0.9"/>
    </svg>`,
  },
};

const b = BRANDS[agentArg.toLowerCase().replace(/[\s\-]/g, '_')] || {
  color: '#111111',
  textColor: '#FFFFFF',
  name: agentArg,
  footerName: agentArg.toUpperCase() + ' · AI AGENT',
  logoSvg: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#111111"/>
    <text x="16" y="21" text-anchor="middle" font-size="18" fill="#C8FF00">⚡</text>
  </svg>`,
};

// ── Content ─────────────────────────────────────────────────────────────────
const isFileTouch = event === 'file_touch';
const ts = new Date().toLocaleString('en-IN', {
  timeZone: cfg.timezone || 'Asia/Kolkata',
  weekday: 'short', year: 'numeric', month: 'short',
  day: 'numeric', hour: '2-digit', minute: '2-digit'
});
const subject = isFileTouch
  ? `[${b.name}] File modified — ${path.basename(detail)}`
  : `[${b.name}] Task completed successfully`;

// ── Email HTML ───────────────────────────────────────────────────────────────
// Professional transactional email layout — company-grade
// Tested pattern: 600px centered, table-based for email client compat
const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>${subject}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
  img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
  body{height:100%!important;margin:0!important;padding:0!important;width:100%!important}
  a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}
  @media screen and (max-width:600px){
    .email-container{width:100%!important;margin:auto!important}
    .stack-on-mobile{display:block!important;width:100%!important}
    .mobile-pad{padding:24px 20px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F5;">

<!-- Preheader (hidden preview text) -->
<div style="display:none;max-height:0;overflow:hidden;color:#F4F4F5;">
  ${isFileTouch ? `File modified: ${detail}` : `Task completed by ${b.name} — ${detail}`}
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
  style="background-color:#F4F4F5;padding:40px 0;">
  <tr>
    <td align="center">

      <!-- Email container -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600"
        class="email-container"
        style="max-width:600px;width:100%;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

        <!-- ═══ HEADER ═══ -->
        <tr>
          <td style="background-color:${b.color};padding:24px 40px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="vertical-align:middle;" width="44">
                  ${b.logoSvg}
                </td>
                <td style="vertical-align:middle;padding-left:12px;">
                  <span style="color:${b.textColor};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;letter-spacing:-0.01em;">${b.name}</span><br/>
                  <span style="color:${b.textColor};font-family:'SF Mono','Fira Code','Consolas',monospace;font-size:10px;opacity:0.6;letter-spacing:0.06em;text-transform:uppercase;">Automated Notification</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ═══ STATUS BANNER ═══ -->
        <tr>
          <td style="background-color:${isFileTouch ? '#F0FDF4' : '#F0FDF4'};border-bottom:1px solid ${isFileTouch ? '#BBF7D0' : '#BBF7D0'};padding:16px 40px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;padding-right:10px;">
                  <span style="font-size:20px;">${isFileTouch ? '📝' : '✅'}</span>
                </td>
                <td style="vertical-align:middle;">
                  <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:${isFileTouch ? '#15803D' : '#15803D'};">
                    ${isFileTouch ? 'File Modified' : 'Task Completed Successfully'}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ═══ BODY ═══ -->
        <tr>
          <td class="mobile-pad" style="padding:40px 40px 32px;">

            <!-- Heading -->
            <h1 style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.02em;line-height:1.2;">
              ${isFileTouch ? path.basename(detail) : 'Implementation Complete'}
            </h1>
            <p style="margin:0 0 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;color:#6B7280;line-height:1.6;">
              ${isFileTouch
                ? `${b.name} wrote changes to the file below.`
                : `${b.name} has finished the task and exited cleanly.`}
            </p>

            <!-- Detail card -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
              style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;margin-bottom:32px;">
              <tr>
                <td style="padding:6px 16px;border-bottom:1px solid #E5E7EB;">
                  <span style="font-family:'SF Mono','Fira Code','Consolas',monospace;font-size:10px;color:#9CA3AF;letter-spacing:0.1em;text-transform:uppercase;">
                    ${isFileTouch ? 'File Path' : 'Summary'}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;">
                  <span style="font-family:'SF Mono','Fira Code','Consolas',monospace;font-size:13px;color:#111827;word-break:break-all;line-height:1.6;">
                    ${detail || '—'}
                  </span>
                </td>
              </tr>
            </table>

            <!-- Meta grid -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
              style="border-top:1px solid #F3F4F6;padding-top:24px;">
              <tr>
                <td class="stack-on-mobile" style="vertical-align:top;padding-right:24px;padding-bottom:16px;">
                  <p style="margin:0 0 4px;font-family:'SF Mono','Fira Code','Consolas',monospace;font-size:10px;color:#9CA3AF;letter-spacing:0.1em;text-transform:uppercase;">Agent</p>
                  <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#374151;font-weight:500;">${b.name}</p>
                </td>
                <td class="stack-on-mobile" style="vertical-align:top;padding-bottom:16px;">
                  <p style="margin:0 0 4px;font-family:'SF Mono','Fira Code','Consolas',monospace;font-size:10px;color:#9CA3AF;letter-spacing:0.1em;text-transform:uppercase;">Timestamp</p>
                  <p style="margin:0;font-family:'SF Mono','Fira Code','Consolas',monospace;font-size:13px;color:#374151;">${ts}</p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ═══ DIVIDER ═══ -->
        <tr>
          <td style="padding:0 40px;">
            <div style="height:1px;background:#F3F4F6;"></div>
          </td>
        </tr>

        <!-- ═══ FOOTER ═══ -->
        <tr>
          <td style="padding:20px 40px 28px;">
            <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#9CA3AF;line-height:1.5;">
              This is an automated notification from your local agent workflow.
              You're receiving this because <strong>notify-email</strong> is installed and enabled.
            </p>
            <p style="margin:4px 0 0;font-family:'SF Mono','Fira Code','Consolas',monospace;font-size:10px;color:#D1D5DB;letter-spacing:0.06em;text-transform:uppercase;">
              ${b.footerName}
            </p>
          </td>
        </tr>

      </table>
      <!-- /Email container -->

      <!-- Below-email note -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600"
        class="email-container" style="max-width:600px;width:100%;margin-top:12px;">
        <tr>
          <td align="center" style="padding:0 40px;">
            <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;color:#9CA3AF;margin:0;">
              To disable: <code style="font-family:monospace;background:#E5E7EB;padding:1px 5px;border-radius:3px;">node ~/.notify-email/toggle.js off</code>
            </p>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>

</body>
</html>`;

// ── Send ─────────────────────────────────────────────────────────────────────
nodemailer.createTransport({
  service: 'gmail',
  auth: { user: cfg.sender, pass: cfg.appPassword },
}).sendMail({
  from: `"${b.name} Notifier" <${cfg.sender}>`,
  to: cfg.receiver,
  subject,
  html,
}, (err) => {
  if (err) { console.error('notify-email error:', err.message); process.exit(0); }
  console.log(`📧 Sent → ${cfg.receiver} [${event}]`);
});
```

### Write toggle.js

`~/.notify-email/toggle.js`:
```js
#!/usr/bin/env node
const fs = require('fs'), os = require('os'), path = require('path');
const p = path.join(os.homedir(), '.notify-email', 'config.json');
const c = JSON.parse(fs.readFileSync(p));
const cmd = process.argv[2];
const map = {
  'off':       () => { c.enabled = false;               console.log('🔕 Notifications OFF'); },
  'on':        () => { c.enabled = true;                console.log('🔔 Notifications ON');  },
  'files-off': () => { c.notifyOnFileTouch = false;     console.log('🔕 File-touch emails OFF'); },
  'files-on':  () => { c.notifyOnFileTouch = true;      console.log('🔔 File-touch emails ON');  },
  'task-off':  () => { c.notifyOnTaskComplete = false;   console.log('🔕 Task-complete emails OFF'); },
  'task-on':   () => { c.notifyOnTaskComplete = true;    console.log('🔔 Task-complete emails ON');  },
};
if (map[cmd]) { map[cmd](); fs.writeFileSync(p, JSON.stringify(c, null, 2)); }
else console.log('Usage: node toggle.js [on|off|files-on|files-off|task-on|task-off]');
```

Confirm to user after install:
```
✅ notify-email installed globally at ~/.notify-email/
   Credentials stored once — never asked again.

Toggles:
  node ~/.notify-email/toggle.js off        → all notifications off
  node ~/.notify-email/toggle.js files-off  → file-touch emails off
  node ~/.notify-email/toggle.js task-off   → task-complete emails off

Test:
  node ~/.notify-email/notify.js --event task_complete --detail "Hello from notify-email" --agent claude
```

---

## Agent Auto-Detection

Never ask the user. The `detectAgent()` function in notify.js checks env vars in order:

| Env var | Agent |
|---|---|
| `CLAUDE_CODE_ENTRYPOINT` or `CLAUDE_CODE` | claude |
| `GEMINI_CLI` or `GOOGLE_GENAI_API_KEY` | gemini |
| `OPENAI_API_KEY` | openai |
| `COPILOT_LANGUAGE_SERVER_PATH` | copilot |
| `AGENT_NAME` (user-set) | custom |
| fallback | "agent" |

---

## Brand Reference

| Agent key | Header BG | Logo style |
|---|---|---|
| `claude` | `#CC785C` (Anthropic copper) | Stylized A mark, white |
| `gemini` / `gemini_cli` | `#1A1A2E` (dark navy) | 4-point Gemini sparkle, blue→purple→red gradient |
| `openai` | `#000000` | Circle mark, white |
| `copilot` | `#0078D4` (Microsoft blue) | Copilot silhouette |
| unknown | `#111111` | ⚡ emoji |

All logos are **inline SVG** — no external CDN, no broken images in email clients.

---

## When to Fire Notifications

### After every file write / edit
After any `write_file`, `create_file`, `str_replace`, `edit_file` tool call:
```bash
node ~/.notify-email/notify.js --event file_touch --detail "<absolute_path>" --agent <detected>
```

### After task completes
After the final step of any task:
```bash
node ~/.notify-email/notify.js --event task_complete --detail "<one-line summary>" --agent <detected>
```

### If user said "notify me when done" at task start
Note the intent. Send `task_complete` immediately when task finishes. **Never wait for the user to remind you.**

---

## Toggle Natural Language

| User says | Command |
|---|---|
| "turn off notifications" / "notify off" | `node ~/.notify-email/toggle.js off` |
| "turn on" / "notify on" | `node ~/.notify-email/toggle.js on` |
| "stop file-touch emails" | `node ~/.notify-email/toggle.js files-off` |
| "only task-complete emails" | `node ~/.notify-email/toggle.js files-off` |
| "stop task emails" | `node ~/.notify-email/toggle.js task-off` |

---

## Error Safety

- Config missing → `process.exit(0)` — never crash task
- Send fails → log error, `process.exit(0)` — never crash task
- `enabled: false` → `process.exit(0)` silently
- notify.js **must never** block or interrupt the parent agent task
