import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { FuelDirDefinition } from "../types.js";

/**
 * Create fuel directories and update .gitignore with fuel entries.
 * Returns the list of directories created.
 */
export async function createFuelDirs(
  outputDir: string,
  fuelDirs: FuelDirDefinition[]
): Promise<string[]> {
  const created: string[] = [];

  for (const fuel of fuelDirs) {
    const dirPath = join(outputDir, fuel.path);
    await mkdir(dirPath, { recursive: true });

    // Write a .gitkeep so the directory structure is preserved in git
    // even though contents are gitignored
    await writeFile(join(dirPath, ".gitkeep"), "");

    created.push(fuel.path);
  }

  // Append fuel dirs to .gitignore
  const gitignorePath = join(outputDir, ".gitignore");
  const gitignoreEntries = fuelDirs.filter((f) => f.gitignore);

  if (gitignoreEntries.length > 0) {
    let existing = "";
    try {
      existing = await readFile(gitignorePath, "utf-8");
    } catch {
      // No existing .gitignore — that's fine
    }

    const fuelSection = [
      "",
      "# === Harness Fuel (local-only data, never committed) ===",
      ...gitignoreEntries.map((f) => `# ${f.description}\n${f.path}/`),
      "",
    ].join("\n");

    await writeFile(gitignorePath, existing + fuelSection);
  }

  return created;
}
