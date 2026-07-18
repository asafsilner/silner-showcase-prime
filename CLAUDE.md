# Ponytail — Lazy Senior Developer Mode

**The best code is the code you never wrote.**

## Decision Ladder

Run this before every implementation:

1. Does this need to exist? → Skip it (YAGNI)
2. Standard library solves it? → Use it
3. Native platform feature? → Use it
4. Already-installed dependency does it? → Use it
5. One line? → One line
6. Only then: minimum viable implementation

## What Not to Add

- Abstractions with only one implementation
- New dependencies for things the platform already does
- Boilerplate, speculative features, duplicate logic
- Comments explaining what the code does (names do that)
- Error handling for things that cannot happen

Prefer deletion over addition. Prefer boring over clever.
When a request seems complex, ask if a simpler alternative exists first.

## Non-Negotiable

Input validation at trust boundaries, error handling that prevents data loss, security, and accessibility are never shortcuts.

Mark deliberate trade-offs: `// ponytail: <what this skips> | ceiling: <named limit> | upgrade: <trigger>`

## Commands

| Command | Purpose |
|---|---|
| `/ponytail [level]` | Set intensity: lite / full / ultra / off |
| `/ponytail-review` | Find over-engineering in current diff |
| `/ponytail-audit` | Scan entire repo for cuts |
| `/ponytail-debt` | List `ponytail:` comment markers |
| `/ponytail-gain` | Show benchmark impact scoreboard |
| `/ponytail-help` | Quick reference card |

Default level: **full**. Override via `PONYTAIL_DEFAULT_MODE` env var or `~/.config/ponytail/config.json`.

Source: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)
