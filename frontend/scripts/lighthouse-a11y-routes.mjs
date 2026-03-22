#!/usr/bin/env node
/**
 * Run Lighthouse accessibility on core routes (preview server must be up).
 * Example: npm run build && npm run preview & sleep 2 && npm run lh:a11y:routes
 * Override: LH_BASE_URL=http://127.0.0.1:4173 npm run lh:a11y:routes
 */
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.env.LH_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const paths = ['/', '/news', '/marketplace'];

let failed = false;
for (const p of paths) {
    const url = p === '/' ? `${base}/` : `${base}${p}`;
    const name = p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '-');
    const outPath = join(root, `lighthouse-a11y-${name}.json`);
    const cmd = `npx --yes lighthouse@12 "${url}" --only-categories=accessibility --quiet --chrome-flags="--headless --no-sandbox" --output=json --output-path="${outPath}"`;
    try {
        execSync(cmd, { stdio: 'inherit', cwd: root });
    } catch {
        failed = true;
        console.error(`[lh:a11y:routes] failed for ${url}`);
    }
}

process.exit(failed ? 1 : 0);
