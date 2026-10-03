import { supabase } from '../src/config/supabase.js';

async function testUpload() {
  try {
    const testBuffer = Buffer.from('fake-image-data');
    const fileName = `test-${Date.now()}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('kamar-fotos')
      .upload(fileName, testBuffer, { contentType: 'image/jpeg' });

    console.log('Upload result:', data, 'Error:', error);
    
    if (!error) {
      const { data: publicData } = supabase.storage
        .from('kamar-fotos')
        .getPublicUrl(fileName);
      console.log('Public URL:', publicData.publicUrl);
    }
    process.exit(0);
  } catch (err) {
    console.error('Upload test failed:', err);
    process.exit(1);
  }
}

testUpload();