import { Command } from "commander";
import {
  readdir,
  readFile,
  writeFile,
  mkdir,
  copyFile,
  stat,
} from "fs/promises";
import { join, resolve, relative } from "path";
import { existsSync } from "fs";
import inquirer from "inquirer";
import type { HarnessManifest, FuelDirDefinition } from "../types.js";
import * as output from "../utils/output.js";

/** Files/dirs to always skip when exporting */
const SKIP_ALWAYS = new Set([
  "node_modules",
  ".git",
  ".env",
  "harness.project.json",
  ".DS_Store",
]);

/** Resolve the harness root directory (where templates/ lives) */
function getHarnessRoot(): string {
  return resolve(import.meta.dir, "../..");
}

/**
 * Parse a .gitignore file and return the ignored paths as potential fuel dirs.
 * Strips comments, blank lines, and negations.
 */
function parseGitignore(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("!"))
    .map((line) => line.replace(/\/$/, "")) // strip trailing slash
    .filter(
      (line) =>
        // Skip generic patterns like *.pdf, .env, .DS_Store — we want directories
        !line.startsWith("*") &&
        !line.startsWith(".") &&
        !SKIP_ALWAYS.has(line)
    );
}

/**
 * Scan file contents for a literal string and report which files contain it.
 * Used to detect project-specific names that should become {{variables}}.
 */
async function findStringInFiles(
  dir: string,
  searchStr: string,
  skipDirs: Set<string>
): Promise<string[]> {
  const matches: string[] = [];
  await scanDir(dir, dir, searchStr, skipDirs, matches);
  return matches;
}

async function scanDir(
  currentDir: string,
  rootDir: string,
  searchStr: string,
  skipDirs: Set<string>,
  matches: string[]
): Promise<void> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_ALWAYS.has(entry.name) || skipDirs.has(entry.name)) continue;

    const fullPath = join(currentDir, entry.name);
    const relPath = relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      await scanDir(fullPath, rootDir, searchStr, skipDirs, matches);
    } else {
      try {
        const content = await readFile(fullPath, "utf-8");
        if (content.includes(searchStr)) {
          matches.push(relPath);
        }
      } catch {
        // Skip binary/unreadable files
      }
    }
  }
}

