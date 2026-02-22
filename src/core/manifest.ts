import { z } from "zod";
import { readFile } from "fs/promises";
import { join } from "path";
import type { HarnessManifest } from "../types.js";

const VariableSchema = z.object({
  name: z.string().min(1),
  prompt: z.string().min(1),
  default: z.string().optional(),
});

const SecretSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  required: z.boolean(),
});

const FuelDirSchema = z.object({
  path: z.string().min(1),
  description: z.string().min(1),
  gitignore: z.boolean(),
});

export const ManifestSchema = z.object({
  version: z.string(),
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  tags: z.array(z.string()),
  variables: z.array(VariableSchema),
  requiredSecrets: z.array(SecretSchema),
  fuelDirs: z.array(FuelDirSchema),
});

/**
 * Load and validate a harness.json manifest from a template directory.
 * Throws with a descriptive error if validation fails.
 */
export async function loadManifest(templateDir: string): Promise<HarnessManifest> {
  const manifestPath = join(templateDir, "harness.json");

  let raw: string;
  try {
    raw = await readFile(manifestPath, "utf-8");
  } catch {
    throw new Error(`No harness.json found at ${manifestPath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in ${manifestPath}`);
  }

  const result = ManifestSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid harness.json at ${manifestPath}:\n${issues}`);
  }

  return result.data;
}
