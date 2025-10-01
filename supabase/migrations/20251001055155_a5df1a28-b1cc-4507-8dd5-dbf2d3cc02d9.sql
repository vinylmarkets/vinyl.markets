-- Delete all forensic documents for user 008337a6-677b-48f3-a16f-8409920a2513
-- Note: Storage files will remain but won't be accessible through the UI
DELETE FROM forensic_documents 
WHERE user_id = '008337a6-677b-48f3-a16f-8409920a2513';