import pool from '../src/config/db.js';
import { supabase } from '../src/config/supabase.js';

async function setup() {
  try {
    console.log('Connecting to DB to configure storage...');
    await pool.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('kamar-fotos', 'kamar-fotos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log('Bucket "kamar-fotos" registered in storage.buckets');

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow All on kamar-fotos'
        ) THEN
          CREATE POLICY "Allow All on kamar-fotos" ON storage.objects
          FOR ALL
          TO public
          USING (bucket_id = 'kamar-fotos')
          WITH CHECK (bucket_id = 'kamar-fotos');
        END IF;
      END $$;
    `);
    console.log('Storage RLS policy applied');

    const { data: buckets, error } = await supabase.storage.listBuckets();
    console.log('Buckets visible via Supabase API:', buckets, 'Error:', error);
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setup();
