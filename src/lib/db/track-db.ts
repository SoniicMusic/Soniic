'use server';
import { db } from '../../db/drizzle-db';
import { tracks, track_artists, track_links, track_albums } from '../../db/schema';
import { eq } from 'drizzle-orm';
import slugify from 'slugify';
import { getAlbumByUPC } from './album-db';
import { LookupISRCResult } from '../magic-lookup';
import { getPlatformColor } from '../utils/platform-config';

/**
 * Adds or updates a track in the database
 */
export async function addTrack(trackData: LookupISRCResult, albumUPC: string) {
  console.log('Adding track', trackData.TrackName);
  
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
      throw new Error(`Album with UPC ${albumUPC} not found`);
    }
    
    // Now create the track
    const [newTrack] = await db.insert(tracks).values({
      isrc: trackData.ISRC as string,
      title: trackData.TrackName || 'Unknown Track',
      album_upc: albumUPC,
      slug: slugify(trackData.TrackName || 'Unknown Track', { lower: true }),
      track_number: 1, // Default track number, would be set properly in a real implementation
    }).returning();
    
    // Connect track to album
    await db.insert(track_albums).values({
      track_isrc: newTrack.isrc,
      album_upc: albumUPC,
    }).onConflictDoNothing();
    
    // Add track links
    if (trackData.TrackLinks) {
      for (const [platform, url] of Object.entries(trackData.TrackLinks)) {
        if (url) {
          await db.insert(track_links).values({
            track_isrc: newTrack.isrc,
            url: url,
            icon: platform.toLowerCase(),
            color: getPlatformColor(platform),
          }).onConflictDoNothing();
        }
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
    await db.insert(track_artists).values({
      track_isrc: trackISRC,
      artist_id: artistId
    }).onConflictDoNothing();
    
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