#!/usr/bin/env node
/**
 * Run Lighthouse performance + accessibility on core mobile routes.
 * Example:
 *   npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *   LH_BASE_URL=http://127.0.0.1:4173 npm run lh:routes
 * Optional env:
 *   LH_ROUTES=/,/gyms,/coaches
 *   LH_PERF_MIN=0.85
 *   LH_A11Y_MIN=0.95
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.env.LH_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const paths = (process.env.LH_ROUTES || '/,/gyms,/coaches,/marketplace,/gallery')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const perfMin = Number(process.env.LH_PERF_MIN || 0.85);
const a11yMin = Number(process.env.LH_A11Y_MIN || 0.95);

let failed = false;
const results = [];
for (const p of paths) {
    const url = p === '/' ? `${base}/` : `${base}${p}`;
    const name = p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '-');
    const outPath = join(root, `lighthouse-routes-${name}.json`);
    const cmd = [
        'npx --yes lighthouse@12',
        `"${url}"`,
        '--only-categories=performance,accessibility',
        '--quiet',
        '--chrome-flags="--headless --no-sandbox"',
        '--output=json',
        `--output-path="${outPath}"`,
    ].join(' ');
    try {
        execSync(cmd, { stdio: 'inherit', cwd: root });

        if (!existsSync(outPath)) {
            failed = true;
            console.error(`[lh:routes] missing report for ${url}`);
            continue;
        }

        const report = JSON.parse(readFileSync(outPath, 'utf8'));
        const perf = Number(report?.categories?.performance?.score ?? 0);
        const a11y = Number(report?.categories?.accessibility?.score ?? 0);
        results.push({ path: p, perf, a11y });

        const perfPct = Math.round(perf * 100);
        const a11yPct = Math.round(a11y * 100);
        console.log(`[lh:routes] ${p}: perf ${perfPct}, a11y ${a11yPct}`);

        if (perf < perfMin || a11y < a11yMin) {
            failed = true;
            console.error(
                `[lh:routes] threshold fail on ${p} (perf ${perfPct}/${Math.round(perfMin * 100)}, a11y ${a11yPct}/${Math.round(a11yMin * 100)})`
            );
        }
    } catch {
        failed = true;
        console.error(`[lh:routes] failed for ${url}`);
    }
}

if (results.length > 0) {
    console.log('\n[lh:routes] summary');
    results.forEach((result) => {
        console.log(
            `- ${result.path}: perf ${Math.round(result.perf * 100)}, a11y ${Math.round(result.a11y * 100)}`
        );
    });
}

process.exit(failed ? 1 : 0);
