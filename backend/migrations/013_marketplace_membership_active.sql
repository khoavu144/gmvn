-- Bắt buộc trước khi deploy code dùng User.marketplace_membership_active (login, marketplace quota).
-- Khớp entity User + migration TypeORM AddMarketplaceMembershipToUsers1742700000000.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS marketplace_membership_active boolean NOT NULL DEFAULT false;
