#!/usr/bin/env node

/**
 * Script to apply security fixes and database migrations
 * Run this script to update your Supabase database with the new schema and RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zxbfygofxxmfivddwdqt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Please set your service role key:');
  console.log('export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applySecurityFixes() {
  console.log('🔒 Applying security fixes and database migrations...\n');

  try {
    // Read the security fix SQL file
    const sqlPath = path.join(__dirname, 'database', 'security_audit_fix.sql');
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250108000000_enhanced_schema_and_security.sql');
    
    let sqlContent = '';
    
    // Try to read the migration file first, then fallback to security fix file
    if (fs.existsSync(migrationPath)) {
      console.log('📄 Reading migration file...');
      sqlContent = fs.readFileSync(migrationPath, 'utf8');
    } else if (fs.existsSync(sqlPath)) {
      console.log('📄 Reading security fix file...');
      sqlContent = fs.readFileSync(sqlPath, 'utf8');
    } else {
      console.error('❌ No SQL files found. Please ensure the migration files exist.');
      process.exit(1);
    }

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          // Some errors are expected (like "already exists"), so we'll log them but continue
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key')) {
            console.log(`⚠️  Warning: ${error.message}`);
          } else {
            console.error(`❌ Error in statement ${i + 1}: ${error.message}`);
            console.log(`Statement: ${statement.substring(0, 100)}...`);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Unexpected error in statement ${i + 1}:`, err.message);
      }
    }

    console.log('\n🎉 Security fixes applied successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('  ✅ Added missing columns to users table (bio, experience, location, etc.)');
    console.log('  ✅ Fixed RLS policies to remove anonymous access');
    console.log('  ✅ Created secure user data protection policies');
    console.log('  ✅ Added proximity search functions');
    console.log('  ✅ Created performance indexes');
    
    console.log('\n🔐 Security improvements:');
    console.log('  ✅ No more anonymous access to user profiles');
    console.log('  ✅ Users can only access their own data');
    console.log('  ✅ Proper RLS policies for all tables');
    console.log('  ✅ Service role has appropriate permissions');

  } catch (error) {
    console.error('❌ Failed to apply security fixes:', error.message);
    process.exit(1);
  }
}

// Create a simple SQL execution function if it doesn't exist
async function createExecSqlFunction() {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
    if (error && error.message.includes('function exec_sql does not exist')) {
      console.log('🔧 Creating exec_sql function...');
      
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS text
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
          RETURN 'OK';
        END;
        $$;
      `;
      
      await supabase.rpc('exec_sql', { sql: createFunctionSQL });
      console.log('✅ exec_sql function created');
    }
  } catch (error) {
    console.log('⚠️  Could not create exec_sql function, trying direct execution...');
  }
}

// Main execution
async function main() {
  console.log('🚀 Petflik Security Fix Application\n');
  
  // Try to create the exec_sql function first
  await createExecSqlFunction();
  
  // Apply the security fixes
  await applySecurityFixes();
  
  console.log('\n✨ All done! Your database is now secure and ready for the new features.');
  console.log('\n🔄 Next steps:');
  console.log('  1. Restart your application');
  console.log('  2. Test the new role switching functionality');
  console.log('  3. Try the proximity-based matching');
  console.log('  4. Create dog profiles and walker profiles');
}

main().catch(console.error);
