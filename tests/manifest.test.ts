import { describe, test, expect } from "bun:test";
import { loadManifest, ManifestSchema } from "../src/core/manifest";
import { join } from "path";

const FIXTURES = join(import.meta.dir, "fixtures");

describe("manifest", () => {
  test("loads a valid harness.json", async () => {
    const manifest = await loadManifest(join(FIXTURES, "valid-template"));
    expect(manifest.name).toBe("test-template");
    expect(manifest.displayName).toBe("Test Template");
    expect(manifest.variables).toHaveLength(1);
    expect(manifest.variables[0].name).toBe("greeting");
    expect(manifest.requiredSecrets).toHaveLength(1);
    expect(manifest.fuelDirs).toHaveLength(2);
  });

  test("throws on missing harness.json", async () => {
    await expect(loadManifest("/nonexistent/path")).rejects.toThrow(
      "No harness.json found"
    );
  });

  test("validates schema correctly", () => {
    const valid = ManifestSchema.safeParse({
      version: "1",
      name: "test",
      displayName: "Test",
      description: "A test",
      author: "Tester",
      tags: [],
      variables: [],
      requiredSecrets: [],
      fuelDirs: [],
    });
    expect(valid.success).toBe(true);
  });

  test("rejects invalid manifest", () => {
    const invalid = ManifestSchema.safeParse({
      version: "1",
      name: "",  // empty name should fail
      displayName: "Test",
      description: "A test",
      author: "Tester",
      tags: [],
      variables: [],
      requiredSecrets: [],
      fuelDirs: [],
    });
    expect(invalid.success).toBe(false);
  });
});
