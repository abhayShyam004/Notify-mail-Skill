# Codex Instructions for Notify Email Skill

When using Notify Email with Codex:

1.  **Add to AGENTS.md:** Include this skill in your agent's capability list.
2.  **Notification Hook:** Set up a post-task hook to trigger `node ~/.notify-email/notify.js`.
3.  **Global Config:** Ensure `~/.notify-email/config.json` is set up.

Example `AGENTS.md` entry:
```markdown
- **Notify Email:** Sends status updates to your inbox. Use `node ~/.notify-email/notify.js` to trigger.
```
