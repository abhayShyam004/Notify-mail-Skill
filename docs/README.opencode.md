# OpenCode Instructions for Notify Email Skill

When using Notify Email with OpenCode:

1.  **Link Plugin:** Symlink the `.opencode` directory into your project's `.opencode/plugins/` folder.
2.  **Configuration:** Configure email settings at `~/.notify-email/config.json`.
3.  **Command:** Run `opencode notify-email` if available, or trigger the node script directly.

## Installation Example

```bash
ln -s /path/to/notify-email-skill-repo/.opencode ~/.opencode/plugins/notify-email
```
