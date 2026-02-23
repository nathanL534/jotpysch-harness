# Harness

A lightweight TypeScript CLI that scaffolds Claude Code workspaces from templates.

## Claude-first, CLI-second

**This CLI is designed to be called by Claude, not by humans directly.** Most users will never type `harness new` — they'll say "set up a new template training project for Valcourt" and Claude figures out the command.

This means:
- The `CLAUDE.md` file is the most important file in this project
- Error messages are structured and parseable, not just pretty
- Output is designed for Claude to interpret and relay

## Quick Start

```bash
bun install && bun link   # installs deps and makes `harness` available globally
harness list              # see available templates
harness new template-training valcourt-training   # scaffold a project
```

Projects are created in `projects/` by default (gitignored — your data stays local). Templates live in `templates/` (tracked in git — shareable).

## How It Works

```
templates/    ← Reusable project templates (tracked in git)
projects/     ← Your local workspaces (gitignored)
```

1. **Scaffold**: `harness new <template> <name>` → creates `projects/<name>/`
2. **Work**: Drop in your data, iterate with Claude
3. **Export**: `harness export --from projects/<name>` → extracts engine to `templates/`
4. **Share**: Push to git — only templates go to GitHub

## What is a Harness?

A harness is a structured project workspace where Claude Code acts as an assistant for a specific task. Each harness separates:

- **Engine** — version-controlled scaffolding (CLAUDE.md, .claude/, scripts, configs)
- **Fuel** — gitignored local data (PDFs, transcripts, outputs, API keys)

## Templates

Templates live in `templates/`. Each is a directory with:
- `harness.json` — manifest (variables, secrets, fuel dirs)
- `engine/` — files copied to the new project with `{{variable}}` substitution

### Bundled Templates

| Template | Description |
|----------|-------------|
| `template-training` | Analyze a clinic's notes and create customized JotPsych templates |
| `document-extraction` | Extract billing rules from clinic docs into structured JSON schemas |
| `review-synthesis` | Collect peer reviews and synthesize into branded slide decks |
| `starter` | Bare-bones starting point for new use cases — scaffold, customize, then export as a new template |

Each template includes:
- `CLAUDE.md` with task-specific instructions
- `SKILLS.md` with step-by-step workflow
- `.claude/` config (hooks for auto-approving safe tools, permissions)
- `.mcp.json` with Notion MCP server for context syncing
- `.env.example` listing required secrets

## Commands

| Command | Purpose |
|---------|---------|
| `harness new <template> [name]` | Scaffold a project into `projects/<name>/` |
| `harness list [--tags ...]` | List available templates |
| `harness export [--from <path>]` | Extract engine from a project into `templates/` |
| `harness setup` | Onboarding checklist for a scaffolded project |

## Notion Integration

Scaffolded projects include a Notion MCP server configuration (`.mcp.json`) and a Notion subagent (`.claude/agents/notion-sync.md`). Use `/mcp` in Claude Code to complete one-time OAuth authentication, then Claude can read/write Notion directly for context sync and publishing.
