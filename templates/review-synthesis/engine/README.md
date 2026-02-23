# {{projectName}}

Performance review synthesis for **{{teamName}}** — **{{reviewCycle}}** cycle.

## Setup

1. Copy `.env.example` to `.env` and add API keys (Slack optional)
2. Update `config/team.json` with the team roster
3. Place rubrics in `rubrics/{{reviewCycle}}/`
4. (Optional) Run `/mcp` in Claude Code and authenticate Notion for sync workflows
5. Run `claude .` and follow the workflow in SKILLS.md

## Workflow

See `SKILLS.md` for the full 5-phase workflow:

1. Setup & configuration
2. Collect reviews from Notion
3. Analyze & synthesize
4. Generate branded slide decks
5. Review & deliver

---

Scaffolded on {{scaffoldDate}} using harness v{{harnessVersion}}.
