import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, relative } from "path";
import { substituteString, substitutePath } from "../core/variables.js";
import type { VariableMap } from "../types.js";

/**
 * Recursively copy all files from engineDir to outputDir,
 * applying variable substitution to both file contents and paths.
 * Returns a list of relative paths of files copied.
 */
export async function copyEngineFiles(
  engineDir: string,
  outputDir: string,
  variables: VariableMap
): Promise<string[]> {
  const copied: string[] = [];
  await copyDirRecursive(engineDir, outputDir, engineDir, variables, copied);
  return copied;
}

async function copyDirRecursive(
  currentDir: string,
  outputDir: string,
  engineRoot: string,
  variables: VariableMap,
  copied: string[]
): Promise<void> {
  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(currentDir, entry.name);
    const relPath = relative(engineRoot, srcPath);
    const substitutedRelPath = substitutePath(relPath, variables);
    const destPath = join(outputDir, substitutedRelPath);

    if (entry.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      await copyDirRecursive(srcPath, outputDir, engineRoot, variables, copied);
    } else {
      await mkdir(join(destPath, ".."), { recursive: true });

      // Check if file is binary by trying to read as text
      const content = await readFile(srcPath);
      if (isBinary(content)) {
        await writeFile(destPath, content);
      } else {
        const text = content.toString("utf-8");
        const substituted = substituteString(text, variables);
        await writeFile(destPath, substituted);
      }

      copied.push(substitutedRelPath);
    }
  }
}

/** Simple binary detection: check for null bytes in the first 8KB */
function isBinary(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, 8192);
  for (let i = 0; i < sample.length; i++) {
    if (sample[i] === 0) return true;
  }
  return false;
}
