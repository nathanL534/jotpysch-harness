import { describe, test, expect } from "bun:test";
import { listTemplates, resolveTemplate } from "../src/core/registry";

describe("registry", () => {
  test("lists bundled templates", async () => {
    const templates = await listTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(3);

    const names = templates.map((t) => t.manifest.name);
    expect(names).toContain("template-training");
    expect(names).toContain("document-extraction");
    expect(names).toContain("review-synthesis");
  });

  test("filters templates by tag", async () => {
    const templates = await listTemplates(["training"]);
    const names = templates.map((t) => t.manifest.name);
    expect(names).toContain("template-training");
    expect(names).not.toContain("document-extraction");
  });

  test("resolves a template by name", async () => {
    const resolved = await resolveTemplate("template-training");
    expect(resolved.manifest.name).toBe("template-training");
    expect(resolved.source).toBe("bundled");
  });

  test("bundled templates do not require NOTION_API_KEY", async () => {
    const templates = await listTemplates();
    for (const template of templates) {
      const secretNames = template.manifest.requiredSecrets.map((s) => s.name);
      expect(secretNames).not.toContain("NOTION_API_KEY");
    }
  });

  test("throws on unknown template", async () => {
    await expect(resolveTemplate("nonexistent-template")).rejects.toThrow(
      'Template "nonexistent-template" not found'
    );
  });
});
