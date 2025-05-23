'use server';
import { db } from '../../db/drizzle-db';
import { artists, artist_links, domains } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { lookupArtistProfileImage } from '../lookup/applemusic';
import slugify from 'slugify';
import { getPlatformColor, getPlatformOrder, getPlatformIcon } from '../utils/platform-config';

/**
 * Adds or updates an artist in the database and creates platform links
 */
export async function addArtistLink(artistName: string, platforms: Record<string, string>) {
  console.log(`Adding artist: ${artistName} with platforms:`, platforms);
  
  if (!artistName || artistName.startsWith('Unknown Artist')) {
    console.warn(`Skipping invalid artist name: ${artistName}`);
    return null;
  }
  
  // Check if artist already exists
  let artist = await db.query.artists.findFirst({
    where: eq(artists.name, artistName)
  });
  
  console.log(`Artist lookup result:`, artist);
  
  if (!artist && platforms.AppleMusic) {
    // If artist doesn't exist in database, create a new one with Apple Music details
    // Extract Apple Music artist ID from URL
    const appleMusicId = platforms.AppleMusic.split('/').pop() as string;
    console.log(`Creating new artist from Apple Music ID: ${appleMusicId}`);
    
    try {
      // Get artist profile image and name from Apple Music
      const artistProfileImage = await lookupArtistProfileImage(appleMusicId);
      console.log(`Got profile image: ${artistProfileImage ? 'Yes' : 'No'}`);
      // Use the same image as both avatar and background for now
      
      // Create artist record
      const [newArtist] = await db.insert(artists).values({
        name: artistName,
        avatar: artistProfileImage || '',
        background_image: artistProfileImage || '',
      }).returning();
      
      // Create a subdomain entry for the artist
      await db.insert(domains).values({
        artist_id: newArtist.id,
        subdomain: slugify(artistName, { lower: true, strict: true }),
      });
      
      artist = newArtist;
      
      // Add all platform links for this artist
      for (const [platform, url] of Object.entries(platforms)) {
        await db.insert(artist_links).values({
          artist_id: artist.id,
          name: platform,
          url: url,
          icon: getPlatformIcon(platform),
          color: getPlatformColor(platform),
          order: getPlatformOrder(platform),
        });
      }
    } catch (error) {
      console.error('Error adding artist:', error);
    }
  } else if (artist) {
    // Artist exists, check for new platforms to add
    try {
      // Get existing links for this artist
      const existingLinks = await db.query.artist_links.findMany({
        where: eq(artist_links.artist_id, artist.id)
      });
      
      // Create a set of existing platforms for quick lookup
      const existingPlatforms = new Set(existingLinks.map(link => link.name));
      
      // Check if we need to update the artist profile with Apple Music data
      if (platforms.AppleMusic && !artist.avatar && !artist.background_image) {
        const appleMusicId = platforms.AppleMusic.split('/').pop() as string;
        try {
          const artistProfileImage = await lookupArtistProfileImage(appleMusicId);
          // Update the artist record with images
          await db.update(artists)
            .set({
              avatar: artistProfileImage,
              background_image: artistProfileImage
            })
            .where(eq(artists.id, artist.id))
            .execute();
            
          // Update our local copy
          artist = {
            ...artist,
            avatar: artistProfileImage,
            background_image: artistProfileImage
          };
        } catch (error) {
          console.error('Error updating artist with Apple Music data:', error);
        }
      }
      
      // Add any new platform links
      for (const [platform, url] of Object.entries(platforms)) {
        if (!existingPlatforms.has(platform)) {
          console.log(`Adding new platform ${platform} for artist ${artistName}`);
          await db.insert(artist_links).values({
            artist_id: artist.id,
            name: platform,
            url: url,
            icon: getPlatformIcon(platform),
            color: getPlatformColor(platform),
            order: getPlatformOrder(platform),
          });
        }
      }
    } catch (error) {
      console.error('Error updating artist links:', error);
    }
  }
  
  return artist;
}

/**
 * Gets an artist by their subdomain
 */
export async function getArtistByDomain(subdomain: string) {
  // First, find the domain entry matching the subdomain
  const domainRecord = await db.select().from(domains).where(
    eq(domains.subdomain, subdomain)
  ).execute();
  
  if (!domainRecord || domainRecord.length === 0) {
    return null;
  }
  
  // Now get the artist using the artist_id from the domains table
  const artist = await db.select().from(artists).where(
    eq(artists.id, domainRecord[0].artist_id)
  ).execute();
  
  return artist[0];
}

/**
 * Gets an artist and their links by domain
 */
export async function getArtistLinksById(artistId: string) {
  const links = await db.select().from(artist_links).where(
    eq(artist_links.artist_id, artistId)
  ).orderBy(artist_links.order).execute();
  
  return links;
}