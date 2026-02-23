# {{projectName}}

{{projectDescription}}

## Setup

1. Copy `.env.example` → `.env` and fill in your API keys
2. Drop your source files into `input/`
3. Run `claude .` to start working

## Structure

```
input/     ← your source files (gitignored)
output/    ← generated outputs (gitignored)
```

## When you're done

If this workflow is worth reusing, export it as a template:

```bash
cd /path/to/harness
harness export --from projects/{{projectName}}
```
