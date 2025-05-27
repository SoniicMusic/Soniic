import { db } from './src/db/drizzle-db';
import { addArtistLink } from './src/lib/db/artist-db';
import { artists, domains } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function testDuplicateArtists() {
  console.log('Testing duplicate artist handling...\n');
  
  try {
    // Test 1: Two different artists with the same name "Tim"
    console.log('1. Adding first artist named "Tim"...');
    const tim1 = await addArtistLink('Tim', {
      AppleMusic: 'https://music.apple.com/artist/tim-one/123456789'
    });
    console.log('First Tim artist created with ID:', tim1?.id);
    
    // Check what subdomain was created
    const domain1 = await db.select().from(domains).where(
      eq(domains.artist_id, tim1.id)
    ).execute();
    console.log('First Tim subdomain:', domain1[0]?.subdomain);
    
    console.log('\n2. Adding second artist named "Tim"...');
    const tim2 = await addArtistLink('Tim', {
      AppleMusic: 'https://music.apple.com/artist/tim-two/987654321'
    });
    console.log('Second Tim artist result:', tim2?.id);
    
    // Check if a new artist was created or if it's the same
    if (tim1.id === tim2.id) {
      console.log('❌ ISSUE: Both "Tim" artists have the same ID - they were merged!');
      console.log('This means they will share the same subdomain.');
    } else {
      console.log('✅ GOOD: Two different artist records were created');
      
      // Check what subdomain was created for the second Tim
      const domain2 = await db.select().from(domains).where(
        eq(domains.artist_id, tim2.id)
      ).execute();
      console.log('Second Tim subdomain:', domain2[0]?.subdomain);
      
      if (domain1[0]?.subdomain === domain2[0]?.subdomain) {
        console.log('❌ ISSUE: Both artists have the same subdomain!');
        console.log('This will cause conflicts in routing.');
      } else {
        console.log('✅ GOOD: Different subdomains created');
      }
    }
    
    console.log('\n3. Checking all Tim artists in database...');
    const allTims = await db.select().from(artists).where(
      eq(artists.name, 'Tim')
    ).execute();
    console.log('Total Tim artists in database:', allTims.length);
    console.log('Tim artists:', allTims.map(a => ({ id: a.id, name: a.name })));
    
    console.log('\n4. Checking all domains for Tim artists...');
    const allDomains = await db.select().from(domains).execute();
    const timDomains = allDomains.filter(d => 
      allTims.some(artist => artist.id === d.artist_id)
    );
    console.log('Tim domains:', timDomains);
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testDuplicateArtists();
