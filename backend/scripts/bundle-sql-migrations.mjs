#!/usr/bin/env node
/**
 * Gộp backend/migrations/*.sql + INSERT bảng migrations để chạy một lần trong Supabase SQL Editor.
 * Regenerate: npm run bundle:supabase-sql
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../migrations');
const outDir = path.resolve(__dirname, '../supabase');
const outFile = path.join(outDir, 'all_migrations_bundled.sql');

const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => /^(\d+)[-_].+\.sql$/i.test(f))
    .sort((a, b) => {
        const na = Number.parseInt(a.match(/^(\d+)/)[1], 10);
        const nb = Number.parseInt(b.match(/^(\d+)/)[1], 10);
        if (na !== nb) return na - nb;
        return a.localeCompare(b);
    });

if (files.length === 0) {
    console.error('No migration SQL files found in', migrationsDir);
    process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

let body = `-- GYMERVIET — bundled migrations for Supabase SQL Editor
-- Generated: ${new Date().toISOString()}
-- Regenerate from repo: cd backend && npm run bundle:supabase-sql
--
-- Ensure core schema (e.g. users) exists before running on a fresh database.
--

CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    timestamp BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE
);

`;

const inserts = [];

for (const name of files) {
    const ts = Number.parseInt(name.match(/^(\d+)/)[1], 10);
    const sqlPath = path.join(migrationsDir, name);
    body += `\n-- ========== ${name} ==========\n\n`;
    body += fs.readFileSync(sqlPath, 'utf8').trimEnd();
    body += '\n';
    const escaped = name.replace(/'/g, "''");
    inserts.push(
        `INSERT INTO migrations (timestamp, name) VALUES (${ts}, '${escaped}') ON CONFLICT (name) DO NOTHING;`
    );
}

body += `
-- ========== migration registry (aligns with npm run migrate:run) ==========
`;

body += inserts.join('\n');
body += '\n';

fs.writeFileSync(outFile, body, 'utf8');
console.log('Wrote', path.relative(path.resolve(__dirname, '..'), outFile));
