# {{projectName}} — Template Training Workspace

This workspace is used to create clinic-specific JotPsych note templates for **{{clinicName}}** by analyzing their existing documentation style and merging it with JotPsych's standardized template framework.

## How It Works

JotPsych templates are sets of per-section instructions that an LLM uses — combined with a session transcript and other encounter data — to generate a clinical note. Each template is a JSON array of section objects, and each section contains prompting that tells the LLM what to write and how to format it. Templates also support a top-level `prompt` field that applies stylistic or structural instructions across all sections.

## Directory Structure

```
.
├── current_templates/   # The clinic's existing JotPsych templates (starting point)
├── new_templates/       # JotPsych's latest template framework (target structure)
├── notes/               # Sample notes exported from the clinic's EHR
├── analysis/            # Working analysis docs (gaps, implementation plan)
├── output/              # Final clinic-specific templates
└── README.md            # This file
```

## Workflow

1. **Review `current_templates/`** — Understand what {{clinicName}} is currently using in JotPsych. These are the templates being replaced or upgraded.

2. **Review `notes/`** — Read the sample EHR notes to understand the clinic's preferred documentation style: formatting conventions, level of detail, section structure, tone, abbreviations, and any billing-relevant patterns.

3. **Review `new_templates/`** — Study the latest JotPsych template framework. These represent the target prompting style, section definitions, and structural best practices.

4. **Create output templates** — Produce a new set of clinic-specific templates that:
   - Use the section structure and prompting patterns from `new_templates/`
   - Incorporate {{clinicName}}'s preferred style, formatting, and content patterns observed in `notes/`
   - Retain any clinic-specific customizations from `current_templates/` that are still relevant
   - Aim to produce complete, billing-ready documentation

## Template JSON Structure

Each template file is a JSON object with two top-level fields:

```json
{
  "prompt": "Global instructions applied to all sections...",
  "sections": [
    {
      "id": "section-id",
      "order": 0,
      "title": "Section Title",
      "content": "LLM instructions for generating this section...",
      "example_output": "Reference example of expected output..."
    }
  ]
}
```

Key fields:
- **`id`**: Unique identifier for the section
- **`order`**: Display/generation order (0-indexed)
- **`title`**: Human-readable section name
- **`content`**: The LLM prompt — instructions for generating this section from the transcript
- **`example_output`**: A reference example showing the expected output style and format

## Note Analysis Strategy

Before building templates, analyze the EHR sample notes to extract the clinic's documentation patterns:

### Step 1: Sample Selection
- For each visit type subfolder in `notes/`, pick **2-3 representative samples**
- Prioritize variety — pick one "simple" note and one "complex" note

### Step 2: Read and Catalog Sections
For each sample, document:
- **Section order** — The exact sequence of sections as they appear
- **Section names** — The exact headings/labels used
- **What goes in each section** — Content type, level of detail, structured fields vs free text

### Step 3: Identify Formatting Patterns
For each section, note:
- **Format type**: narrative paragraph, bullet list, label:value pairs, checkbox grid, etc.
- **Tone**: clinical/formal, abbreviated/terse, or conversational
- **Abbreviation conventions**: "pt" vs "patient", "WNL" vs "within normal limits"

### Step 4: Flag Boilerplate Content
Identify text that appears **word-for-word identical across multiple notes**:
- Education paragraphs, recommendation lists, medication risk disclosures
- Closing/follow-up statements, diagnosis intro phrasing
- Checkbox/grid sections where structure is fixed and only values change

### Step 5: Compare Across Visit Types
- Which sections appear in ALL visit types?
- Which are specific to one type?
- Where does formatting differ between visit types?

### Step 6: Write ANALYSIS.md
Create an `ANALYSIS.md` file in each visit type subfolder documenting patterns found in steps 2-5.

## Notion Integration

This project has a Notion MCP server configured (`.mcp.json`) and a Notion subagent (`.claude/agents/notion-sync.md`).

To connect:
1. Open this project in Claude Code
2. Run `/mcp`
3. Authenticate your Notion account (one-time OAuth)

After that, Claude can:
- Pull context about {{clinicName}} from Notion
- Track progress on this training project
- Publish results when templates are finalized

## Reusing This Workspace

This workspace is designed to be content-agnostic and reusable. To adapt for a different clinic:
1. Replace `current_templates/` with the new clinic's existing JotPsych templates
2. Replace `notes/` with sample notes from the new clinic's EHR (organize by visit type)
3. Keep `new_templates/` as-is (or update if the JotPsych framework has evolved)
4. Run the Note Analysis Strategy to create ANALYSIS.md files
5. Follow the Workflow to produce new clinic-specific templates

---

Scaffolded on {{scaffoldDate}} using harness v{{harnessVersion}}.
