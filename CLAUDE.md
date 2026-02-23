# Harness — Claude Code Workspace Scaffolder

You are working inside the `harness` project. This CLI scaffolds structured workspaces ("harnesses") where Claude Code acts as an assistant for specific tasks like template training, document extraction, and review synthesis.

## How It Works

```
templates/          ← Reusable project templates (tracked in git, shareable)
projects/           ← Your local projects (gitignored, your data stays here)
```

**The workflow:**
1. `harness new <template> <name>` → scaffolds into `projects/<name>/`
2. You work in `projects/<name>/`, drop in your data, iterate with Claude
3. When you've got something good: `harness export --from projects/<name>` → saves engine to `templates/`
4. Push to git — only `templates/` goes to GitHub, `projects/` stays local

## Core Concepts

### Engine vs Fuel
- **Engine** = version-controlled, shareable files (CLAUDE.md, .claude/, scripts, configs). Lives in `engine/` inside a template.
- **Fuel** = gitignored, local-only data (PDFs, patient notes, outputs, .env, API keys). Declared as `fuelDirs` in `harness.json` and auto-detected from `.gitignore` during export.

### Templates
A template is a directory with:
- `harness.json` — manifest declaring variables, secrets, fuel dirs, metadata
- `engine/` — files copied into the new project with `{{variable}}` substitution

### Variable Substitution
`{{variableName}}` in file contents → replaced with values during scaffold. No conditionals, no logic — just string replacement. Built-in variables: `{{projectName}}`, `{{scaffoldDate}}`, `{{harnessVersion}}`.

## CLI Commands

| Command | Purpose |
|---------|---------|
| `harness new <template> [name]` | Scaffold a project into `projects/<name>/` |
| `harness list [--tags ...]` | List available templates |
| `harness export [--from <path>]` | Extract engine from a project into `templates/` |
| `harness setup` | Onboarding checklist for a scaffolded project |

Use `--output <dir>` with `new` or `export` to override the default location.

## Intent Guide

**"Set up / start / create a project for X"** → scaffold from an existing template:
1. Run `harness list` to find the right template
2. Name the project `<clinicName>-<templateType>` (e.g. `valcourt-training`, `valcourt-billing`) — never just the clinic name alone, as one clinic may have multiple harnesses
3. Run `harness new <template> <name>` — creates in `projects/`, never in `templates/`
4. Never create files in `templates/` unless the user explicitly says "create a new template"

**"Create a new template / add a template type"** → add to `templates/`:
- Only do this when the user explicitly wants a new reusable template, not a project instance
- Use `harness export --from projects/<name>` to extract one from an existing project (preferred)
- Or build manually: create `templates/<name>/harness.json` + `templates/<name>/engine/`

## Project Structure

```
harness/
├── CLAUDE.md              # You are here
├── src/                   # CLI source code
│   ├── index.ts           # CLI entry (commander)
│   ├── types.ts           # All TypeScript interfaces
│   ├── commands/          # CLI command handlers
│   ├── core/              # Business logic
│   └── utils/             # Helpers
├── templates/             # Reusable templates (tracked in git)
│   ├── template-training/
│   ├── document-extraction/
│   └── review-synthesis/
├── projects/              # Local workspaces (gitignored)
└── tests/
```

## Development

```bash
bun install && bun link              # Install deps + make `harness` available globally
bun test                             # Run tests
harness list                         # Test list command
harness new template-training test-project  # Test scaffold
```

## Tech Stack
- TypeScript + Bun
- commander.js (CLI), inquirer (prompts), zod (validation)
- chalk + ora (output formatting)
- Notion MCP via project `.mcp.json` (OAuth in Claude Code)

## Key Files
- `src/core/manifest.ts` — Zod schema is the source of truth for `harness.json`
- `src/core/scaffold.ts` — Main orchestrator for the `new` command
- `src/commands/export.ts` — Smart export: reads .gitignore, detects fuel, infers secrets
- `templates/` — Bundled example templates

## Conventions
- All core functions are pure where possible — side effects in commands layer
- Error messages should be clear enough for Claude to interpret and relay to users
- Output uses structured formatting via `src/utils/output.ts`
- Tests use `bun test` and live in `tests/`
