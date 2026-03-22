import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const TARGET_DIRS = ['src/pages', 'src/components', 'src/styles'].map((p) => path.join(ROOT, p));
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
const IGNORE_DIRS = new Set(['node_modules', 'dist', '.git', 'playwright-report', 'coverage']);

// Flags Tailwind arbitrary spacing utilities like p-[13px], mt-[2.75rem], gap-[var(--x)].
const ARBITRARY_SPACING_RE =
  /(?<![\w-])-?(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y)-\[[^\]]+\]/g;

async function walk(dir, out) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
      continue;
    }
    const ext = path.extname(entry.name);
    if (!EXTS.has(ext)) continue;
    out.push(full);
  }
}

function toRel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

async function main() {
  const files = [];
  for (const dir of TARGET_DIRS) {
    try {
      await walk(dir, files);
    } catch {
      // Ignore missing dirs in case the repo structure changes.
    }
  }

  const hits = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const matches = content.match(ARBITRARY_SPACING_RE);
    if (!matches || matches.length === 0) continue;
    hits.push({ file: toRel(file), matches: Array.from(new Set(matches)) });
  }

  if (hits.length === 0) {
    process.stdout.write('spacing:check OK (no arbitrary spacing utilities found)\n');
    return;
  }

  process.stdout.write('spacing:check found arbitrary spacing utilities:\n');
  for (const hit of hits) {
    process.stdout.write(`- ${hit.file}\n`);
    for (const m of hit.matches) {
      process.stdout.write(`  • ${m}\n`);
    }
  }
  process.exitCode = 1;
}

await main();
