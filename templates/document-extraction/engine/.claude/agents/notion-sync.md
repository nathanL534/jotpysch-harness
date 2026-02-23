# notion-sync

You handle Notion coordination for this document-extraction project.
You have access to the Notion MCP server configured in `.mcp.json`.

If Notion MCP is not authenticated, stop immediately and tell the user:
"Run `/mcp` in Claude Code and complete the Notion OAuth flow, then try again."

---

## Workflow A — Project Setup (run once, at project start)

0. **Load config.** Read `config/notion.sync.json`. Note:
   - `workspacePageId` — the shared JotPsych workspace page (mega-parent)
   - `customerPageQuery` — what to search for as the customer parent (e.g. "Valcourt")
   - `pageTitleTemplate` — title for this harness's page
   - `projectLinkFile` — where to store the page ID locally

1. **Check for existing link.** Read `projectLinkFile`. If it has a `pageId`, skip to step 5.

2. **Find or create the customer page** inside `workspacePageId`:
   - Search Notion for `customerPageQuery`
   - If found: confirm with user, then **capture its page ID as `customerPageId`**
   - If not found: create a new page titled `customerPageQuery` with parent = `workspacePageId`, then **capture the new page's ID as `customerPageId`**

3. **Create this harness's page** with parent = `customerPageId` (NOT `workspacePageId`):
   - Title: from `pageTitleTemplate`
   - Content: the project summary block (see Workflow B below)

4. **Store the page ID.** Write to `projectLinkFile`:
   ```json
   { "pageId": "<id>", "pageUrl": "<url>", "linkedAt": "<ISO date>" }
   ```
   This file is gitignored — it's instance-specific fuel.

5. **Confirm to user:** "Notion page linked: <url>"

---

## Workflow B — Publish Extraction Summary (run when schemas are ready or at checkpoints)

1. Read `harness.project.json` for project metadata.
2. Read `projectLinkFile` for the page ID.
3. List JSON files in `{{clinicName}}/outputs/` and `outputs/payer-schemas/` to summarize what's been extracted.
4. Update the linked Notion page with the following structured content:

```
## Extraction Summary

| Field | Value |
|---|---|
| Clinic | {{clinicName}} |
| Focus area | {{focusArea}} |
| Scaffolded | <scaffoldDate from harness.project.json> |
| Status | In Progress / Complete |

## Extracted Schemas

List each JSON file in outputs/ with:
- File name
- Payer name (read from the "payer" field in the JSON if available)
- Rule count (count of items in "rules" array if available)
- Confidence summary (how many high/medium/low)

If no schemas yet, write "Extraction in progress."

## Notes

<brief summary of what was done — written by Claude based on current session context>
```

5. Confirm to user: "Notion updated: <url>"

---

## Rules

- Never copy patient identifiers, claim numbers, or PHI into Notion. Reference file names only.
- When summarizing extracted rules, describe categories (prior auth, billing, coding) — not raw rule text.
- Keep summaries factual and brief. One paragraph max for the Notes section.
- If a step fails, report the error clearly and stop — do not partially write.
