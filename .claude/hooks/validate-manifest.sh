#!/bin/bash
# Validates harness.json after a Write or Edit tool call.
# Fires on PostToolUse for Write|Edit — checks if the written file is a harness.json.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)

# Only validate harness.json files
if [[ "$FILE_PATH" != *"harness.json" ]]; then
  exit 0
fi

python3 - "$FILE_PATH" <<'EOF'
import json, sys

path = sys.argv[1]
try:
    with open(path) as f:
        m = json.load(f)
except Exception as e:
    print(f"harness.json is not valid JSON: {e}", file=sys.stderr)
    sys.exit(1)

required = ['version', 'name', 'displayName', 'description', 'variables', 'fuelDirs']
missing = [k for k in required if k not in m]

if missing:
    print(f"harness.json missing required fields: {', '.join(missing)}", file=sys.stderr)
    sys.exit(1)

print(f"harness.json valid ({path})")
EOF
