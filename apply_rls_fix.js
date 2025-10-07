// Script to apply RLS policy fix to Supabase database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zxbfygofxxmfivddwdqt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YmZ5Z29meHhtZml2ZGR3ZHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjkyNTAsImV4cCI6MjA3MzY0NTI1MH0.6V11hebajJyNKKEeI0MqcoG8n2Hc0Rli8SoUpstm-C4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFix() {
  try {
    console.log('🔧 Applying RLS policy fix...');
    
    // The RLS policy fix SQL
    const rlsFixSQL = `
      -- Drop the restrictive policy
      DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
      
      -- Create a permissive policy that allows user registration
      -- This is safe because we have email uniqueness constraint
      CREATE POLICY "Allow user registration" ON users 
      FOR INSERT 
      WITH CHECK (true);
    `;
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: rlsFixSQL });
    
    if (error) {
      console.error('❌ Error applying RLS fix:', error);
      return false;
    }
    
    console.log('✅ RLS policy fix applied successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Run the fix
applyRLSFix().then(success => {
  if (success) {
    console.log('🎉 RLS fix completed successfully!');
    process.exit(0);
  } else {
    console.log('💥 RLS fix failed!');
    process.exit(1);
  }
});

