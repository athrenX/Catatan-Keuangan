const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envPath = '.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key length:', supabaseAnonKey.length);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  console.log('\n--- 1. Testing transactions select query ---');
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error selecting from transactions:', error);
  } else {
    console.log('Success! Sample data count:', data.length);
    console.log('Sample data:', data);
  }

  console.log('\n--- 2. Testing insert mock data ---');
  const testInsert = {
    user_id: '00000000-0000-0000-0000-000000000000', // Mock UUID or dummy value
    type: 'expense',
    amount: 15000,
    description: 'Test CLI Insert',
    category: 'Makanan',
    date: new Date().toISOString().slice(0, 10)
  };

  const { data: insertData, error: insertError } = await supabase
    .from('transactions')
    .insert(testInsert)
    .select();

  if (insertError) {
    console.error('Error inserting transaction:', insertError);
  } else {
    console.log('Insert success! Data:', insertData);
    
    // Clean up
    if (insertData && insertData[0]) {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', insertData[0].id);
      if (deleteError) {
        console.error('Error cleaning up test transaction:', deleteError);
      } else {
        console.log('Clean up success!');
      }
    }
  }
}

inspect();
