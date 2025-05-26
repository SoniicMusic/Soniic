'use server';
import { db } from '../../db/drizzle-db';
import { tracks, track_artists, track_links, track_albums } from '../../db/schema';
import { eq } from 'drizzle-orm';
import slugify from 'slugify';
import { addAlbum, getAlbumByUPC } from './album-db';
import { LookupISRCResult, lookupUPC } from '../magic-lookup';
import { getPlatformColor, getPlatformIcon } from '../utils/platform-config';

/**
 * Adds or updates a track in the database
 */
export async function addTrack(trackData: LookupISRCResult, albumUPC: string) {
  console.log('Adding track', trackData);
  
  try {
    // Check if track already exists
    const existingTrack = await db.query.tracks.findFirst({
      where: eq(tracks.isrc, trackData.ISRC as string)
    });
    
    if (existingTrack) {
      return existingTrack;
    }
    
    // Ensure album exists
    const album = await getAlbumByUPC(albumUPC);

    
    if (!album) {
      const albumdata = await lookupUPC(albumUPC, 'US')
      if (!albumdata) {
        throw new Error('Album not found');
      }
      else {
        await addAlbum(albumdata);
      }
    }
    
    // Now create the track
    await db.insert(tracks).values({
      isrc: trackData.ISRC as string,
      title: trackData.TrackName || 'Unknown Track',
      album_upc: albumUPC,
      slug: slugify(trackData.TrackName || 'Unknown Track', { lower: true, strict: true }),
    }).onConflictDoNothing();
    // Fetch the newly created track to get its ID
    const newTrack = await db.query.tracks.findFirst({
      where: eq(tracks.isrc, trackData.ISRC as string)
    });
    // Log the new track for debugging
    
    console.log('New track:', newTrack);
    
    if (!newTrack) {
      throw new Error('Failed to retrieve the newly created track');
    }
    console.log('New track created:', newTrack);
    // Connect track to album
    await db.insert(track_albums).values({
      track_isrc: newTrack.isrc,
      album_upc: albumUPC,
    }).onConflictDoNothing();
    
    // Add track links
    if (trackData.TrackLinks) {
      console.log('Adding track links');
      for (const [platform, url] of Object.entries(trackData.TrackLinks)) {
        console.log('Adding track link', platform, url);

        const color = getPlatformColor(platform);
        const icon = getPlatformIcon(platform);
        await db.insert(track_links).values({
          track_isrc: newTrack.isrc,
          name: platform,
          url,
          icon,
          color,
        })
      }
    }
    
    return newTrack;
  } catch (error) {
    console.error('Error adding track:', error);
    throw error;
  }
}

/**
 * Links an artist to a track
 */
export async function linkArtistToTrack(trackISRC: string, artistId: string) {
  try {
    // First check if this track-artist relationship already exists
    const existingRelations = await db.select().from(track_artists).where(
      eq(track_artists.track_isrc, trackISRC)
    ).execute();
    
    // Check if any existing relation has the same artist_id
    const existingRelation = existingRelations.find(rel => rel.artist_id === artistId);
    
    if (existingRelation) {
      // Relationship already exists, no need to create it again
      console.log(`Artist ${artistId} is already linked to track ${trackISRC}`);
      return true;
    }
    
    // Create the relationship since it doesn't exist yet
    await db.insert(track_artists).values({
      track_isrc: trackISRC,
      artist_id: artistId
    });
    
    return true;
  } catch (error) {
    console.error('Error linking artist to track:', error);
    return false;
  }
}

/**
 * Gets a track by its ISRC
 */
export async function getTrackByISRC(isrc: string) {
  const track = await db.query.tracks.findFirst({
    where: eq(tracks.isrc, isrc)
  });
  
  return track;
}

/**
 * Gets track links by track ISRC
 */
export async function getTrackLinksByISRC(isrc: string) {
  const links = await db.select().from(track_links).where(
    eq(track_links.track_isrc, isrc)
  ).execute();
  
  return links;
}

/**
 * Gets artists associated with a track
 */
export async function getTrackArtists(isrc: string) {
  const trackArtists = await db
    .select()
    .from(track_artists)
    .where(eq(track_artists.track_isrc, isrc))
    .execute();
  
  return trackArtists;
}