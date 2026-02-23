import { Command } from "commander";
import { readFile, mkdir, copyFile } from "fs/promises";
import { join, resolve } from "path";
import { existsSync } from "fs";
import type { ProjectMetadata, SetupCheckItem } from "../types.js";
import * as output from "../utils/output.js";

async function hasNotionMcpConfig(projectDir: string): Promise<boolean> {
  const mcpPath = join(projectDir, ".mcp.json");
  if (!existsSync(mcpPath)) return false;

  try {
    const raw = await readFile(mcpPath, "utf-8");
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.mcpServers?.notion);
  } catch {
    return false;
  }
}

export function registerSetupCommand(program: Command): void {
  program
    .command("setup")
    .description("Onboarding checklist for a cloned/scaffolded project")
    .option("--fix", "Automatically fix what can be fixed")
    .action(async (opts) => {
      try {
        const projectDir = resolve(".");
        const metadataPath = join(projectDir, "harness.project.json");

        // Load project metadata
        let metadata: ProjectMetadata;
        try {
          const raw = await readFile(metadataPath, "utf-8");
          metadata = JSON.parse(raw);
        } catch {
          output.error(
            "No harness.project.json found. Is this a harness project?"
          );
          process.exit(1);
          return;
        }

        output.header(`Setup Check: ${metadata.templateName}`);
        output.keyValue("Scaffolded", metadata.scaffoldDate);
        output.keyValue("Template", metadata.templateName);

        const checks: SetupCheckItem[] = [];

        // Check 1: .env exists (with support for nested config/.env.example templates)
        const envPath = join(projectDir, ".env");
        const rootEnvExamplePath = join(projectDir, ".env.example");
        const configEnvExamplePath = join(projectDir, "config", ".env.example");
        const envExamplePath = existsSync(rootEnvExamplePath)
          ? rootEnvExamplePath
          : configEnvExamplePath;
        const envExists = existsSync(envPath);
        checks.push({
          label: ".env file exists",
          passed: envExists,
          fixable: true,
          fix: async () => {
            if (existsSync(envExamplePath)) {
              await copyFile(envExamplePath, envPath);
              output.success("Copied .env.example → .env");
            }
          },
        });

        // Check 2: Fuel dirs exist
        for (const fuelDir of metadata.fuelDirs) {
          const dirPath = join(projectDir, fuelDir);
          const dirExists = existsSync(dirPath);
          checks.push({
            label: `Fuel dir exists: ${fuelDir}`,
            passed: dirExists,
            fixable: true,
            fix: async () => {
              await mkdir(dirPath, { recursive: true });
              output.success(`Created ${fuelDir}/`);
            },
          });
        }

        // Check 3: .claude directory exists
        const claudeDir = join(projectDir, ".claude");
        checks.push({
          label: ".claude/ directory exists",
          passed: existsSync(claudeDir),
          fixable: false,
        });

        // Check 4: CLAUDE.md exists
        checks.push({
          label: "CLAUDE.md exists",
          passed: existsSync(join(projectDir, "CLAUDE.md")),
          fixable: false,
        });

        // Check 5: Notion MCP config + subagent
        const notionMcpConfigured = await hasNotionMcpConfig(projectDir);
        if (notionMcpConfigured) {
          checks.push({
            label: "Notion MCP configured in .mcp.json",
            passed: true,
            fixable: false,
          });
          checks.push({
            label: "Notion subagent exists (.claude/agents/notion-sync.md)",
            passed: existsSync(join(projectDir, ".claude", "agents", "notion-sync.md")),
            fixable: false,
          });
        }

        // Print results
        console.log();
        let allPassed = true;
        for (const check of checks) {
          output.checkItem(check.label, check.passed);
          if (!check.passed) allPassed = false;
        }

        console.log();
        if (allPassed) {
          output.success("All checks passed! Ready to use with Claude.");
        } else {
          const fixable = checks.filter((c) => !c.passed && c.fixable);
          if (fixable.length > 0 && opts.fix) {
            output.info("Fixing what we can...");
            for (const check of fixable) {
              if (check.fix) await check.fix();
            }
          } else if (fixable.length > 0) {
            output.info(
              `${fixable.length} issue(s) can be auto-fixed. Run: harness setup --fix`
            );
          }
        }

        if (notionMcpConfigured) {
          console.log();
          output.info("Notion MCP onboarding:");
          output.bulletList([
            "In Claude Code, run /mcp and authenticate your Notion account (one-time OAuth)",
            "Use the Notion subagent for create/link/publish sync tasks",
            "If auth is missing, core local harness workflows still work",
          ]);
        }
      } catch (err) {
        output.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });
}
