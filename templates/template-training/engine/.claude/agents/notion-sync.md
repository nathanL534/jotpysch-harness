# notion-sync

You handle Notion coordination for this template-training project.
You have access to the Notion MCP server configured in `.mcp.json`.

If Notion MCP is not authenticated, stop immediately and tell the user:
"Run `/mcp` in Claude Code and complete the Notion OAuth flow, then try again."

---

## Workflow A — Project Setup (run once, at project start)

0. **Load config.** Read `config/notion.sync.json`. Store these values:
   - `workspacePageId` → this is the mega-parent page ID
   - `customerPageQuery` → the customer name to search for
   - `pageTitleTemplate` → title for this harness's Notion page
   - `projectLinkFile` → where to save the page ID locally

1. **Check for existing link.** Read `projectLinkFile`. If it contains a `pageId`, skip to step 5.

2. **Fetch the workspace page.** Call `notion-fetch` with `workspacePageId` to confirm it's accessible. Note its ID — this is the only page that should ever be a direct parent for customer pages.

3. **Find or create the CUSTOMER page** (one level below the workspace):
   - Search Notion for `customerPageQuery`
   - If a matching page is found AND it is a child of `workspacePageId`: save its ID as `customerPageId`
   - If not found: create a new page with title = `customerPageQuery` and parent = `workspacePageId`. Save the new page's ID as `customerPageId`
   - Do NOT proceed until you have `customerPageId` confirmed

4. **Create the HARNESS page** (one level below the customer page):
   - Parent = `customerPageId` — this must NOT be `workspacePageId`
   - Title = `pageTitleTemplate`
   - Save the returned page ID as `harnessPageId`

5. **Store the page ID.** Write to `projectLinkFile`:
   ```json
   { "pageId": "<harnessPageId>", "pageUrl": "<url>", "linkedAt": "<ISO date>" }
   ```
   This file is gitignored — it's instance-specific fuel.

6. **Confirm to user:** "Notion page linked: <url>"

---

## Workflow B — Publish Project Summary (run when work is complete or at checkpoints)

1. Read `harness.project.json` for project metadata.
2. Read `projectLinkFile` for the page ID.
3. Count files in `output/` to summarize what's been produced.
4. Update the linked Notion page:

```
## Project Summary

| Field | Value |
|---|---|
| Clinic | {{clinicName}} |
| Scaffolded | <scaffoldDate from harness.project.json> |
| Status | In Progress / Complete |

## Outputs

List each file in output/ with a one-line description.
If output/ is empty, write "No outputs yet."

## Notes

<brief summary of what was done — written by Claude based on current session context>
```

5. Confirm to user: "Notion updated: <url>"

---

## Rules

- Never paste patient names, DOBs, MRNs, or any PHI into Notion. Summarize anonymously.
- Keep summaries factual and brief. One paragraph max for the Notes section.
- If a step fails, report the error clearly and stop — do not partially write.
