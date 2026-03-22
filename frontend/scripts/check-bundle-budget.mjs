import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist/assets');

const BUDGETS = {
    // Tightened 2026-03-23 to prevent JS payload regressions after mobile performance hotfixes.
    // Calibrated from current baseline so CI stays stable while still stricter than previous limits.
    totalJsBytes: 2_296_000,
    maxChunkBytes: 505_000,
    chunkLimits: {
        framework: 428_500,
        charts: 505_000,
        maps: 185_000,
        select: 88_000,
        index: 145_000,
        motion: 178_000,
        socket: 48_000,
    },
};

const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

if (!fs.existsSync(DIST_DIR)) {
    console.error('dist/assets not found. Run build first.');
    process.exit(1);
}

const files = fs.readdirSync(DIST_DIR);
const jsFiles = files
    .filter((f) => f.endsWith('.js'))
    .map((name) => {
        const fullPath = path.join(DIST_DIR, name);
        return { name, size: fs.statSync(fullPath).size };
    })
    .sort((a, b) => b.size - a.size);

const totalJsBytes = jsFiles.reduce((sum, file) => sum + file.size, 0);
const largestChunk = jsFiles[0];

const failures = [];

if (totalJsBytes > BUDGETS.totalJsBytes) {
    failures.push(
        `Total JS exceeded: ${formatKb(totalJsBytes)} > ${formatKb(BUDGETS.totalJsBytes)}`
    );
}

if (largestChunk && largestChunk.size > BUDGETS.maxChunkBytes) {
    failures.push(
        `Largest chunk exceeded: ${largestChunk.name} ${formatKb(largestChunk.size)} > ${formatKb(BUDGETS.maxChunkBytes)}`
    );
}

for (const [chunkKey, limit] of Object.entries(BUDGETS.chunkLimits)) {
    const match = jsFiles.find((file) => file.name.startsWith(`${chunkKey}-`) || file.name.startsWith(`${chunkKey}.`));
    if (!match) {
        continue;
    }

    if (match.size > limit) {
        failures.push(`${chunkKey} chunk exceeded: ${match.name} ${formatKb(match.size)} > ${formatKb(limit)}`);
    }
}

console.log('Bundle budget report');
console.log(`- Total JS: ${formatKb(totalJsBytes)}`);
if (largestChunk) {
    console.log(`- Largest chunk: ${largestChunk.name} (${formatKb(largestChunk.size)})`);
}
console.log('- Top chunks:');
jsFiles.slice(0, 10).forEach((file) => {
    console.log(`  • ${file.name}: ${formatKb(file.size)}`);
});

if (failures.length > 0) {
    console.error('\nBudget check failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
}

console.log('\nBudget check passed.');
