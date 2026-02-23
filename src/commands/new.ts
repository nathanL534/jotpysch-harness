import { Command } from "commander";
import inquirer from "inquirer";
import { resolve, join } from "path";
import { existsSync } from "fs";
import { resolveTemplate } from "../core/registry.js";
import { scaffold } from "../core/scaffold.js";
import type { VariableMap } from "../types.js";
import * as output from "../utils/output.js";

/** Resolve the harness root directory (where projects/ lives) */
function getHarnessRoot(): string {
  return resolve(import.meta.dir, "../..");
}

export function registerNewCommand(program: Command): void {
  program
    .command("new")
    .description("Scaffold a new project from a template")
    .argument("<template>", "Template name or path")
    .argument("[name]", "Project name (defaults to template name)")
    .option("--var <pairs...>", "Variable values as key=value pairs")
    .option("--output <dir>", "Output directory (defaults to ./<name>)")
    .option("--no-git", "Skip git init")
    .option("--no-interactive", "Skip interactive prompts (use defaults)")
    .action(async (templateArg: string, nameArg: string | undefined, opts) => {
      try {
        // 1. Resolve template
        const resolved = await resolveTemplate(templateArg);
        const { manifest } = resolved;

        output.header(`Scaffolding: ${manifest.displayName}`);
        output.keyValue("Template", manifest.name);
        output.keyValue("Source", resolved.source);

        // 2. Determine project name
        const projectName = nameArg ?? manifest.name;

        // 3. Collect variables
        const userVariables: VariableMap = {};

        // Parse --var flags
        if (opts.var) {
          for (const pair of opts.var) {
            const [key, ...rest] = pair.split("=");
            if (key && rest.length > 0) {
              userVariables[key] = rest.join("=");
            }
          }
        }

        // Auto-detect non-interactive: use --no-interactive flag OR no TTY (e.g. Claude's Bash tool)
        const isInteractive = opts.interactive !== false && process.stdin.isTTY;

        // Prompt for missing variables (if interactive)
        if (isInteractive && manifest.variables.length > 0) {
          const missingVars = manifest.variables.filter(
            (v) => !(v.name in userVariables)
          );

          if (missingVars.length > 0) {
            const answers = await inquirer.prompt(
              missingVars.map((v) => ({
                type: "input",
                name: v.name,
                message: v.prompt,
                default: v.default,
              }))
            );

            Object.assign(userVariables, answers);
          }
        } else {
          // Use defaults for non-interactive mode (no TTY or --no-interactive)
          for (const v of manifest.variables) {
            if (!(v.name in userVariables) && v.default) {
              userVariables[v.name] = v.default;
            }
          }
        }

        // Warn if any required variables are still missing (no default, not provided)
        const missingRequired = manifest.variables.filter(
          (v) => !(v.name in userVariables) && !v.default
        );
        if (missingRequired.length > 0) {
          output.error(
            `Missing required variables: ${missingRequired.map((v) => v.name).join(", ")}. Pass them with --var key=value`
          );
          process.exit(1);
        }

        // 4. Scaffold — default to projects/<name>/ inside the harness repo
        const outputDir = opts.output
          ? resolve(opts.output)
          : join(getHarnessRoot(), "projects", projectName);

        // Check if output directory already exists
        if (existsSync(outputDir)) {
          if (isInteractive) {
            const { overwrite } = await inquirer.prompt([
              {
                type: "confirm",
                name: "overwrite",
                message: `${outputDir} already exists. Overwrite?`,
                default: false,
              },
            ]);
            if (!overwrite) {
              output.info("Cancelled.");
              return;
            }
          } else {
            output.error(
              `${outputDir} already exists. Use --output to specify a different location.`
            );
            process.exit(1);
          }
        }

        const result = await scaffold({
          templateDir: resolved.path,
          manifest,
          outputDir,
          userVariables,
          templateSource: resolved.source,
          skipGitInit: !opts.git,
        });

        // 5. Print results
        output.header("Project scaffolded successfully");
        output.keyValue("Location", result.outputDir);
        output.keyValue("Files copied", String(result.filesCopied.length));
        output.keyValue("Fuel dirs", result.fuelDirsCreated.join(", ") || "none");

        console.log();
        output.info("Next steps:");
        const hasProjectNotionMcp = existsSync(
          join(resolved.path, "engine", ".mcp.json")
        );
        const nextSteps = [
          `cd ${result.outputDir}`,
          "Copy .env.example to .env and fill in secrets",
          hasProjectNotionMcp
            ? "Run /mcp in Claude Code and authenticate Notion (one-time OAuth)"
            : "Run harness setup to verify project onboarding",
          "Run: claude .",
        ];
        output.bulletList(nextSteps);
      } catch (err) {
        output.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });
}
