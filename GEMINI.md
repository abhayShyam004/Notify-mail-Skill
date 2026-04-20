# Gemini CLI Instructions for Notify Email Skill

When working with this skill in Gemini CLI:

1.  **Activate:** Always use `activate_skill name="notify-email"` to load the skill metadata and instructions.
2.  **Configuration:** The skill reads from `~/.notify-email/config.json`. Do not attempt to read or write this file within the project directory.
3.  **Proactive Notifications:** If enabled, this skill expects you to send a notification after significant file edits or task completion.
4.  **No Credentials:** Never ask the user for credentials. Use the global config.

## Example Usage

```bash
/activate_skill name="notify-email"
# ... perform task ...
# The skill logic will guide you on when to call the notification script.
```
