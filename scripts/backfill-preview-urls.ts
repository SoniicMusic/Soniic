import { db } from '../src/db/drizzle-db';
import { tracks } from '../src/db/schema';
import { ensureTrackLinks } from '../src/lib/link-backfill';
import { isNull } from 'drizzle-orm';

async function backfillPreviewUrls() {
  console.log('Starting to backfill preview URLs for tracks...');
  
  try {
    // Get all tracks that don't have a preview_url
    const tracksWithoutPreview = await db.select().from(tracks).where(
      isNull(tracks.preview_url)
    ).execute();
    
    console.log(`Found ${tracksWithoutPreview.length} tracks without preview URLs`);
    
    for (const track of tracksWithoutPreview) {
      console.log(`Processing track: ${track.title} (ISRC: ${track.isrc})`);
      
      try {
        // This will check and update the preview URL if available
        await ensureTrackLinks(track.isrc);
        console.log(`Processed track: ${track.title}`);
        
        // Add a small delay to avoid overwhelming the APIs
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing track ${track.title}:`, error);
      }
    }
    
    console.log('Backfill process completed!');
  } catch (error) {
    console.error('Error in backfill process:', error);
  }
}

// Run the backfill
backfillPreviewUrls().then(() => {
  console.log('Script finished');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
