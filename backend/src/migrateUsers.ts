import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: true,
    entities: [],
});

async function migrate() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        await AppDataSource.query(`ALTER TYPE users_user_type_enum ADD VALUE IF NOT EXISTS 'user';`);
        console.log("Added 'user' to enum");

        // Wait to allow enum change to propagate potentially if in a transaction, though this shouldn't be needed usually
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = await AppDataSource.query(`UPDATE users SET user_type = 'user' WHERE user_type = 'athlete' RETURNING *;`);
        console.log("Updated users:", result[1] || result[0]?.length);

        // Let's set default
        await AppDataSource.query(`ALTER TABLE users ALTER COLUMN user_type SET DEFAULT 'user';`);
        console.log("Set default to user");

        process.exit(0);
    } catch (err) {
        console.error("Error during Data Source initialization", err);
        process.exit(1);
    }
}

migrate();
