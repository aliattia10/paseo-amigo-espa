-- Quick fix: Add deleted_at column to notifications table

DO $$ 
BEGIN
  -- Add deleted_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN deleted_at TIMESTAMPTZ;
    RAISE NOTICE 'Added deleted_at column to notifications table';
  ELSE
    RAISE NOTICE 'deleted_at column already exists';
  END IF;
END $$;
