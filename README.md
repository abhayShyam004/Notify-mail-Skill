# Notify Email Skill

Notify Email is a professional, company-grade notification system for your coding agents (Claude Code, Codex, Gemini CLI, OpenCode). It sends beautiful HTML email notifications via Nodemailer after agent tasks complete or when files are edited, keeping you informed of your AI's progress without needing to watch the terminal.

## How it works

The Notify Email skill integrates into your agent's workflow to provide automated status updates. It's designed to be silent, efficient, and professional.

1.  **Task Completion:** When your agent finishes a long-running task, it automatically sends a detailed HTML summary to your inbox.
2.  **File Watcher:** Optionally, it can notify you whenever specific files are modified by the agent.
3.  **Cross-Agent Support:** Works seamlessly across Claude Code, Gemini CLI, Codex, and OpenCode by using a unified global configuration.
4.  **Security First:** Credentials are stored securely in your home directory, never in the project repository.

## Installation

### 1. Global Setup (Prerequisite)

Before using the skill with any agent, you need to configure your email settings.

```bash
# Create the config directory
mkdir -p ~/.notify-email

# Create the global configuration file
cat <<EOF > ~/.notify-email/config.json
{
  "sender": "your-gmail@gmail.com",
  "receiver": "your-notifications@email.com",
  "appPassword": "your-gmail-app-password",
  "enabled": true
}
EOF
```

*Note: For Gmail, you must use an [App Password](https://myaccount.google.com/apppasswords). 2FA must be enabled on your Google account.*

### 2. Agent-Specific Installation

#### Claude Code

Install the skill using the `Skill` tool or by adding the skill directory to your Claude skills path.

```bash
/skill install notify-email
```

#### Gemini CLI

Activate the skill using the `activate_skill` tool.

```bash
/activate_skill name="notify-email"
```

#### Codex

Add the skill to your `.codex/skills/` directory or include it in your `AGENTS.md` configuration.

#### OpenCode

Follow the standard OpenCode plugin installation process by linking the `.opencode` directory.

## Features

- **Beautiful Templates:** Professional HTML emails with agent-specific branding.
- **Auto-Detection:** Automatically detects which agent is sending the notification.
- **Configurable:** Easy to enable/disable or change recipients via `~/.notify-email/config.json`.
- **Minimalistic:** Does not clutter your workspace with unnecessary files.

## Development & Testing

The repository structure follows the "Superpowers" standard for agent skills:

- `skills/notify-email/`: The core logic and `SKILL.md`.
- `agents/`: Agent-specific adapters and prompts.
- `scripts/`: Supporting scripts for installation and notification.
- `tests/`: Automated tests for the notification logic.

## License

MIT License - see [LICENSE](LICENSE) for details.

---
Built with ❤️ for the AI Engineering community.
# Notify-mail-Skill
