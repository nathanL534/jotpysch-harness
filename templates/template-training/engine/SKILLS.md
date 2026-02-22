# Template Training Workflow

## Phase 1: Collect & Organize Notes

Gather sample notes from the clinic and organize by type.

1. Place PDF/text notes into `notes/` organized by note type (e.g. `notes/Intake/`, `notes/Follow-up/`)
2. Place any existing template exports into `current_templates/`
3. Verify you have at least 3-5 examples per note type

## Phase 2: Analyze Note Patterns

Read through the sample notes and document the clinic's patterns.

1. For each note type, identify: sections used, ordering, typical length, terminology
2. Note what's consistent vs. what varies between providers
3. Save analysis to `analysis/note-patterns.md`

## Phase 3: Gap Analysis

Compare the clinic's current patterns against JotPsych's template capabilities.

1. Identify which JotPsych template fields map to the clinic's sections
2. Flag sections that don't have a direct mapping
3. Note any clinic-specific terminology or workflows
4. Save to `analysis/gaps-analysis.md`

## Phase 4: Draft Templates

Create initial JotPsych template JSON files.

1. Build one template per note type in `new_templates/`
2. Map clinic sections to JotPsych fields
3. Include section prompts that match the clinic's documentation style
4. Name files: `{note_type}_template_v1.json`

## Phase 5: Validate Against Examples

Test the draft templates against the sample notes.

1. For each sample note, check: would the template capture all the content?
2. Identify gaps — sections in notes that the template misses
3. Document findings in `analysis/validation-results.md`

## Phase 6: Iterate & Refine

Revise templates based on validation.

1. Update templates to address gaps (bump version: `_v2.json`)
2. Re-validate against samples
3. Repeat until coverage is satisfactory

## Phase 7: Final Review & Deliver

1. Copy approved templates to `output/`
2. Write a summary of what was built and any clinic-specific notes
3. Save as `output/delivery-summary.md`
