'use server';
import { db } from '@/db/drizzle-db'; // Assuming this is your database instance
import { track_artists, tracks, album_links, artist_links, artists, track_links } from '@/db/schema'; // Import your tables
import { eq } from 'drizzle-orm';
import { dynamicRedirect } from './redirect';

export async function lookupExistingISRC(identifier) {
  // Check in tracks 
  const spotifyURL = 'https://open.spotify.com/track/' + identifier;
  const track_isrc = await db.select({
    track_isrc: track_links.track_isrc,

  }
  ).from(track_links).where(eq(track_links.url, spotifyURL)).limit(1);
  if (track_isrc.length > 0) {
 
  const track = await db.select().from(tracks).where(eq(tracks.isrc, track_isrc[0].track_isrc)).limit(1);
  
  console.log(track);
  if (track.length > 0) {
    // Found it lookup artist using the track_artist table
    const artist = await db.select({
      artist_id: track_artists.artist_id,
    }
    ).from(track_artists).where(eq(track_artists.track_isrc, track[0].isrc)).limit(1);
    console.log(artist);
    if (artist.length === 0) {
      return null;
    }

    // Found the artist now lookup the domain
    const domain = await db.select({
      artist_domain: artists.domain,
    }
    ).from(artists).where(eq(artists.id, artist[0].artist_id)).limit(1);

    return domain[0].artist_domain + '/' + track[0].slug;
  }
  return null;
}
}

export async function testLookup() {
  const isrc = await lookupExistingISRC('1');
  dynamicRedirect(isrc);
}