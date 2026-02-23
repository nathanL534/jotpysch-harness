# Harness — Design Document

## Research: The Claude Code Ecosystem

Building this required understanding how Claude Code actually structures project-level intelligence — not just as a coding assistant but as a first-class operator of a workspace.

**CLAUDE.md** is the keystone. Claude reads it automatically at session start, so it's the right place to explain the tool's domain model, not just usage instructions. I leaned into this: harness's own `CLAUDE.md` explains the engine/fuel concept, the template directory layout, and every CLI command in terms Claude can interpret and relay. A non-technical user should be able to say "set up a document extraction project for Acme Clinic" and Claude should be able to translate that directly into `harness new document-extraction acme-clinic`.

**Skills/slash commands** let Claude Code users invoke multi-step workflows as single prompts. The templates include `.claude/skills/` directories so scaffolded projects come pre-wired with their own slash commands — `harness` is designed to provision Claude's operational layer, not just files.

**MCP servers** solve the "external context" problem. Each scaffolded template includes an `.mcp.json` that wires up the official Notion hosted MCP server (`https://mcp.notion.com/mcp`, OAuth). This means Claude running inside any scaffolded project can read and write Notion directly — no copy-pasting context, no custom code to maintain.

**Hooks** allow auto-approving safe commands (like running scripts in a known output directory), which is critical for the review-synthesis template where Claude orchestrates a multi-step pipeline. I configured sensible hook defaults in each template's `.claude/` directory so teams don't have to re-learn permission settings.

**Permissions** are set in `.claude/settings.local.json` per template. The challenge here is that permissions *should* be shared (you want everyone to have the same tool allowlist) but settings files are often gitignored because they can contain local paths. I resolved this by keeping the settings file in `engine/` — it's explicitly part of the engine and gets copied at scaffold time.

---

## Design Decisions and Trade-offs

### Decision 1: Template = Directory, Not Registry

The simplest possible template format is a directory with two things: a `harness.json` manifest and an `engine/` subdirectory. No special file format, no database, no package registry. Templates live in `templates/` in the harness repo itself, tracked in git, browsable in a code editor.

**Trade-off:** This means templates are co-located with the tool rather than distributed. There's no `npm install @jotpsych/template-training`. I think that's the right call for now — it keeps the surface area minimal and means improving a template is just a git commit, not a release. The downside is you can't install templates from external sources without cloning. The "what I'd build next" section addresses this.

### Decision 2: Variable Substitution is Dumb on Purpose

`{{variableName}}` substitution is pure string replacement — no conditionals, no loops, no logic. This is intentional. The moment you add `{{#if}}` blocks, templates become programs that need to be debugged. Since Claude can interpret markdown at runtime, any conditional logic in a scaffolded project should live in `CLAUDE.md` ("if the clinic has multiple providers, create one subfolder per provider"), not in the template syntax.

**Trade-off:** Templates can't vary their structure based on variable values. If two use cases are structurally different, they should be different templates. I'm comfortable with this constraint.

### Decision 3: `projects/` is Gitignored Locally, `templates/` Goes to GitHub

This is the engine/fuel separation made concrete at the filesystem level. The harness repo itself enforces the split: the only thing that ever gets committed is `templates/` and `src/`. Every scaffolded project lives in `projects/`, which is in `.gitignore`. There's no ambiguity about what's shareable and what isn't.

**Trade-off:** You can't version-control your local project work inside the harness repo. But that's the point — if you want to version a project, `git init` inside `projects/your-project/`. Harness does this automatically at scaffold time.

### Decision 4: MCP-Only Notion Integration (and why)

The tool started with a dual-layer approach: a programmatic `@notionhq/client` call at scaffold time (CLI-level, requires `NOTION_API_KEY` env var) plus an MCP server wired into each template at runtime. After reflection I removed the programmatic layer in favor of MCP-only.

**Why MCP-only:**
- **No key management.** The API-key approach requires every person who scaffolds a project to have `NOTION_API_KEY` and `NOTION_PARENT_PAGE_ID` set. MCP OAuth happens once per client, transparently, in the browser.
- **Simpler CLI.** `harness new` creates files. It doesn't call external APIs. The CLI becomes trivially testable and works fully offline.
- **Claude is the operator.** In our workflow, Claude runs the CLI. If Claude can call Notion MCP tools directly after scaffolding, there's no reason for the CLI to do it separately.

**The tradeoff:** MCP-only means Notion sync only works when Claude is the operator — it won't fire if someone runs `harness new` directly from the terminal without a Claude session. For our team that's fine; harness is explicitly Claude-first. If you ever needed unattended scaffolding (e.g., in CI), you'd want the API-key path back.

**The one sync story:**

When Claude scaffolds a new project, the `notion-sync` agent in `.claude/agents/` handles the Notion coordination. The workflow is:

1. Claude runs `harness new <template> <name>` → project is created locally
2. Claude invokes the `notion-sync` agent: "set up Notion for this project"
3. Agent searches Notion for an existing page for this customer/project, links if found, creates if not
4. Page ID is stored in `.notion/project.json` inside the project (gitignored as fuel)
5. When work produces outputs, the agent publishes a structured summary back to that page

