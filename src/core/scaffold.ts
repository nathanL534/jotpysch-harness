import { mkdir, readFile, writeFile } from "fs/promises";
import { join, resolve } from "path";
import type {
  HarnessManifest,
  VariableMap,
  ScaffoldResult,
  ProjectMetadata,
} from "../types.js";
import { buildVariableMap } from "./variables.js";
import { createFuelDirs } from "./fuel.js";
import { copyEngineFiles } from "../utils/fs.js";
import { generateEnvExample } from "../utils/env.js";
import { initGitRepo } from "../utils/git.js";

interface ScaffoldOptions {
  templateDir: string;
  manifest: HarnessManifest;
  outputDir: string;
  userVariables: VariableMap;
  templateSource: string;
  skipGitInit?: boolean;
}

/**
 * Main scaffold orchestrator. Copies engine files, creates fuel dirs,
 * generates .env.example, writes project metadata.
 */
export async function scaffold(options: ScaffoldOptions): Promise<ScaffoldResult> {
  const {
    templateDir,
    manifest,
    outputDir,
    userVariables,
    templateSource,
    skipGitInit,
  } = options;

  const pkgPath = resolve(import.meta.dir, "../../package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
  const harnessVersion: string = pkg.version;
  const projectName = outputDir.split("/").pop() ?? "project";
  const variables = buildVariableMap(userVariables, projectName, harnessVersion);

  // 1. Create output directory
  await mkdir(outputDir, { recursive: true });

  // 2. Copy engine files with variable substitution
  const engineDir = join(templateDir, "engine");
  const filesCopied = await copyEngineFiles(engineDir, outputDir, variables);

  // 3. Create fuel directories + update .gitignore
  const fuelDirsCreated = await createFuelDirs(outputDir, manifest.fuelDirs);

  // 4. Generate .env.example from requiredSecrets
  const envExamplePath = join(outputDir, ".env.example");
  await generateEnvExample(envExamplePath, manifest.requiredSecrets);

  // 5. Write harness.project.json (gitignored metadata)
  const projectMetadata: ProjectMetadata = {
    templateName: manifest.name,
    templateSource,
    scaffoldDate: new Date().toISOString(),
    harnessVersion,
    variables,
    fuelDirs: fuelDirsCreated,
  };

  await writeFile(
    join(outputDir, "harness.project.json"),
    JSON.stringify(projectMetadata, null, 2)
  );

  // 6. Init git repo
  if (!skipGitInit) {
    await initGitRepo(outputDir);
  }

  return {
    outputDir,
    filesCopied,
    fuelDirsCreated,
    envExamplePath,
    projectMetadata,
  };
}
