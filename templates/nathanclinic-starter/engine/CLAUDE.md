# {{projectName}}

{{projectDescription}}

## Goal

*(Describe what you're trying to accomplish. Claude will read this every session.)*

## Rules

- Save all outputs to `output/` — never just print them.
- Keep source files in `input/`.

## Key Files

- `README.md` — workflow and context
- `input/` — source material (gitignored)
- `output/` — generated artifacts (gitignored)

## Notion Integration

This project has Notion's MCP server configured (`.mcp.json`). Run `/mcp` in Claude Code to authenticate, then use the `notion-sync` agent for context sync and publishing.

**Notion rule: Always use the `notion-sync` agent for any Notion page creation. Never create a standalone Notion page directly — the agent reads `config/notion.sync.json` to find the correct parent page and hierarchy.**