This is automatic and repeatable. The same invocation at the start and end of any session keeps Notion in sync without anyone copy-pasting.

**Explicit Notion structure decisions:**

- **Page naming:** Configured in `config/notion.sync.json` via `pageTitleTemplate` (e.g., `"{{clinicName}} — Template Training"`). Variable placeholders are substituted at scaffold time, so each project gets a concrete title. To change the naming convention, edit the config file — no code changes.
- **Workspace hierarchy:** `workspacePageId` in `config/notion.sync.json` points to a shared workspace page (the "mega-parent"). `customerPageQuery` defines how to find or create a customer-level parent page underneath it. The result is a two-level hierarchy: workspace → customer → harness pages. Teams set `workspacePageId` once per Notion workspace; the agent handles the rest by searching for an existing customer page before creating one. This means two separate repos scaffolding for the same customer will share a Notion parent automatically.
- **Backref storage:** `projectLinkFile` in the config (defaults to `.notion/project.json`). This file is gitignored — it's fuel, specific to that instance.
- **Summary format:** Structured Notion page with a heading from `summaryHeading` in the config. The agent reads `harness.project.json` for metadata and scans fuel directories for output files. Each template defines its own summary shape in the agent markdown (schema counts for extraction, deck status for reviews, output file list for training).

This keeps Notion structure configurable via a small JSON file (`config/notion.sync.json`) rather than hardcoded in agent markdown or in `harness.json`. The config is part of the engine — it ships with the template and gets variable-substituted at scaffold time, but teams can customize it per-template without touching agent logic.

**Agent strategy — minimal by default:**

Each template ships with exactly one Notion agent (`notion-sync.md`). There is no global harness-level agent — Claude's own system-level knowledge handles the CLI commands (via `CLAUDE.md`). One per-template agent is enough because the sync story is the same across templates: find/create page → link → publish.

Template-specific agents make sense when the *domain* is different enough to need scoped instructions (don't paste PHI, output format is HTML slides, etc.). Adding more agents than that increases cognitive overhead for users and risks agents stepping on each other's scope.

### Decision 5: `harness export` as Reverse-Scaffolding with Human Review Checklist

The export command handles the 80/20 case automatically: read `.gitignore` to detect fuel, copy only engine files, reverse-substitute variable values back to `{{placeholders}}`, infer secrets from `.env.example`, write `harness.json`. The remaining 20% — adding descriptions, tags, variable definitions, and catching edge-case substitutions — requires human judgment.

Rather than try to automate the edge cases, the exporter outputs an explicit **needs-human-review checklist**: what was auto-detected vs. what still needs a person. The checklist is specific (not just "check the files") — it flags empty `tags`, auto-generated `description`, zero substitutions made, etc. The goal is a workflow where export gets you 80% there and the checklist makes the remaining 20% a 5-minute task, not a hunt.

This means the template-creation workflow can be: scaffold → work → refine → `export` → review checklist → push. The project *becomes* the template.

---

## How Shareability Works

The flow is:
```
harness new template-training valcourt-clinic
  → projects/valcourt-clinic/  (local, gitignored)

harness export --from projects/valcourt-clinic
  → templates/valcourt-clinic/ (tracked, shareable)

git push
  → templates/ available to team
```

A teammate on a different machine can then:
```
harness new valcourt-clinic their-project-name
```

Variables get re-prompted, secrets get re-entered, and they have a clean instance with their own `projects/` directory. Their fuel never touches the template.

Discoverability is handled by `harness list`, which reads every `harness.json` in `templates/` and surfaces name, description, and tags. Claude can call this command and relay the results conversationally — a user can ask "what harnesses do we have for payer work?" and Claude can search the list.

---

## What I'd Build Next

**Remote template registry.** Right now templates are co-located with the tool. The right next step is a separate git repo (`jotpsych/harness-templates`) that harness can pull from — `harness pull template-training` fetches the latest from the registry. This keeps the tool and the templates on independent release cycles and lets non-engineers contribute templates without touching CLI code.

**Claude subagents for Notion context.** At scaffold time, harness could optionally fetch the customer's Notion page and inject relevant context into the scaffolded `CLAUDE.md`. "Here's what we know about Valcourt Clinic" — populated automatically from Notion rather than copy-pasted. This closes the loop on the "context syncing" problem from the brief.

**Data syncing via shared paths.** The simplest version: a `fuelSync` field in `harness.json` that points at a shared Drive or S3 path. `harness sync` copies that data into the local `fuel/` directory. Three people working the same customer could share the same source PDFs without emailing zip files.

**`harness status` for cross-harness visibility.** A future `harness status` command could query standard Notion views (via MCP) and summarize active work across the team — "three active harnesses on Valcourt: template-training (Nate), document-extraction (Jackson), review-synthesis (Chris)." Notion acts as the coordination layer; harness just needs to know where to look.
