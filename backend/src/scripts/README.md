# Production Scripts - Seed Data, Migrations & Slug Generation

## Scripts Overview

### 1. generateSlugs.ts

Generates SEO-friendly slugs for all trainers in the database.

**What it does:**

- Fetches all trainers from the database
- Generates unique slugs from their full names (e.g., "Nguyễn Diệu Nhi" → "nguyen-dieu-nhi")
- Skips trainers that already have slugs
- Ensures slug uniqueness by appending numbers if needed

### 2. seedTestimonialsAndPhotos.ts

Populates sample testimonials and before/after photos for all trainers.

**What it does:**

- Fetches all trainers from the database
- Creates 3-4 testimonials per trainer with sample client reviews
- Creates 2-3 before/after photo entries per trainer with placeholder images
- Uses realistic Vietnamese names and success stories

## Migration Workflow Before App Boot

The backend now assumes SQL migrations are executed before the app starts.

### Required deploy order

```bash
# Validate that environment variables are present
npm run migrate:check

# If pending migrations exist, apply them before boot
npm run migrate:run

# Start the API only after migrations are up to date
npm run build && npm run start
```

### Notes

- [`src/server.ts`](backend/src/server.ts) fails fast when pending SQL files still exist in [`backend/migrations`](backend/migrations).
- Migration readiness is checked against the `migrations` table, not by schema diffing.
- [`src/scripts/checkMigrationState.ts`](backend/src/scripts/checkMigrationState.ts) exits with code `1` when pending migrations are found.
- [`src/scripts/runMigrations.ts`](backend/src/scripts/runMigrations.ts) applies pending `.sql` files in order and records them in the `migrations` table.

## Running on Production

### Prerequisites

- SSH access to production server
- Production database credentials in `.env` file
- Node.js and TypeScript installed

### Commands

```bash
# SSH into production server
ssh user@your-production-server

# Navigate to backend directory
cd /path/to/gymerviet-new/backend

# Pull latest changes
git pull origin main

# Install dependencies (if needed)
npm install

# Run slug generation script
npx ts-node src/scripts/generateSlugs.ts

# Run testimonials and photos seed script
npx ts-node src/scripts/seedTestimonialsAndPhotos.ts
```

### Expected Output

**generateSlugs.ts:**

```
Database connected
Found 5 trainers
Existing slugs: 0
  ✅ Nguyễn Diệu Nhi -> nguyen-dieu-nhi
  ✅ Trần Văn A -> tran-van-a
  ...
✅ Slug generation completed:
   - 5 trainers updated
   - 0 trainers skipped (already had slugs)
```

**seedTestimonialsAndPhotos.ts:**

```
Database connected
Found 5 trainers

Processing trainer: Nguyễn Diệu Nhi
  Added 4 testimonials and 3 photos
...
✅ Seed completed:
   - 20 testimonials created
   - 15 before/after photos created
```

## Verification

After running the scripts, verify the data:

1. **Check slugs:**

   ```sql
   SELECT id, full_name, slug FROM users WHERE user_type = 'trainer';
   ```

2. **Check testimonials:**

   ```sql
   SELECT COUNT(*) FROM testimonials;
   SELECT trainer_id, COUNT(*) FROM testimonials GROUP BY trainer_id;
   ```

3. **Check before/after photos:**

   ```sql
   SELECT COUNT(*) FROM before_after_photos;
   SELECT trainer_id, COUNT(*) FROM before_after_photos GROUP BY trainer_id;
   ```

4. **Test frontend:**
   - Visit: <https://www.gymerviet.com/coaches/[trainer-id>]
   - Verify the 3 new sections appear:
     - Before/After Gallery
     - Testimonials
     - Similar Profiles

## Notes

- Scripts are idempotent for slugs (won't duplicate if run multiple times)
- Testimonials and photos will be duplicated if run multiple times
- Placeholder images use via.placeholder.com (replace with real images later)
- All data is marked as `is_approved: true` by default
