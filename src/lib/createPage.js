    import { db } from '@/db/drizzle-db'; // Assuming this is your database instance
    import {  } from '@/db/schema'; // Import your tables
import { lookupUPC } from './magic-lookup';
    
export async function lookupExistingISRC(identifier) {
  // Check in tracks table by ISRC
  const trackData = await db
    .select({
      slug: tracks.slug,
      domain: track_links.url, // Assuming track_links.url stores the domain
    })
    .from(tracks)
    .innerJoin(track_links, track_links.track_isrc.eq(tracks.isrc)) // Join to get the domain
    .where(tracks.isrc.eq(identifier))
    .limit(1);

  if (trackData.length > 0) {
    return trackData[0];
  }
 return null;
}

export async function lookupExistingUPC(identifier) {
      // Check in albums table by UPC
  const albumData = await db
  .select({
    slug: albums.slug,
    domain: album_links.url, // Assuming album_links.url stores the domain
  })
  .from(albums)
  .innerJoin(album_links, album_links.album_upc.eq(albums.upc)) // Join to get the domain
  .where(albums.upc.eq(identifier))
  .limit(1);

if (albumData.length > 0) {
  return albumData[0];
}

return null; // No match found
}


async function searchResultSelected(type, identifier) {
  if (type === 'track') {
    return lookupExistingISRC(identifier);
  } else if (type === 'album') {
    Existing_UPC = await lookupExistingUPC(identifier);
    if (Existing_UPC) {
      return Existing_UPC;
    } 
  }
  return null;
}
async function createAlbumPage(UPC) {
  const album = lookupUPC(UPC);
    // Create a new album page
    
}