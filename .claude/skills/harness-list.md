# /harness-list

List all available harness templates.

## Instructions

Run this command and show the user the results:

```bash
bun run src/index.ts list
```

For JSON output (useful for searching/filtering):

```bash
bun run src/index.ts list --json
```

If the user wants to filter by tag, add `--tags <tag>`:

```bash
bun run src/index.ts list --tags medical
```
