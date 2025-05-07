'use server';
import { db } from '../../db/drizzle-db';
import { albums, album_links } from '../../db/schema';
import { eq } from 'drizzle-orm';
import slugify from 'slugify';
import { LookupUPCResult } from '../magic-lookup';
import { getPlatformColor } from '../utils/platform-config';
import { getSpotifyUPC } from '../lookup/spotify.js';

/**
 * Retrieves an album by its UPC
 */
export async function getAlbumByUPC(upc: string) {
  const album = await db.query.albums.findFirst({
    where: eq(albums.upc, upc)
  });
  
  return album;
}

/**
 * Adds or updates an album in the database
 */
export async function addAlbum(albumData: LookupUPCResult) {
  console.log('Adding album', albumData.AlbumName);
  
  try {
    // Check if album already exists
    const existingAlbum = await getAlbumByUPC(albumData.UPC as string);
    
    if (existingAlbum) {
      return existingAlbum;
    }
    
    // Now create the album
    const [newAlbum] = await db.insert(albums).values({
      upc: albumData.UPC as string,
      title: albumData.AlbumName || 'Unknown Album',
      release_date: albumData.ReleaseDate || new Date().toISOString().split('T')[0],
      genre: albumData.genreNames && albumData.genreNames.length > 0 ? albumData.genreNames[0] : 'Unknown',
      slug: slugify(albumData.AlbumName || 'Unknown Album', { lower: true }),
      cover_art: albumData.BackgroundImage?.replace('{w}x{h}', '600x600') || '',
    }).returning();
    
    // Add album links
    if (albumData.Links) {
      for (const [platform, url] of Object.entries(albumData.Links)) {
        if (url) {
          await db.insert(album_links).values({
            album_upc: newAlbum.upc,
            name: platform,
            url: url,
            icon: platform.toLowerCase(),
            color: getPlatformColor(platform),
          }).onConflictDoNothing();
        }
      }
    }
    
    return newAlbum;
  } catch (error) {
    console.error('Error adding album:', error);
    throw error;
  }
}

/**
 * Gets album links by album UPC
 */
export async function getAlbumLinksByUPC(upc: string) {
  const links = await db.select().from(album_links).where(
    eq(album_links.album_upc, upc)
  ).execute();
  
  return links;
}

/**
 * Looks up UPC by Spotify album ID
 */
export async function lookupAlbumUPC(spotifyId: string): Promise<string> {
  try {
    // First try to get UPC from Spotify
    const upc = await getSpotifyUPC(spotifyId);
    if (upc) {
      return upc;
    }
    
    // If we couldn't get a UPC, create a placeholder one
    return `spotify-${spotifyId}`;
  } catch (error) {
    console.error('Error getting album UPC:', error);
    return `spotify-${spotifyId}`;
  }
}