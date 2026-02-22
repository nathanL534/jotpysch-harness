# {{projectName}} — Performance Review Synthesis

You are synthesizing performance reviews for **{{teamName}}**, **{{reviewCycle}}** cycle.

## Goal

Collect peer reviews and self-assessments from Notion, analyze them against role-specific rubrics, and generate branded HTML slide decks summarizing each person's feedback.

## Project Structure

```
config/
├── team.json              ← Team roster + rubric mappings
├── .env.example           ← API key template
└── advice.json            ← Per-person guidance/context

rubrics/
├── {{reviewCycle}}/       ← Role-specific rubrics for this cycle
└── historical/            ← Previous cycle baselines

scripts/
├── run.py                 ← CLI orchestrator
├── notion/                ← Notion API integration (collect reviews)
├── slack/                 ← Slack notifications
└── analysis/              ← AI synthesis logic

templates/
├── brand.css              ← Brand assets and styling
└── REVIEW_SLIDE_TEMPLATE.md  ← Slide deck specification

collected/                 ← Raw review JSON from Notion (fuel — gitignored)
output/                    ← Generated slide decks in HTML (fuel — gitignored)
backgrounds/               ← Generated background images (fuel — gitignored)
```

## Rules

- Never hardcode review categories — always read from rubrics.
- Never fabricate feedback. Every point in a synthesis must trace back to an actual review.
- Maintain tone: constructive, specific, balanced. No generic filler.
- Each person's slide deck should feel personalized, not templated.
- Protect reviewer anonymity — never attribute specific feedback to a named reviewer.

## Conventions

- Rubrics are markdown files in `rubrics/{{reviewCycle}}/`
- Team roster in `config/team.json` maps people to roles and rubrics
- Collected reviews are raw JSON in `collected/{person_name}.json`
- Output slides are HTML in `output/{person_name}_review.html`

See SKILLS.md for the step-by-step workflow.

## Notion Integration

This project has Notion's MCP server configured (`.mcp.json`). To connect:
1. Run `/mcp` in Claude Code and authenticate with your Notion account
2. Use the `notion-sync` subagent for Notion reads/writes and sync tasks
3. Once connected, you can:
   - **Collect reviews**: Pull peer reviews and self-assessments directly from Notion databases — no manual export needed
   - **Pull context**: Search Notion for team info, prior cycle results, and role descriptions
   - **Track progress**: Update the review cycle's Notion page with synthesis status
   - **Publish results**: Push summaries and links to generated slide decks back to Notion so managers can access them

Use the Notion MCP tools directly — no copy-pasting needed. This replaces the manual Notion collection in `scripts/notion/`.
