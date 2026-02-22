import chalk from "chalk";

/** Print a success message */
export function success(message: string): void {
  console.log(chalk.green("✓") + " " + message);
}

/** Print an error message */
export function error(message: string): void {
  console.error(chalk.red("✗") + " " + message);
}

/** Print an info message */
export function info(message: string): void {
  console.log(chalk.blue("ℹ") + " " + message);
}

/** Print a warning message */
export function warn(message: string): void {
  console.log(chalk.yellow("⚠") + " " + message);
}

/** Print a section header */
export function header(title: string): void {
  console.log();
  console.log(chalk.bold.underline(title));
  console.log();
}

/** Print a key-value pair */
export function keyValue(key: string, value: string): void {
  console.log(`  ${chalk.dim(key + ":")} ${value}`);
}

/** Print a checklist item */
export function checkItem(label: string, passed: boolean): void {
  const icon = passed ? chalk.green("✓") : chalk.red("✗");
  console.log(`  ${icon} ${label}`);
}

/** Print a list of items with bullets */
export function bulletList(items: string[]): void {
  for (const item of items) {
    console.log(`  • ${item}`);
  }
}

/** Format a template for display in list output */
export function formatTemplate(name: string, description: string, tags: string[]): string {
  const tagStr = tags.length > 0 ? chalk.dim(` [${tags.join(", ")}]`) : "";
  return `  ${chalk.bold(name)} — ${description}${tagStr}`;
}
