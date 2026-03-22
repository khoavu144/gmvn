import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist/assets');

const BUDGETS = {
    // Calibrated 2026-03-23 after adding business instrumentation and route-presentation gates.
    // We now enforce both whole-repo budget and a stricter public/member-core budget.
    totalJsBytes: 2_308_000,
    coreJsBytes: 1_437_000,
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

const CORE_ROUTE_PREFIXES = [
    'Home',
    'Coaches',
    'CoachDetailPage',
    'AthleteDetailPage',
    'Gyms',
    'GymDetailPage',
    'MarketplacePage',
    'ProductDetailPage',
    'NewsPage',
    'NewsDetailPage',
    'PricingPage',
    'Login',
    'Register',
    'VerifyEmail',
    'OnboardingPage',
    'Dashboard',
    'UserDashboard',
    'Profile',
    'MessagesPage',
    'ProgramsPage',
    'WorkoutsPage',
    'SubscriptionsPage',
    'CommunityGallery',
    'index',
    'framework',
    'motion',
    'maps',
    'zod',
    'select',
    'socket',
    'store',
    'userService',
    'faqData',
];

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
const coreFiles = Array.from(
    new Set(
        CORE_ROUTE_PREFIXES.map((prefix) =>
            jsFiles.find((file) => file.name.startsWith(`${prefix}-`) || file.name.startsWith(`${prefix}.`))
        ).filter(Boolean),
    ),
);
const coreJsBytes = coreFiles.reduce((sum, file) => sum + file.size, 0);

const failures = [];

if (totalJsBytes > BUDGETS.totalJsBytes) {
    failures.push(
        `Total JS exceeded: ${formatKb(totalJsBytes)} > ${formatKb(BUDGETS.totalJsBytes)}`
    );
}

if (coreJsBytes > BUDGETS.coreJsBytes) {
    failures.push(
        `Core route JS exceeded: ${formatKb(coreJsBytes)} > ${formatKb(BUDGETS.coreJsBytes)}`
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
console.log(`- Core route JS: ${formatKb(coreJsBytes)}`);
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