export function registerExportCommand(program: Command): void {
  program
    .command("export")
    .description("Extract engine from an existing project into a template")
    .option("--from <path>", "Source project directory", ".")
    .option("--output <path>", "Output template directory")
    .option("--name <name>", "Template name")
    .action(async (opts) => {
      try {
        const sourceDir = resolve(opts.from);

        if (!existsSync(sourceDir)) {
          output.error(`Source directory not found: ${sourceDir}`);
          process.exit(1);
        }

        // Determine template name
        let templateName = opts.name;
        if (!templateName) {
          const answers = await inquirer.prompt([
            {
              type: "input",
              name: "name",
              message: "Template name?",
              default: sourceDir.split("/").pop(),
            },
          ]);
          templateName = answers.name;
        }

        // Default output into the harness templates/ directory
        const outputDir = opts.output
          ? resolve(opts.output)
          : join(getHarnessRoot(), "templates", templateName);

        output.header(`Exporting template: ${templateName}`);
        output.keyValue("Source", sourceDir);
        output.keyValue("Output", outputDir);

        // 1. Read .gitignore to detect fuel dirs
        const gitignorePath = join(sourceDir, ".gitignore");
        let fuelPaths: string[] = [];
        const fuelDirs: FuelDirDefinition[] = [];

        if (existsSync(gitignorePath)) {
          const gitignoreContent = await readFile(gitignorePath, "utf-8");
          fuelPaths = parseGitignore(gitignoreContent);

          // Check which ignored paths are actual directories
          for (const fp of fuelPaths) {
            const fullPath = join(sourceDir, fp);
            try {
              const s = await stat(fullPath);
              if (s.isDirectory()) {
                fuelDirs.push({
                  path: fp,
                  description: `${fp} directory (auto-detected from .gitignore)`,
                  gitignore: true,
                });
              }
            } catch {
              // Path doesn't exist yet — still include it as declared fuel
              fuelDirs.push({
                path: fp,
                description: `${fp} directory (declared in .gitignore)`,
                gitignore: true,
              });
            }
          }

          if (fuelDirs.length > 0) {
            output.info(
              `Detected ${fuelDirs.length} fuel dir(s) from .gitignore:`
            );
            output.bulletList(fuelDirs.map((f) => f.path));
          }
        }

        const fuelPathSet = new Set(fuelPaths);

        // 2. Copy engine files (everything NOT in fuel/skip)
        const engineOutDir = join(outputDir, "engine");
        await mkdir(engineOutDir, { recursive: true });

        const filesCopied: string[] = [];
        await copyEngineRecursive(
          sourceDir,
          engineOutDir,
          sourceDir,
          fuelPathSet,
          filesCopied
        );

        output.info(`Copied ${filesCopied.length} engine file(s)`);

        // 3. Detect and replace project-specific values with {{variables}}
        const projectFolderName = sourceDir.split("/").pop() ?? "";
        let replacementsMade = 0;

        if (projectFolderName.length > 2) {
          // Scan the EXPORTED engine files (not the source) for the project name
          const engineFiles = await findStringInFiles(
            engineOutDir,
            projectFolderName,
            new Set()
          );

          if (engineFiles.length > 0) {
            output.info(
              `Found "${projectFolderName}" in ${engineFiles.length} engine file(s) — replacing with {{projectName}}:`
            );
            output.bulletList(engineFiles);

            // Do the replacement in the exported files
            for (const relPath of engineFiles) {
              const filePath = join(engineOutDir, relPath);
              const content = await readFile(filePath, "utf-8");
              const replaced = content.replaceAll(projectFolderName, "{{projectName}}");
              await writeFile(filePath, replaced);
              replacementsMade++;
            }

            output.success(
              `Replaced "${projectFolderName}" → {{projectName}} in ${replacementsMade} file(s)`
            );
          }
        }

        // Also check harness.project.json for variable values to reverse
        const projectMetaPath = join(sourceDir, "harness.project.json");
        let extraReplacements = 0;
        if (existsSync(projectMetaPath)) {
          try {
            const meta = JSON.parse(await readFile(projectMetaPath, "utf-8"));
            const vars: Record<string, string> = meta.variables ?? {};

            // For each user-provided variable, find and replace its value in engine files
            for (const [varName, varValue] of Object.entries(vars)) {
              if (
                varName === "projectName" ||
                varName === "scaffoldDate" ||
                varName === "harnessVersion" ||
                !varValue ||
                varValue.length < 2
              )
                continue;

              const filesWithValue = await findStringInFiles(
                engineOutDir,
                varValue,
                new Set()
              );

              if (filesWithValue.length > 0) {
                for (const relPath of filesWithValue) {
                  const filePath = join(engineOutDir, relPath);
                  const content = await readFile(filePath, "utf-8");
                  const replaced = content.replaceAll(varValue, `{{${varName}}}`);
                  await writeFile(filePath, replaced);
                  extraReplacements++;
                }
                output.success(
                  `Replaced "${varValue}" → {{${varName}}} in ${filesWithValue.length} file(s)`
                );
              }
            }
          } catch {
            // No project metadata — that's fine, skip variable reversal
          }
        }

        // 4. Infer secrets from .env.example
        const secretDefs: Array<{
          name: string;
          description: string;
          required: boolean;
        }> = [];
        const envExamplePath = join(sourceDir, ".env.example");
        if (existsSync(envExamplePath)) {
          const envContent = await readFile(envExamplePath, "utf-8");
          const lines = envContent.split("\n");
          let lastComment = "";
          for (const line of lines) {
            if (line.startsWith("#")) {
              lastComment = line.replace(/^#\s*/, "");
            }
            const match = line.match(/^([A-Z_]+)=/);
            if (match) {
              secretDefs.push({
                name: match[1],
                description: lastComment || `${match[1]} environment variable`,
                required: true,
              });
              lastComment = "";
            }
          }
        }

        // 5. Generate harness.json
        const manifest: HarnessManifest = {
          version: "1",
          name: templateName,
          displayName: templateName
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase()),
          description: `Template exported from ${projectFolderName}`,
          author: "JotPsych",
          tags: [],
          variables: [],
          requiredSecrets: secretDefs,
          fuelDirs,
        };

        await writeFile(
          join(outputDir, "harness.json"),
          JSON.stringify(manifest, null, 2)
        );

        // 6. Print results
        output.header("Export complete");
        output.keyValue("Engine files", String(filesCopied.length));
        output.keyValue("Fuel dirs detected", String(fuelDirs.length));
        output.keyValue("Variable replacements", String(replacementsMade + extraReplacements));
        output.keyValue("Secrets detected", String(secretDefs.length));
        output.keyValue("Template saved to", outputDir);

        // 7. Human review checklist — items that automation can't handle
        console.log();
        output.header("Needs human review");

        const reviewItems: string[] = [];

        if (manifest.variables.length === 0) {
          reviewItems.push(
            "harness.json `variables` is empty — add variable definitions for any {{placeholders}} used in engine files"
          );
        }

        if (manifest.description.startsWith("Template exported from")) {
          reviewItems.push(
            `harness.json \`description\` is auto-generated — replace with a clear one-line description`
          );
        }

        if (manifest.tags.length === 0) {
          reviewItems.push(
            "harness.json `tags` is empty — add tags (e.g. \"medical\", \"billing\") for discoverability"
          );
        }

        if (replacementsMade === 0 && extraReplacements === 0) {
          reviewItems.push(
            "No variable replacements were made — scan engine files manually for hardcoded instance-specific values"
          );
        }

        reviewItems.push(
          "Scan engine files for any remaining instance-specific paths, names, or IDs that weren't auto-replaced"
        );

        reviewItems.push(
          `Test the template end-to-end: bun run src/index.ts new ${templateName} test-export`
        );

        reviewItems.push("Push to share: git add templates/" + templateName + " && git commit && git push");

        output.bulletList(reviewItems);
      } catch (err) {
        output.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });
}

async function copyEngineRecursive(
  currentDir: string,
  destDir: string,
  rootDir: string,
  fuelPaths: Set<string>,
  copied: string[]
): Promise<void> {
  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const relPath = relative(rootDir, join(currentDir, entry.name));

    // Skip fuel dirs and always-skip items
    if (SKIP_ALWAYS.has(entry.name)) continue;
    if (fuelPaths.has(relPath) || fuelPaths.has(entry.name)) continue;

    const srcPath = join(currentDir, entry.name);
    const dstPath = join(destDir, entry.name);

    if (entry.isDirectory()) {
      await mkdir(dstPath, { recursive: true });
      await copyEngineRecursive(srcPath, dstPath, rootDir, fuelPaths, copied);
    } else {
      await mkdir(join(dstPath, ".."), { recursive: true });
      await copyFile(srcPath, dstPath);
      copied.push(relPath);
    }
  }
}
