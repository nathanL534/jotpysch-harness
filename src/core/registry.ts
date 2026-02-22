import { readdir, readFile, stat } from "fs/promises";
import { join, resolve, isAbsolute } from "path";
import { existsSync } from "fs";
import { homedir } from "os";
import { loadManifest } from "./manifest.js";
import type { ResolvedTemplate, RegistryConfig } from "../types.js";

/** Path to bundled templates inside the harness package */
function getBundledTemplatesDir(): string {
  return resolve(import.meta.dir, "../../templates");
}

/** Load user config from ~/.harness/config.json */
async function loadUserConfig(): Promise<RegistryConfig> {
  const configPath = join(homedir(), ".harness", "config.json");
  try {
    const raw = await readFile(configPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Check if a path looks like a git URL */
function isGitUrl(path: string): boolean {
  return path.startsWith("git@") || path.startsWith("https://") && path.endsWith(".git");
}

/** Clone a git registry to ~/.harness/registry-cache/ */
async function cloneGitRegistry(url: string): Promise<string> {
  const cacheDir = join(homedir(), ".harness", "registry-cache");
  const repoName = url.split("/").pop()?.replace(".git", "") ?? "registry";
  const targetDir = join(cacheDir, repoName);

  const proc = Bun.spawn(["git", "clone", "--depth", "1", url, targetDir], {
    stdout: "pipe",
    stderr: "pipe",
  });
  await proc.exited;

  if (proc.exitCode !== 0) {
    // Try pulling if already cloned
    const pullProc = Bun.spawn(["git", "-C", targetDir, "pull", "--depth", "1"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    await pullProc.exited;
  }

  return targetDir;
}

/**
 * Get all registry directories to search, in priority order.
 */
async function getRegistryPaths(): Promise<Array<{ path: string; source: "local" | "registry" | "bundled" | "git" }>> {
  const paths: Array<{ path: string; source: "local" | "registry" | "bundled" | "git" }> = [];

  // 1. HARNESS_TEMPLATE_REGISTRY env var
  const envRegistry = process.env.HARNESS_TEMPLATE_REGISTRY;
  if (envRegistry) {
    if (isGitUrl(envRegistry)) {
      const cloned = await cloneGitRegistry(envRegistry);
      paths.push({ path: cloned, source: "git" });
    } else {
      paths.push({ path: resolve(envRegistry), source: "registry" });
    }
  }

  // 2. User config
  const config = await loadUserConfig();
  if (config.registryPath) {
    if (isGitUrl(config.registryPath)) {
      const cloned = await cloneGitRegistry(config.registryPath);
      paths.push({ path: cloned, source: "git" });
    } else {
      paths.push({ path: resolve(config.registryPath), source: "registry" });
    }
  }

  // 3. Bundled templates
  paths.push({ path: getBundledTemplatesDir(), source: "bundled" });

  return paths;
}

/**
 * List all templates from all registries (deduplicated by name, first wins).
 */
export async function listTemplates(filterTags?: string[]): Promise<ResolvedTemplate[]> {
  const registries = await getRegistryPaths();
  const seen = new Set<string>();
  const templates: ResolvedTemplate[] = [];

  for (const registry of registries) {
    try {
      const entries = await readdir(registry.path, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const templateDir = join(registry.path, entry.name);
        try {
          const manifest = await loadManifest(templateDir);
          if (seen.has(manifest.name)) continue;
          seen.add(manifest.name);

          if (filterTags && filterTags.length > 0) {
            const hasTag = filterTags.some((t) => manifest.tags.includes(t));
            if (!hasTag) continue;
          }

          templates.push({ path: templateDir, manifest, source: registry.source });
        } catch {
          // Skip directories without valid harness.json
        }
      }
    } catch {
      // Skip inaccessible registries
    }
  }

  return templates;
}

/**
 * Resolve a single template by name or path.
 */
export async function resolveTemplate(nameOrPath: string): Promise<ResolvedTemplate> {
  // Direct path?
  const absolutePath = isAbsolute(nameOrPath) ? nameOrPath : resolve(nameOrPath);
  if (existsSync(join(absolutePath, "harness.json"))) {
    const manifest = await loadManifest(absolutePath);
    return { path: absolutePath, manifest, source: "local" };
  }

  // Search registries by name
  const registries = await getRegistryPaths();
  for (const registry of registries) {
    const templateDir = join(registry.path, nameOrPath);
    try {
      const s = await stat(templateDir);
      if (s.isDirectory()) {
        const manifest = await loadManifest(templateDir);
        return { path: templateDir, manifest, source: registry.source };
      }
    } catch {
      // Not found in this registry
    }
  }

  throw new Error(
    `Template "${nameOrPath}" not found. Run "harness list" to see available templates.`
  );
}
