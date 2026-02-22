#!/usr/bin/env python3
"""
Review synthesis CLI orchestrator.
Usage: python scripts/run.py [collect|synthesize|generate|all]
"""

import sys

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/run.py [collect|synthesize|generate|all]")
        print()
        print("  collect    - Pull reviews from Notion")
        print("  synthesize - Analyze reviews against rubrics")
        print("  generate   - Generate HTML slide decks")
        print("  all        - Run full pipeline")
        sys.exit(1)

    command = sys.argv[1]

    if command == "collect":
        print("TODO: Implement Notion collection")
        print("See scripts/notion/ for API integration")
    elif command == "synthesize":
        print("TODO: Implement synthesis")
        print("See scripts/analysis/ for AI synthesis logic")
    elif command == "generate":
        print("TODO: Implement slide generation")
        print("See templates/ for slide specs and brand assets")
    elif command == "all":
        print("Running full pipeline...")
        print("Step 1: Collect reviews from Notion")
        print("Step 2: Synthesize against rubrics")
        print("Step 3: Generate slide decks")
        print("TODO: Wire up each step")
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
