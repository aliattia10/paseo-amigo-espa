import { supabase } from '@/config/database';
import dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  try {
    console.log('🔄 Starting database reset...');

    // Tables to clear (in order to respect foreign key constraints)
    const tables = [
      'geo_points',
      'walk_sessions',
      'notifications',
      'reviews',
      'chat_messages',
      'walk_requests',
      'user_subscriptions',
      'payment_methods',
      'walker_profiles',
      'dogs',
      'users',
      'subscription_plans'
    ];

    for (const table of tables) {
      console.log(`🗑️  Clearing table: ${table}`);
      
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) {
        console.log(`⚠️  Warning clearing ${table}:`, error.message);
        // Continue even if one table fails
      } else {
        console.log(`✅ Cleared table: ${table}`);
      }
    }

    console.log('🎉 Database reset completed!');
    console.log('💡 Run "npm run db:seed" to populate with sample data');

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  }
}

// Run reset if this file is executed directly
if (require.main === module) {
  resetDatabase();
}

export { resetDatabase };
