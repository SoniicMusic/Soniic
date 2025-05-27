// Test script to verify duplicate Apple Music link prevention
import { addArtistLink } from '../src/lib/db/artist-db';

async function testDuplicatePrevention() {
  console.log('Testing duplicate Apple Music link prevention...');
  
  const testArtist = 'Test Artist for Duplicates';
  const platforms = {
    'AppleMusic': 'https://music.apple.com/us/artist/test-artist/123456789'
  };
  
  try {
    // First addition - should create the artist and link
    console.log('1. Adding artist and Apple Music link for the first time...');
    const result1 = await addArtistLink(testArtist, platforms);
    console.log('Result 1:', result1?.name);
    
    // Second addition - should NOT create duplicate link
    console.log('2. Adding the same artist and Apple Music link again...');
    const result2 = await addArtistLink(testArtist, platforms);
    console.log('Result 2:', result2?.name);
    
    console.log('Test completed! Check the database to verify no duplicates were created.');
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testDuplicatePrevention();
