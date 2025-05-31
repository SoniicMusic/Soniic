import { db } from '../src/db/drizzle-db';
import { tracks } from '../src/db/schema';

async function checkTracksWithPreviews() {
  console.log('Checking for tracks with preview URLs...');
  
  try {
    const allTracks = await db.select().from(tracks).execute();
    console.log(`Found ${allTracks.length} total tracks`);
    
    const tracksWithPreviews = allTracks.filter(track => track.preview_url);
    console.log(`Found ${tracksWithPreviews.length} tracks with preview URLs`);
    
    if (tracksWithPreviews.length > 0) {
      console.log('\nTracks with previews:');
      tracksWithPreviews.forEach(track => {
        console.log(`- ${track.title} (${track.slug}): ${track.preview_url}`);
      });
    }
    
    // Show first few tracks regardless
    console.log('\nFirst 5 tracks:');
    allTracks.slice(0, 5).forEach(track => {
      console.log(`- ${track.title} (${track.slug}): ${track.preview_url || 'No preview'}`);
    });
    
  } catch (error) {
    console.error('Error checking tracks:', error);
  }
}

checkTracksWithPreviews();
