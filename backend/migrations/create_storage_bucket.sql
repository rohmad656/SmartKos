-- Create bucket for kamar photos (public access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('kamar-fotos', 'kamar-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access kamar-fotos"
ON storage.objects FOR SELECT
USING (bucket_id = 'kamar-fotos');

-- Allow authenticated admin to upload
CREATE POLICY "Admin upload kamar-fotos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'kamar-fotos');

-- Allow authenticated admin to update
CREATE POLICY "Admin update kamar-fotos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'kamar-fotos');

-- Allow authenticated admin to delete
CREATE POLICY "Admin delete kamar-fotos"
ON storage.objects FOR DELETE
USING (bucket_id = 'kamar-fotos');
