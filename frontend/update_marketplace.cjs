const fs = require('fs');
let css = fs.readFileSync('src/styles/marketplace.css', 'utf8');

css = css.replace(/var\(--color-bg,\s*#0f1117\)/g, 'var(--mk-bg)');
css = css.replace(/#1a2240/g, 'var(--mk-bg-elevated)');
css = css.replace(/#0f1117/g, 'var(--mk-bg)');
css = css.replace(/#1a1040/g, 'var(--mk-paper)');

css = css.replace(/#7c3aed/gi, 'var(--mk-accent)');
css = css.replace(/rgba\(124\s*,\s*58\s*,\s*237\s*,\s*([0-9.]+)\)/g, (match, p1) => {
    return `color-mix(in oklab, var(--mk-accent) ${parseFloat(p1)*100}%, transparent)`;
});

css = css.replace(/#6d28d9/gi, 'var(--mk-accent-ink)');
css = css.replace(/#a78bfa/gi, 'var(--mk-accent)');

css = css.replace(/#e4e7ef/gi, 'var(--mk-text)');

css = css.replace(/color:\s*#fff;/g, 'color: var(--mk-text);');
css = css.replace(/color:\s*#fff\s/g, 'color: var(--mk-text) ');
css = css.replace(/background:\s*#fff;/g, 'background: var(--mk-paper);');
css = css.replace(/background:\s*#fff\s/g, 'background: var(--mk-paper) ');

// Since marketplace was a dark theme on dark bg, rgba(255,255,255, opacity) was used for white borders/bg on dark.
// Now that background is mk-bg / mk-paper (light), we need dark borders/bg.
// Thus we map rgba(255,255,255, X) to rgba(0,0,0, X) for visual parity natively.
css = css.replace(/rgba\(255\s*,\s*255\s*,\s*255\s*,\s*([0-9.]+)\)/g, (match, p1) => {
    return `rgba(0,0,0,${p1})`;
});

css = css.replace(/#fff\s+30%/g, 'var(--mk-text) 30%');

css = css.replace(/#fbbf24/gi, 'var(--color-warning, #D97706)');
css = css.replace(/#ef4444/gi, 'var(--color-error, #DC2626)');

fs.writeFileSync('src/styles/marketplace.css', css);
console.log('done');
