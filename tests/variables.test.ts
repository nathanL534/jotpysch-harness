import { describe, test, expect } from "bun:test";
import {
  substituteString,
  substitutePath,
  buildVariableMap,
  extractVariableNames,
} from "../src/core/variables";

describe("variables", () => {
  test("substituteString replaces variables", () => {
    const result = substituteString("Hello {{name}}, welcome to {{place}}!", {
      name: "Alice",
      place: "Wonderland",
    });
    expect(result).toBe("Hello Alice, welcome to Wonderland!");
  });

  test("substituteString leaves unknown variables as-is", () => {
    const result = substituteString("Hello {{name}}, {{unknown}}!", {
      name: "Bob",
    });
    expect(result).toBe("Hello Bob, {{unknown}}!");
  });

  test("substituteString handles no variables", () => {
    const result = substituteString("No variables here", {});
    expect(result).toBe("No variables here");
  });

  test("substitutePath replaces variables in paths", () => {
    const result = substitutePath("data/{{projectName}}/output", {
      projectName: "my-project",
    });
    expect(result).toBe("data/my-project/output");
  });

  test("buildVariableMap includes built-in variables", () => {
    const map = buildVariableMap({ custom: "value" }, "test-project", "0.1.0");
    expect(map.projectName).toBe("test-project");
    expect(map.harnessVersion).toBe("0.1.0");
    expect(map.scaffoldDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(map.custom).toBe("value");
  });

  test("extractVariableNames finds all unique variables", () => {
    const names = extractVariableNames(
      "{{a}} and {{b}} and {{a}} again and {{c}}"
    );
    expect(names).toEqual(["a", "b", "c"]);
  });
});
