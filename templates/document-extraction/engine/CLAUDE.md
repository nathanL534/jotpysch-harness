# {{projectName}} — Payer Document Extraction

You are extracting {{focusArea}} from clinic documentation for **{{clinicName}}**.

## Goal

Process clinic documents (PDFs, CSVs, scanned notes) and extract structured data into JSON schemas that can be used for billing automation, prior auth workflows, and coding compliance.

## Project Structure

```
{{clinicName}}/
├── README.md        ← Clinic-specific context
├── CONTEXT.md       ← Detailed background on this clinic's setup
├── data/            ← Source PDFs, CSVs (fuel — gitignored)
├── scripts/         ← Analysis scripts
└── outputs/         ← Generated analysis for this clinic

outputs/             ← Cross-clinic outputs
└── payer-schemas/   ← Standardized payer JSON schemas
```

## Rules

- Source documents may contain PHI. Never copy patient identifiers into outputs.
- Always validate extracted data against the source — don't hallucinate billing codes.
- When uncertain about a field, mark it with `"confidence": "low"` in the JSON output.
- Save all artifacts to the appropriate outputs directory, never just print them.

## Output Schema

Extracted payer data should follow this structure:

```json
{
  "payer": "Payer Name",
  "extracted_date": "YYYY-MM-DD",
  "rules": [
    {
      "category": "prior_auth | billing | coding",
      "description": "...",
      "source_document": "filename.pdf",
      "source_page": 3,
      "confidence": "high | medium | low"
    }
  ]
}
```

See SKILLS.md for the full extraction workflow.

## Notion Integration

This project has Notion's MCP server configured (`.mcp.json`). To connect:
1. Run `/mcp` in Claude Code and authenticate with your Notion account
2. Use the `notion-sync` subagent for Notion reads/writes and sync tasks
3. Once connected, you can:
   - **Pull context**: Search Notion for existing info about {{clinicName}} — billing setup, payer contracts, prior analysis
   - **Track progress**: Create or update a Notion page for this extraction project
   - **Publish results**: Push extraction summaries and schema links back to the clinic's Notion page

**Notion rule: Always use the `notion-sync` agent for any Notion page creation. Never create a standalone Notion page directly — the agent reads `config/notion.sync.json` to find the correct parent page and hierarchy.**

Use the Notion MCP tools directly — no copy-pasting needed.
