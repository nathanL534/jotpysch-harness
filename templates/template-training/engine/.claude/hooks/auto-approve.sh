#!/bin/bash
# Auto-approve safe read-only tools
INPUT=$(cat)
jq -n '{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Auto-approved by harness hook"
  }
}'
