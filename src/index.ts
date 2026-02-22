#!/usr/bin/env bun
import { Command } from "commander";
import { registerNewCommand } from "./commands/new.js";
import { registerListCommand } from "./commands/list.js";
import { registerSetupCommand } from "./commands/setup.js";
import { registerExportCommand } from "./commands/export.js";

const program = new Command();

program
  .name("harness")
  .description("Claude Code workspace scaffolder — build harnesses from templates")
  .version("0.1.0");

registerNewCommand(program);
registerListCommand(program);
registerSetupCommand(program);
registerExportCommand(program);

program.parse();
