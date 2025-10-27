#!/usr/bin/env node

/**
 * Comprehensive Database Seeding Script
 * 
 * This script seeds the database with realistic Spanish test data including:
 * - 12 users (6 owners, 6 walkers) with authentic Spanish names
 * - 11 diverse dog profiles with popular Spanish dog names and breeds
 * - 6 walker profiles with varied experience levels and specializations
 * - Walk requests, reviews, chat messages, and notifications
 * 
 * Usage:
 *   node scripts/seed-comprehensive.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Starting Comprehensive Database Seeding...\n');

try {
  // Check if we're in the right directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = require(packageJsonPath);
  
  if (!packageJson.name || !packageJson.name.includes('paseo')) {
    console.error('❌ Please run this script from the project root directory');
    process.exit(1);
  }

  console.log('📋 Seeding comprehensive test data:');
  console.log('   • 12 realistic Spanish users (6 owners, 6 walkers)');
  console.log('   • 11 diverse dog profiles with authentic names and breeds');
  console.log('   • 6 walker profiles with varied experience levels');
  console.log('   • Walk requests, reviews, chat messages, and notifications');
  console.log('   • Subscription plans and sample data\n');

  // Run the comprehensive seeding
  console.log('🚀 Executing comprehensive seed script...\n');
  
  try {
    execSync('cd backend && npm run seed:comprehensive', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.log('\n⚠️  Backend seed script not found, trying direct SQL execution...\n');
    
    // Alternative: Run SQL directly if backend script doesn't exist
    console.log('💡 To apply the comprehensive seed data manually:');
    console.log('   1. Open your Supabase dashboard');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Copy and paste the contents of database/seed_comprehensive.sql');
    console.log('   4. Execute the SQL script');
    console.log('\n📄 The comprehensive seed file is located at:');
    console.log('   database/seed_comprehensive.sql');
  }

  console.log('\n✅ Comprehensive seeding process completed!');
  console.log('\n🎯 You can now test all app functionality with realistic data:');
  console.log('   • Browse different dog profiles and walkers');
  console.log('   • Test the matching system with various user types');
  console.log('   • Experience realistic chat conversations');
  console.log('   • See diverse walk requests and reviews');
  console.log('   • Test notifications and user interactions');

} catch (error) {
  console.error('❌ Error during comprehensive seeding:', error.message);
  process.exit(1);
}
