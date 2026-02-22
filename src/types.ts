/** A variable defined in a template's harness.json */
export interface VariableDefinition {
  name: string;
  prompt: string;
  default?: string;
}

/** A secret required by a template */
export interface SecretDefinition {
  name: string;
  description: string;
  required: boolean;
}

/** A fuel directory declared by a template */
export interface FuelDirDefinition {
  path: string;
  description: string;
  gitignore: boolean;
}

/** The harness.json manifest — source of truth for a template */
export interface HarnessManifest {
  version: string;
  name: string;
  displayName: string;
  description: string;
  author: string;
  tags: string[];
  variables: VariableDefinition[];
  requiredSecrets: SecretDefinition[];
  fuelDirs: FuelDirDefinition[];
}

/** Resolved variable values ready for substitution */
export type VariableMap = Record<string, string>;

/** A resolved template location */
export interface ResolvedTemplate {
  /** Absolute path to the template directory */
  path: string;
  /** The parsed manifest */
  manifest: HarnessManifest;
  /** Where the template was found */
  source: "local" | "registry" | "bundled" | "git";
}

/** Project metadata written to harness.project.json after scaffold */
export interface ProjectMetadata {
  templateName: string;
  templateSource: string;
  scaffoldDate: string;
  harnessVersion: string;
  variables: VariableMap;
  fuelDirs: string[];
}

/** Result of a scaffold operation */
export interface ScaffoldResult {
  outputDir: string;
  filesCopied: string[];
  fuelDirsCreated: string[];
  envExamplePath: string;
  projectMetadata: ProjectMetadata;
}

/** Registry configuration from ~/.harness/config.json */
export interface RegistryConfig {
  registryPath?: string;
}

/** Setup check item for the onboarding checklist */
export interface SetupCheckItem {
  label: string;
  passed: boolean;
  fixable: boolean;
  fix?: () => Promise<void>;
}
