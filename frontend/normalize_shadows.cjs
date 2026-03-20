const fs = require('fs');

const shadowRegexes = [
    { pattern: /\bshadow-lg\b/g, replacement: 'shadow-md' },
    { pattern: /\bshadow-xl\b/g, replacement: 'shadow-md' },
    { pattern: /\bshadow-2xl\b/g, replacement: 'shadow-md' },
];

const filesToProcess = [
    'src/pages/GymOwnerDashboard.tsx',
    'src/pages/Profile.tsx',
    'src/pages/ProfileCV.tsx',
    'src/pages/Coaches.tsx',
    'src/pages/SubscriptionsPage.tsx',
    'src/pages/dashboard/CoachDashboard.tsx',
    'src/pages/dashboard/UserDashboard.tsx',
    'src/pages/CommunityGallery.tsx',
    'src/pages/ProgramsPage.tsx'
];

for (const f of filesToProcess) {
    if (!fs.existsSync(f)) continue;
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    for (const { pattern, replacement } of shadowRegexes) {
        content = content.replace(pattern, replacement);
    }
    
    // Custom: Any specific rgba shadows replace to var(--mk-shadow-soft)
    // Wait, replacing dynamic shadow syntax shadow-[0_4px_24px_rgba(...)]
    const dynamicShadowRegex = /\bshadow-\[0_[0-9]+px_[0-9]+px_rgba\([^)]+\)\]/g;
    content = content.replace(dynamicShadowRegex, 'shadow-[color:var(--mk-shadow-soft)]');
    
    if (content !== original) {
        fs.writeFileSync(f, content);
        console.log(`Updated shadows in ${f}`);
    }
}
