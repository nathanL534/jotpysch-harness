import { Command } from "commander";
import { listTemplates } from "../core/registry.js";
import * as output from "../utils/output.js";

export function registerListCommand(program: Command): void {
  program
    .command("list")
    .description("List available templates")
    .option("--tags <tags...>", "Filter by tags")
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      try {
        const templates = await listTemplates(opts.tags);

        if (templates.length === 0) {
          output.info("No templates found.");
          return;
        }

        if (opts.json) {
          console.log(
            JSON.stringify(
              templates.map((t) => ({
                name: t.manifest.name,
                displayName: t.manifest.displayName,
                description: t.manifest.description,
                tags: t.manifest.tags,
                source: t.source,
                path: t.path,
              })),
              null,
              2
            )
          );
          return;
        }

        output.header("Available Templates");
        for (const t of templates) {
          console.log(
            output.formatTemplate(
              t.manifest.name,
              t.manifest.description,
              t.manifest.tags
            )
          );
        }
        console.log();
      } catch (err) {
        output.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });
}
