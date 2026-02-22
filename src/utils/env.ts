import { writeFile } from "fs/promises";
import type { SecretDefinition } from "../types.js";

/**
 * Generate a .env.example file from the template's requiredSecrets.
 */
export async function generateEnvExample(
  outputPath: string,
  secrets: SecretDefinition[]
): Promise<void> {
  if (secrets.length === 0) {
    await writeFile(outputPath, "# No secrets required by this harness\n");
    return;
  }

  const lines = [
    "# Environment variables for this harness",
    "# Copy this file to .env and fill in the values",
    "",
  ];

  for (const secret of secrets) {
    const requiredNote = secret.required ? "(required)" : "(optional)";
    lines.push(`# ${secret.description} ${requiredNote}`);
    lines.push(`${secret.name}=`);
    lines.push("");
  }

  await writeFile(outputPath, lines.join("\n"));
}
