/**
 * Initialize a git repository in the given directory.
 */
export async function initGitRepo(dir: string): Promise<void> {
  const proc = Bun.spawn(["git", "init"], {
    cwd: dir,
    stdout: "pipe",
    stderr: "pipe",
  });

  await proc.exited;

  if (proc.exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`git init failed: ${stderr}`);
  }
}
