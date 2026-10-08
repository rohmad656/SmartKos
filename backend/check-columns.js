import { supabase } from './src/config/db.js';

async function patchSchema() {
  console.log('Checking columns...\n');
  
  // Test if we can update directly or need user action
  const { error: userErr } = await supabase.from('users').select('is_active').limit(1);
  if (userErr && userErr.message.includes('is_active')) {
    console.log('❌ users.is_active is missing');
  } else {
    console.log('✓ users.is_active present');
  }

  const { error: bookingErr } = await supabase.from('booking').select('batas_waktu, bukti_dp').limit(1);
  if (bookingErr && (bookingErr.message.includes('batas_waktu') || bookingErr.message.includes('bukti_dp'))) {
    console.log('❌ booking.batas_waktu / bukti_dp is missing');
  } else {
    console.log('✓ booking columns present');
  }
}

patchSchema().then(() => process.exit(0));
