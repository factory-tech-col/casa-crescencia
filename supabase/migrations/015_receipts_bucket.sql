-- ============================================================================
-- 015: Public receipts bucket for payment comprobantes
-- ============================================================================
-- Creates a PUBLIC 'receipts' bucket with permissive INSERT/SELECT policies.
-- The frontend uploads receipt images here; the confirm-receipt edge function
-- stores the path in payments.receipt_path and payments.metadata.
-- If this bucket is missing, the frontend falls back to Base64 inline storage
-- in payments.metadata.receipt_data so the checkout never blocks on storage.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow any authenticated user to upload receipts
DROP POLICY IF EXISTS "Allow receipt uploads" ON storage.objects;
CREATE POLICY "Allow receipt uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
  AND auth.uid() IS NOT NULL
);

-- Allow anyone to read receipts (public bucket)
DROP POLICY IF EXISTS "Allow receipt reads" ON storage.objects;
CREATE POLICY "Allow receipt reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');
