const fs = require('fs');
const glob = require('glob');

const mapping = {
    // 8px
    'rounded-\\[0\\.2rem\\]': 'rounded',
    'rounded-sm': 'rounded',
    
    // 12px
    'rounded-md': 'rounded-lg',
    'rounded': 'rounded-lg', // wait, replacing "rounded" might conflict if I don't use word boundaries
    
    // 16px
    'rounded-\\[0\\.9rem\\]': 'rounded-xl',
    'rounded-\\[1rem\\]': 'rounded-xl',
    'rounded-\\[1\\.2rem\\]': 'rounded-xl',
    'rounded-\\[1\\.25rem\\]': 'rounded-xl',
    
    // 24px
    'rounded-\\[1\\.3rem\\]': 'rounded-2xl',
    'rounded-\\[1\\.4rem\\]': 'rounded-2xl',
    'rounded-\\[1\\.5rem\\]': 'rounded-2xl',
    'rounded-\\[1\\.55rem\\]': 'rounded-2xl',
    'rounded-\\[1\\.6rem\\]': 'rounded-2xl',
    
    // 32px or 40px
    'rounded-\\[2rem\\]': 'rounded-3xl',
    'rounded-\\[2\\.5rem\\]': 'rounded-3xl'
};

const files = [
    'src/pages/GymDetailPage.tsx',
    'src/pages/NewsPage.tsx',
    'src/pages/NewsDetailPage.tsx',
    'src/pages/Gyms.tsx',
    'src/pages/dashboard/AdminDashboard.tsx',
    'src/pages/Profile.tsx',
    'src/pages/CoachDetailPage.tsx',
];

for (const f of files) {
    if (!fs.existsSync(f)) continue;
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    for (const [pattern, replacement] of Object.entries(mapping)) {
        // use regex with word boundaries to avoid double replacing 'rounded-md' string "rounded" inside it
        if (pattern === 'rounded') {
            // only match exactly 'rounded ' or 'rounded"' or 'rounded`'
            const regex = new RegExp(`\\brounded\\b(?=[\\s"'\`])`, 'g');
            content = content.replace(regex, replacement);
        } else {
            const regex = new RegExp(pattern, 'g');
            content = content.replace(regex, replacement);
        }
    }
    
    if (content !== original) {
        fs.writeFileSync(f, content);
        console.log(`Updated ${f}`);
    }
}
