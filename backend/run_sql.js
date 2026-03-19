require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  await client.connect();
  console.log("Connected to database successfully.");
  
  try {
    console.log("1. Adding is_active column to users (P0-1)...");
    await client.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`);
    
    console.log("2. Changing default user_type to 'user' (P0-7)...");
    await client.query(`ALTER TABLE "users" ALTER COLUMN "user_type" SET DEFAULT 'user'`);
    
    console.log("3. Increasing trainer_profiles.slug length to 100 (P0-6)...");
    await client.query(`ALTER TABLE "trainer_profiles" ALTER COLUMN "slug" TYPE character varying(100)`);
    
    // Also record it in migrations table so typeorm knows
    console.log("4. Inserting into migrations table...");
    await client.query(`CREATE TABLE IF NOT EXISTS "migrations" ("id" SERIAL NOT NULL, "timestamp" bigint NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id"))`);
    
    const check = await client.query(`SELECT * FROM migrations WHERE name = 'SecurityHardening1710920000000'`);
    if (check.rows.length === 0) {
        await client.query(`INSERT INTO migrations (timestamp, name) VALUES (1710920000000, 'SecurityHardening1710920000000')`);
    }

    console.log("✅ All security schema migrations applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
