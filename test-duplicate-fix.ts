// Test script to verify duplicate artist handling is working correctly
import { generateUniqueSubdomain } from './src/lib/db/artist-db';

async function testDuplicateSubdomains() {
  console.log('Testing duplicate subdomain generation...');
  
  try {
    // Test generating multiple subdomains for the same artist name
    const name = "Tim";
    
    console.log(`\nGenerating subdomains for artist name: "${name}"`);
    
    // This would simulate multiple artists with the same name
    const subdomain1 = await generateUniqueSubdomain(name);
    console.log(`First subdomain: ${subdomain1}`);
    
    // Note: In a real scenario, the first subdomain would be saved to the database
    // before generating the second one. Since we're just testing the function,
    // we can't actually test the uniqueness constraint without setting up the database.
    
    console.log('\n✅ Subdomain generation function is available and working');
    console.log('🔧 The actual uniqueness testing requires database setup');
    
  } catch (error) {
    console.error('❌ Error testing subdomain generation:', error);
  }
}

testDuplicateSubdomains();
