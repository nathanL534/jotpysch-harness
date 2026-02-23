import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { scaffold } from "../src/core/scaffold";
import { loadManifest } from "../src/core/manifest";
import { mkdtemp, rm, readFile, readdir, stat } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync } from "fs";

const FIXTURES = join(import.meta.dir, "fixtures");

describe("scaffold", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "harness-scaffold-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("scaffolds a project from a template", async () => {
    const templateDir = join(FIXTURES, "valid-template");
    const manifest = await loadManifest(templateDir);
    const outputDir = join(tempDir, "my-project");

    const result = await scaffold({
      templateDir,
      manifest,
      outputDir,
      userVariables: { greeting: "Hi" },
      templateSource: "local",
      skipGitInit: true,
    });

    // Check files were copied
    expect(result.filesCopied.length).toBeGreaterThan(0);
    expect(result.outputDir).toBe(outputDir);

    // Check CLAUDE.md has variable substitution
    const claudeMd = await readFile(join(outputDir, "CLAUDE.md"), "utf-8");
    expect(claudeMd).toContain("my-project");
    expect(claudeMd).toContain("Hi");
    expect(claudeMd).not.toContain("{{projectName}}");
    expect(claudeMd).not.toContain("{{greeting}}");

    // Check fuel dirs were created
    expect(result.fuelDirsCreated).toContain("data/input");
    expect(result.fuelDirsCreated).toContain("data/output");
    expect(existsSync(join(outputDir, "data/input"))).toBe(true);

    // Check .env.example was generated
    expect(existsSync(join(outputDir, ".env.example"))).toBe(true);
    const envExample = await readFile(join(outputDir, ".env.example"), "utf-8");
    expect(envExample).toContain("TEST_KEY");

    // Check harness.project.json was written
    expect(existsSync(join(outputDir, "harness.project.json"))).toBe(true);
    const metadata = JSON.parse(
      await readFile(join(outputDir, "harness.project.json"), "utf-8")
    );
    expect(metadata.templateName).toBe("test-template");
    expect(metadata.variables.greeting).toBe("Hi");
  });
});
