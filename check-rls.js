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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLS() {
  console.log('Querying database tables and policies...');
  
  // We can execute raw SQL using the supabase.rpc() if there is a custom function,
  // or we can try to query pg_policies using supabase.from() if allowed.
  // Let's see if we can do it, otherwise we will test authenticated insertion.
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*');
    if (error) {
      console.log('Could not query pg_policies via from():', error.message);
    } else {
      console.log('Policies:', data);
    }
  } catch (e) {
    console.error(e);
  }

  // Let's check if there is an active user or if we can test with a mock session
  // To do a real test of RLS policy, we need to see what policies exist on the transactions table.
  // Let's check the schema of the transactions table by selecting a non-existent column or checking errors.
  const { data: cols, error: colsErr } = await supabase
    .from('transactions')
    .select('id,user_id,type,amount,description,category,date,receipt_image')
    .limit(1);

  if (colsErr) {
    console.log('Error selecting columns:', colsErr);
  } else {
    console.log('Successfully queried table schema, columns exist!');
  }
}

checkRLS();
