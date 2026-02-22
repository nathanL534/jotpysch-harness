import type { VariableMap } from "../types.js";

const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

/**
 * Replace all {{variableName}} occurrences in a string with values from the map.
 * Unknown variables are left as-is.
 */
export function substituteString(template: string, variables: VariableMap): string {
  return template.replace(VARIABLE_PATTERN, (match, name) => {
    return name in variables ? variables[name] : match;
  });
}

/**
 * Replace variables in a file path (for files whose names contain {{variables}}).
 */
export function substitutePath(filePath: string, variables: VariableMap): string {
  return substituteString(filePath, variables);
}

/**
 * Build the complete variable map including built-in variables.
 */
export function buildVariableMap(
  userVariables: VariableMap,
  projectName: string,
  harnessVersion: string
): VariableMap {
  return {
    projectName,
    scaffoldDate: new Date().toISOString().split("T")[0],
    harnessVersion,
    ...userVariables,
  };
}

/**
 * Extract all variable names referenced in a string.
 */
export function extractVariableNames(template: string): string[] {
  const names: string[] = [];
  let match: RegExpExecArray | null;
  const pattern = new RegExp(VARIABLE_PATTERN.source, "g");
  while ((match = pattern.exec(template)) !== null) {
    if (!names.includes(match[1])) {
      names.push(match[1]);
    }
  }
  return names;
}
