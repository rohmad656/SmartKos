import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('=== SmartKos Database Setup ===\n');

async function setup() {
  try {
    console.log('1. Testing connection...');
    
    const { data: testData, error: testErr } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testErr && testErr.message.includes('does not exist')) {
      console.log('   ✗ Tables not found. Run migration.sql first!');
      process.exit(1);
    }
    console.log('   ✓ Connection OK');

    console.log('\n2. Creating admin user...');
    
    const { data: existing } = await supabase
      .from('users')
      .select('email')
      .eq('email', 'admin@smartkos.com')
      .maybeSingle();

    if (existing) {
      console.log('   ⚠ Admin already exists, updating password...');
      const hash = await bcrypt.hash('admin123', 10);
      const { error: updateErr } = await supabase
        .from('users')
        .update({ password_hash: hash })
        .eq('email', 'admin@smartkos.com');
      
      if (updateErr) {
        console.log('   ✗ Update failed:', updateErr.message);
      } else {
        console.log('   ✓ Password updated to: admin123');
      }
    } else {
      const hash = await bcrypt.hash('admin123', 10);
      const { data, error } = await supabase
        .from('users')
        .insert([{
          nama: 'Admin Kos',
          email: 'admin@smartkos.com',
          password_hash: hash,
          role: 'admin',
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('   ✗ Failed:', error.message);
        console.error('   Make sure RLS is disabled!');
      } else {
        console.log('   ✓ Admin created:', data.email);
        console.log('   Email: admin@smartkos.com');
        console.log('   Password: admin123');
      }
    }

    console.log('\n3. Creating sample kamar data...');
    const { data: kamarCheck } = await supabase.from('kamar').select('id').limit(1);
    
    if (!kamarCheck || kamarCheck.length === 0) {
      const { error: kamarErr } = await supabase.from('kamar').insert([
        { nomor_kamar: '101', tipe: 'Standard', harga: 500000, status: 'kosong', deskripsi: 'Kamar standard dengan fasilitas lengkap' },
        { nomor_kamar: '102', tipe: 'Standard', harga: 500000, status: 'kosong', deskripsi: 'Kamar standard dengan fasilitas lengkap' },
        { nomor_kamar: '201', tipe: 'Deluxe', harga: 750000, status: 'kosong', deskripsi: 'Kamar deluxe dengan AC dan kamar mandi dalam' }
      ]);
      
      if (kamarErr) {
        console.log('   ⚠ Sample kamar:', kamarErr.message);
      } else {
        console.log('   ✓ 3 sample kamar created');
      }
    } else {
      console.log('   ⚠ Kamar data already exists, skipping');
    }

    console.log('\n✓ Setup completed successfully!');
    console.log('\nLogin credentials:');
    console.log('  Email: admin@smartkos.com');
    console.log('  Password: admin123');
    console.log('\nServer: http://localhost:5000');

  } catch (err) {
    console.error('\n✗ Setup failed:', err.message);
    console.error(err);
  }
  
  process.exit(0);
}

setup();
