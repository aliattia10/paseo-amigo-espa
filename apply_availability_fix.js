/**
 * Script to fix the availability table time type issue
 * This fixes the error: "operator does not exist: time without time zone <= timestamp with time zone"
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = 'https://zxbfygofxxmfivddwdqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YmZ5Z29meHhtZml2ZGR3ZHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjkyNTAsImV4cCI6MjA3MzY0NTI1MH0.6V11hebajJyNKKEeI0MqcoG8n2Hc0Rli8SoUpstm-C4';

// Read migration file
const migrationPath = path.join(__dirname, 'supabase/migrations/20251101000000_fix_availability_time_type.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyFix() {
    console.log('🔧 Applying availability table fix...\n');
    
    try {
        // Execute the migration
        const { data, error } = await supabase.rpc('exec_sql', { 
            sql: migrationSQL 
        });
        
        if (error) {
            // If exec_sql doesn't exist, try direct SQL execution
            console.log('Trying alternative method...');
            
            // Split SQL into individual statements
            const statements = migrationSQL
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));
            
            for (const statement of statements) {
                if (statement) {
                    console.log(`Executing: ${statement.substring(0, 50)}...`);
                    const { error: execError } = await supabase.rpc('exec', {
                        query: statement + ';'
                    });
                    
                    if (execError) {
                        console.error(`❌ Error executing statement:`, execError);
                    }
                }
            }
        }
        
        // Verify the fix by checking column types
        console.log('\n📊 Verifying column types...\n');
        
        const { data: columns, error: verifyError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'availability')
            .order('ordinal_position');
        
        if (verifyError) {
            console.error('❌ Could not verify fix:', verifyError);
        } else {
            console.log('✅ Current availability table structure:');
            console.table(columns);
            
            // Check if start_time and end_time are TIMESTAMPTZ
            const startTime = columns?.find(c => c.column_name === 'start_time');
            const endTime = columns?.find(c => c.column_name === 'end_time');
            
            if (startTime?.data_type === 'timestamp with time zone' && 
                endTime?.data_type === 'timestamp with time zone') {
                console.log('\n✅ SUCCESS! Columns are now TIMESTAMPTZ');
                console.log('✅ The booking error should be fixed!');
            } else {
                console.log('\n⚠️ Columns are not yet TIMESTAMPTZ');
                console.log('⚠️ You may need to run the migration manually');
            }
        }
        
    } catch (err) {
        console.error('❌ Error applying fix:', err);
        console.log('\n📖 Manual Fix Instructions:');
        console.log('1. Go to https://supabase.com/dashboard/project/zxbfygofxxmfivddwdqt/sql');
        console.log('2. Copy the contents of: supabase/migrations/20251101000000_fix_availability_time_type.sql');
        console.log('3. Paste and run in the SQL Editor');
        console.log('\nOr see: FIX_BOOKING_ERROR_GUIDE.md for detailed instructions');
    }
}

// Run the fix
applyFix().catch(console.error);

