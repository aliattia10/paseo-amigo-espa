-- Run in Supabase Dashboard -> SQL Editor if you see "Remote migration versions not found" when running: npm run supabase:db:push
-- This aligns remote schema_migrations.version with local migration filenames (without .sql). Run as many times as needed.

UPDATE supabase_migrations.schema_migrations SET version = '20241106_add_payout_system' WHERE version = '20241106';
UPDATE supabase_migrations.schema_migrations SET version = '20241110_add_payout_columns_to_users' WHERE version = '20241110';
UPDATE supabase_migrations.schema_migrations SET version = '20241110000001_create_message_media_bucket' WHERE version = '20241110000001';
UPDATE supabase_migrations.schema_migrations SET version = '20250108000000_enhanced_schema_and_security' WHERE version = '20250108000000' OR version = '20250108';
UPDATE supabase_migrations.schema_migrations SET version = '20250115_review_based_payout_workflow' WHERE version = '20250115';
UPDATE supabase_migrations.schema_migrations SET version = '20250116_enhance_review_system' WHERE version = '20250116';
