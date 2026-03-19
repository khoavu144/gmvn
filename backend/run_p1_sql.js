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
    console.log("Creating email_verification_tokens...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(), 
        "user_id" uuid NOT NULL, 
        "token" character varying(6) NOT NULL, 
        "expires_at" TIMESTAMP NOT NULL, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        CONSTRAINT "PK_email_verification" PRIMARY KEY ("id")
      )
    `);
    
    console.log("Creating password_reset_tokens...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(), 
        "user_id" uuid NOT NULL, 
        "token" character varying(6) NOT NULL, 
        "expires_at" TIMESTAMP NOT NULL, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        CONSTRAINT "PK_password_reset" PRIMARY KEY ("id")
      )
    `);

    console.log("Adding fields to users table...");
    await client.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_email_verified" boolean NOT NULL DEFAULT false`);
    await client.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean NOT NULL DEFAULT false`);
    
    console.log("✅ All P1 schema migrations applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
