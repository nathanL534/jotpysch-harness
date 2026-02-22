# {{projectName}}

Payer document extraction for **{{clinicName}}** — extracting {{focusArea}}.

## Setup

1. Copy `.env.example` to `.env` and add your API keys
2. Place source documents in `{{clinicName}}/data/`
3. (Optional) Run `/mcp` in Claude Code and authenticate Notion for context sync
4. Run `claude .` and follow the workflow in SKILLS.md

## Workflow

See `SKILLS.md` for the full 6-phase extraction workflow:

1. Document inventory
2. Initial extraction
3. Cross-reference & validate
4. Normalize to schema
5. Generate summary
6. Clinic handoff

## Adding More Clinics

This harness supports multiple clinics. For each new clinic:
1. Create a new `{clinic-name}/` folder with `README.md`, `CONTEXT.md`, `data/`, `outputs/`
2. Cross-clinic outputs go in the top-level `outputs/` directory

---

Scaffolded on {{scaffoldDate}} using harness v{{harnessVersion}}.
