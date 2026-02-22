# Payer Document Extraction Workflow

## Phase 1: Document Inventory

Catalog all source documents and assess quality.

1. List all files in `{{clinicName}}/data/`
2. Classify each document: payer contract, fee schedule, policy manual, etc.
3. Note any low-quality scans or unreadable pages
4. Save inventory to `{{clinicName}}/outputs/document-inventory.md`

## Phase 2: Initial Extraction

Extract raw data from each document.

1. Process each document and extract relevant {{focusArea}}
2. Save per-document extractions as JSON in `{{clinicName}}/outputs/`
3. Flag uncertain extractions with low confidence scores

## Phase 3: Cross-Reference & Validate

Check extracted data for consistency.

1. Compare rules across documents — flag contradictions
2. Cross-reference billing codes against known code sets
3. Identify gaps — payers or rule categories with no data
4. Save validation report to `{{clinicName}}/outputs/validation-report.md`

## Phase 4: Normalize to Schema

Standardize all extractions into the output schema.

1. Merge per-document extractions into per-payer JSON files
2. Apply the standard schema from CLAUDE.md
3. Save to `outputs/payer-schemas/{payer_name}.json`

## Phase 5: Generate Summary

Create human-readable summary of findings.

1. Summarize key rules by payer
2. Highlight areas needing human review
3. Save to `outputs/extraction-summary.md`

## Phase 6: Clinic Handoff

Prepare deliverables for the clinic team.

1. Copy finalized schemas to `outputs/`
2. Write handoff notes explaining what was extracted and any caveats
3. Save as `outputs/handoff-notes.md`
