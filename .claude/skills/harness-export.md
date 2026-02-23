# /harness-export

Extract the engine from a project and save it as a reusable template.

## Arguments

- `$ARGUMENTS` — optional: project name or path, and/or a template name

## Instructions

1. Export a project from `projects/`:

```bash
bun run src/index.ts export --from projects/<project-name> --name <template-name>
```

This saves the template to `templates/<template-name>/` by default.

2. Export from any path:

```bash
bun run src/index.ts export --from /path/to/project --name <template-name>
```

3. The export command automatically:
   - Reads `.gitignore` to detect fuel directories (won't copy those)
   - Copies everything else as engine files
   - Scans for the project folder name in files (suggests turning it into `{{projectName}}`)
   - Infers secrets from `.env.example`
   - Generates a `harness.json` manifest

4. After exporting, tell the user:
   - Template saved to `templates/<name>/`
   - Edit `harness.json` to add variables, descriptions, and tags
   - Replace hardcoded names with `{{variables}}` in engine files
   - Push to git to share with the team
