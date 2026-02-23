# /harness-setup

Run the onboarding checklist for a scaffolded project.

## Instructions

Run inside a scaffolded project directory:

```bash
bun run src/index.ts setup
```

To auto-fix issues (create missing dirs, copy .env.example):

```bash
bun run src/index.ts setup --fix
```

This checks:
- `.env` file exists
- All fuel directories exist
- `.claude/` directory exists
- `CLAUDE.md` exists
