// Simple test script to verify the migration function works
import { migrateUnknownAlbums } from '../src/lib/db/migration-jobs';

async function testMigration() {
  try {
    console.log('Testing migration function...');
    const result = await migrateUnknownAlbums();
    console.log('Migration result:', result);
  } catch (error) {
    console.error('Migration test failed:', error);
  }
}

testMigration();
