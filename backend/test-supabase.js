import { supabase } from './src/config/db.js';

console.log('Testing Supabase connection...\n');

async function testConnection() {
  try {
    const { data: tables, error } = await supabase
      .from('kamar')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error:', error.message);
      return;
    }
    
    console.log('✓ Connection OK');
    console.log('Kamar records:', tables?.length || 0);
    console.log('Sample:', tables);
    
    const { data: users, error: userErr } = await supabase
      .from('users')
      .select('id, nama, email, role')
      .limit(3);
    
    if (!userErr) {
      console.log('\nUsers:', users);
    }
    
  } catch (err) {
    console.error('Failed:', err.message);
  }
  
  process.exit(0);
}

testConnection();
