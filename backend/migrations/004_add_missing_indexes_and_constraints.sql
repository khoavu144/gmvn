-- Indexes for Gym Branches
CREATE INDEX IF NOT EXISTS "IDX_gym_branches_gym_center_id" ON "gym_branches" ("gym_center_id");

-- Indexes and Constraints for Gym Reviews
CREATE INDEX IF NOT EXISTS "IDX_gym_reviews_branch_id" ON "gym_reviews" ("branch_id");
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_gym_reviews_branch_user" ON "gym_reviews" ("branch_id", "user_id");

-- Indexes for Subscriptions
CREATE INDEX IF NOT EXISTS "IDX_subscriptions_user_id" ON "subscriptions" ("user_id");
CREATE INDEX IF NOT EXISTS "IDX_subscriptions_trainer_id" ON "subscriptions" ("trainer_id");
