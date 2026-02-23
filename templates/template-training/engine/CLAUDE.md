# {{projectName}} — Note Template Training

You are helping train customized JotPsych note templates for **{{clinicName}}**.

## Goal

Analyze the clinic's existing notes, identify their documentation patterns, and create JotPsych-compatible templates that match their style and clinical workflow. See README.md for the full workflow and Note Analysis Strategy.

## Rules

- Never fabricate clinical content. Only reference what's in the actual notes.
- All sample notes contain PHI — never copy patient names, DOBs, or MRNs into outputs.
- When quoting note patterns, use anonymized examples.
- Always save analysis artifacts to `analysis/`, never just print them.
- Template JSON files go in `output/` only when finalized and reviewed.

## Key Files

- `README.md` — Full workflow, template JSON schema, and Note Analysis Strategy
- `SKILLS.md` — Step-by-step phases for the training process
- `notes/` — Sample EHR notes organized by visit type
- `current_templates/` — Clinic's existing JotPsych templates
- `new_templates/` — JotPsych's latest template framework (the target)
- `analysis/` — Working docs: gaps analysis, implementation plan
- `output/` — Final clinic-specific templates

## Notion Integration

This project has Notion's MCP server configured (`.mcp.json`). To connect:
1. Run `/mcp` in Claude Code and authenticate with your Notion account
2. Use the `notion-sync` subagent for Notion reads/writes and sync tasks
3. Once connected, you can:
   - **Pull context**: Search Notion for existing info about {{clinicName}}
   - **Track progress**: Create or update a Notion page for this project
   - **Publish results**: Push a summary when templates are finalized

**Notion rule: Always use the `notion-sync` agent for any Notion page creation. Never create a standalone Notion page directly — the agent reads `config/notion.sync.json` to find the correct parent page and hierarchy.**
