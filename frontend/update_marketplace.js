const fs = require('fs');
let css = fs.readFileSync('src/styles/marketplace.css', 'utf8');

// Colors replacement mapping
// Backgrounds
css = css.replace(/var\(--color-bg,\s*#0f1117\)/g, 'var(--mk-bg)');
css = css.replace(/#1a2240/g, 'var(--mk-bg-elevated)');
css = css.replace(/#0f1117/g, 'var(--mk-bg)');
css = css.replace(/#1a1040/g, 'var(--mk-paper)');

// Primary colors
css = css.replace(/#7c3aed/gi, 'var(--mk-accent)');
css = css.replace(/rgba\(124,\s*58,\s*237,/g, 'color-mix(in oklab, var(--mk-accent) 100%, transparent'); // fallback
// A better way for rgba of primary: 
// rgba(124,58,237,.2) -> color-mix(in oklab, var(--mk-accent) 20%, transparent)

css = css.replace(/rgba\(124\s*,\s*58\s*,\s*237\s*,\s*([0-9.]+)\)/g, (match, p1) => {
    return `color-mix(in oklab, var(--mk-accent) ${parseFloat(p1)*100}%, transparent)`;
});

css = css.replace(/#6d28d9/gi, 'var(--mk-accent-ink)');
css = css.replace(/#a78bfa/gi, 'var(--mk-accent)');

// Text
css = css.replace(/#e4e7ef/gi, 'var(--mk-text)');
css = css.replace(/#fff/gi, 'var(--mk-text)'); // Wait, #fff might be text or bg. In this dark theme, #fff is text.
// Let's replace #fff manually or carefully.
css = css.replace(/color:\s*#fff/g, 'color: var(--mk-text)');
css = css.replace(/background:\s*#fff/g, 'background: var(--mk-paper)');

// White alphas -> black alphas (for borders, backgrounds)
css = css.replace(/rgba\(255\s*,\s*255\s*,\s*255\s*,\s*([0-9.]+)\)/g, (match, p1) => {
    // If it's a very light opacity < 0.2, use it as black opacity
    // But maybe it's better to map it to --mk-line or --mk-muted
    let opacity = parseFloat(p1);
    if (opacity < 0.15) return `var(--mk-line)`;
    if (opacity < 0.4) return `var(--mk-muted)`;
    if (opacity < 0.7) return `var(--mk-text-soft)`;
    return `var(--mk-text)`;
});

// Fix linear-gradient backgrounds that use #fff
css = css.replace(/#fff\s+30%/g, 'var(--mk-text) 30%');

// Status colors
css = css.replace(/#fbbf24/gi, 'var(--color-warning, #D97706)');
css = css.replace(/#ef4444/gi, 'var(--color-error, #DC2626)');

// Save backwards
fs.writeFileSync('src/styles/marketplace.css', css);
console.log('done');
