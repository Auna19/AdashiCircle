-- ============================================================
-- Seed Data: Super Admin User
-- Run AFTER creating a user in Supabase Auth with the super admin email
-- Then run this to elevate their role
-- ============================================================

-- Update the super admin role (replace with actual auth user UUID)
-- This is typically done via Edge Function or admin script on first deploy
-- DO NOT hardcode UUIDs in production migrations

-- Example (replace UUID with actual value):
-- UPDATE public.users SET role = 'super_admin' WHERE email = 'admin@adashicircle.com';

-- ============================================================
-- Sample group categories reference data
-- ============================================================
-- These are used as suggestions in the UI; not stored in DB as a table

-- Family Savings
-- Friends & Social
-- Market Traders
-- Workplace Cooperative
-- Community Association
-- Religious Organization
-- Professional Association
-- Investment Group
-- Emergency Fund
-- Other

