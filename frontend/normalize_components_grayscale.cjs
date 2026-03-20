const fs = require('fs');
const glob = require('glob');

const grayscaleMappings = [
    // Backgrounds
    { pattern: /\bbg-gray-(?:50|100)\b/g, replacement: 'bg-[color:var(--mk-paper)]' },
    { pattern: /\bbg-gray-(?:200|300)\b/g, replacement: 'bg-[color:var(--mk-paper-strong)]' },
    { pattern: /\bhover:bg-gray-(?:50|100)\b/g, replacement: 'hover:bg-[color:var(--mk-paper)]' },
    { pattern: /\bhover:bg-gray-(?:200|300)\b/g, replacement: 'hover:bg-[color:var(--mk-paper-strong)]' },
    
    // Texts
    { pattern: /\btext-gray-(?:400|500)\b/g, replacement: 'text-[color:var(--mk-muted)]' },
    { pattern: /\btext-gray-(?:600|700)\b/g, replacement: 'text-[color:var(--mk-text-soft)]' },
    { pattern: /\btext-gray-(?:800|900)\b/g, replacement: 'text-[color:var(--mk-text)]' },
    { pattern: /\bhover:text-gray-(?:400|500)\b/g, replacement: 'hover:text-[color:var(--mk-muted)]' },
    { pattern: /\bhover:text-gray-(?:600|700)\b/g, replacement: 'hover:text-[color:var(--mk-text-soft)]' },
    { pattern: /\bhover:text-gray-(?:800|900)\b/g, replacement: 'hover:text-[color:var(--mk-text)]' },

    // Borders
    { pattern: /\bborder-gray-(?:100|200|300|400)\b/g, replacement: 'border-[color:var(--mk-line)]' },
    { pattern: /\bhover:border-gray-(?:300|400)\b/g, replacement: 'hover:border-[color:var(--mk-line)]' },
];

const files = glob.sync('src/components/**/*.tsx');

let filesUpdated = 0;
for (const f of files) {
    if (!fs.existsSync(f)) continue;
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    for (const { pattern, replacement } of grayscaleMappings) {
        content = content.replace(pattern, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(f, content);
        filesUpdated++;
        console.log(`Updated grayscale in ${f}`);
    }
}
console.log(`Total component files updated: ${filesUpdated}`);
