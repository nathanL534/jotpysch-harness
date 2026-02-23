# /harness-new

Scaffold a new project from a template.

## Arguments

- `$ARGUMENTS` — can be: `<template> [name]`, or a natural language description like "template training for Valcourt"

## Instructions

1. If the user gave a template name and project name, run directly:

```bash
bun run src/index.ts new <template> <name>
```

This creates the project in `projects/<name>/` by default.

2. If the user gave a natural language description, first list templates to find the right one:

```bash
harness list
```

Name the project `<clinicName>-<templateType>` (e.g. `valcourt-training`, `valcourt-billing`) — never just the clinic name alone, since a clinic may have multiple harnesses and duplicate names cause conflicts.

Then scaffold with the matching template. Always pass variables directly with `--var` — do not rely on interactive prompts, as they require a TTY that is not available in this context:

```bash
harness new <template> <name> --var key=value --var key2=value2
```

Check the template's `harness.json` (in `templates/<template>/harness.json`) to see what variables are needed. If you don't know the values, use defaults — the `--var` flags are optional and defaults will be used for any missing variables.

4. To scaffold somewhere other than `projects/`:

```bash
bun run src/index.ts new <template> <name> --output /path/to/dir
```

5. After scaffolding, run the setup check:

```bash
cd projects/<name> && bun run ../../src/index.ts setup
```

6. If any checks fail and are fixable, offer to run `setup --fix`.

7. If the project has Notion MCP configured (setup will tell you), ask the user:
   "Want me to set up Notion sync for this project? I can create or link a tracking page."
   - If yes: invoke the `notion-sync` agent's Workflow A inside the new project.
   - If no: skip — Notion is optional, local workflows work without it.

8. Summarize to the user:
   - Project created in `projects/<name>/`
   - Setup status (all checks passed, or what still needs attention)
   - What to do next: drop data into fuel dirs, then `cd projects/<name> && claude .` to start working
