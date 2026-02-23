# Tests

Run with `bun test`.

| File | What it tests |
|------|--------------|
| `manifest.test.ts` | `harness.json` schema validation — required fields, variable definitions, secret declarations |
| `variables.test.ts` | `{{variable}}` substitution — replacements, missing vars, built-in vars like `scaffoldDate` |
| `fuel.test.ts` | Fuel dir detection — reads `.gitignore`, identifies what should be excluded from templates |
| `registry.test.ts` | Template discovery — finds and lists templates from the `templates/` directory |
| `scaffold.test.ts` | End-to-end scaffold — copies engine files, applies substitutions, creates fuel dirs |

19 tests across 5 files.
