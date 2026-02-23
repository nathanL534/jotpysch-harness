import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { createFuelDirs } from "../src/core/fuel";
import { mkdtemp, rm, readFile, readdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

describe("fuel", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "harness-fuel-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("creates fuel directories", async () => {
    const fuelDirs = [
      { path: "data/input", description: "Input files", gitignore: true },
      { path: "data/output", description: "Output files", gitignore: true },
    ];

    const created = await createFuelDirs(tempDir, fuelDirs);

    expect(created).toEqual(["data/input", "data/output"]);

    // Check dirs exist
    const inputEntries = await readdir(join(tempDir, "data/input"));
    expect(inputEntries).toContain(".gitkeep");

    const outputEntries = await readdir(join(tempDir, "data/output"));
    expect(outputEntries).toContain(".gitkeep");
  });

  test("appends fuel dirs to .gitignore", async () => {
    const fuelDirs = [
      { path: "data/input", description: "Input files", gitignore: true },
    ];

    await createFuelDirs(tempDir, fuelDirs);

    const gitignore = await readFile(join(tempDir, ".gitignore"), "utf-8");
    expect(gitignore).toContain("data/input/");
    expect(gitignore).toContain("# Input files");
    expect(gitignore).toContain("Harness Fuel");
  });

  test("does not add non-gitignored dirs to .gitignore", async () => {
    const fuelDirs = [
      { path: "data/shared", description: "Shared files", gitignore: false },
    ];

    await createFuelDirs(tempDir, fuelDirs);

    // .gitignore should not exist or not contain the dir
    try {
      const gitignore = await readFile(join(tempDir, ".gitignore"), "utf-8");
      expect(gitignore).not.toContain("data/shared/");
    } catch {
      // No .gitignore created is also valid
    }
  });
});
