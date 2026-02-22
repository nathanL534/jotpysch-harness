# Review Synthesis Workflow

## Phase 1: Setup & Configuration

Prepare the review cycle.

1. Update `config/team.json` with the current roster, roles, and rubric assignments
2. Place role-specific rubrics in `rubrics/{{reviewCycle}}/`
3. Verify Notion API key is set in `.env`
4. Confirm review forms are complete in Notion

## Phase 2: Collect Reviews

Pull raw review data from Notion.

1. Run the Notion collection script to pull peer reviews and self-assessments
2. Save raw JSON to `collected/{person_name}.json`
3. Verify completeness — flag anyone with missing reviews
4. Save collection summary to `collected/collection-summary.md`

## Phase 3: Analyze & Synthesize

Process reviews through rubrics and generate synthesis.

1. For each person, load their reviews and applicable rubric
2. Map feedback to rubric categories
3. Identify themes: strengths, growth areas, notable achievements
4. Generate synthesis — balanced, specific, traceable to source reviews
5. Save synthesis JSON to `collected/{person_name}_synthesis.json`

## Phase 4: Generate Slide Decks

Create branded HTML slides from synthesis.

1. Load the slide template from `templates/REVIEW_SLIDE_TEMPLATE.md`
2. Apply brand styling from `templates/brand.css`
3. Generate one HTML slide deck per person
4. Save to `output/{person_name}_review.html`
5. Generate a summary index at `output/index.html`

## Phase 5: Review & Deliver

Quality check and distribution.

1. Review each deck for accuracy and tone
2. Cross-check that no reviewer names leaked into slides
3. Optionally notify via Slack that reviews are ready
4. Archive this cycle's rubrics to `rubrics/historical/`
