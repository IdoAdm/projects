-- Fix duplicate schedules
-- This will keep only the oldest schedule for each user and delete duplicates

-- First, let's see what duplicates exist
SELECT owner_id, COUNT(*) as schedule_count
FROM schedules
GROUP BY owner_id
HAVING COUNT(*) > 1;

-- Delete duplicate schedules, keeping only the oldest one for each user
DELETE FROM schedules
WHERE id NOT IN (
  SELECT DISTINCT ON (owner_id) id
  FROM schedules
  ORDER BY owner_id, created_at ASC
);

-- Verify no duplicates remain
SELECT owner_id, COUNT(*) as schedule_count
FROM schedules
GROUP BY owner_id
HAVING COUNT(*) > 1;
