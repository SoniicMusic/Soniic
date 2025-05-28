'use server';
import { db } from '../../db/drizzle-db';
import { artists, artist_links, domains } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { lookupArtistProfileImage } from '../lookup/applemusic';
import { lookupSpotifyArtistProfileImage } from '../lookup/spotify';
import slugify from 'slugify';
import { getPlatformColor, getPlatformOrder, getPlatformIcon, getPlatformDisplayName } from '../utils/platform-config';

/**
 * Generates a unique subdomain by checking existing ones and appending numbers if needed
 */
export async function generateUniqueSubdomain(baseName: string): Promise<string> {
  let baseSlug = slugify(baseName, { lower: true, strict: true });
  let subdomain = baseSlug;
  let counter = 1;
  
  // Keep checking until we find a unique subdomain
  while (true) {
    const existingDomain = await db.select().from(domains).where(
      eq(domains.subdomain, subdomain)
    ).execute();
    
    if (existingDomain.length === 0) {
      return subdomain;
    }
    
    // If subdomain exists, try with a number suffix
    subdomain = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Checks if an artist exists based on platform identifiers rather than just name
 */
async function findExistingArtistByPlatforms(artistName: string, platforms: Record<string, string>) {
  // First try to find by exact name match
  let artist = await db.query.artists.findFirst({
    where: eq(artists.name, artistName)
  });
  
  if (!artist) {
    return null;
  }
  
  // If we found an artist with the same name, check if they have different platform IDs
  // This helps distinguish between artists with the same name
  const existingLinks = await db.query.artist_links.findMany({
    where: eq(artist_links.artist_id, artist.id)
  });
  
  // Check if any of the platform URLs match
  for (const [platform, newUrl] of Object.entries(platforms)) {
    const platformDisplayName = getPlatformDisplayName(platform);
    const existingLink = existingLinks.find(link => link.name === platformDisplayName);
    
    if (existingLink && existingLink.url === newUrl) {
      // Found matching platform URL - this is the same artist
      return artist;
    }
  }
  
  // If we found an artist with same name but different platform IDs, 
  // they are different artists, so return null to create a new one
  if (existingLinks.length > 0) {
    console.log(`Found artist with same name "${artistName}" but different platform IDs - treating as different artist`);
    return null;
  }
  
  // If the existing artist has no platform links yet, we can use them
  return artist;
}

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
  let artist = await findExistingArtistByPlatforms(artistName, platforms);
  
  console.log(`Artist lookup result:`, artist);
  
  if (!artist && platforms.AppleMusic) {
    // If artist doesn't exist in database, create a new one with Apple Music details
    // Extract Apple Music artist ID from URL
    const appleMusicId = platforms.AppleMusic.split('/').pop() as string;
    console.log(`Creating new artist from Apple Music ID: ${appleMusicId}`);
    
    try {
      // Get artist profile image from Apple Music first, then try Spotify as fallback
      let artistProfileImage = await lookupArtistProfileImage(appleMusicId);
      console.log(`Got Apple Music profile image: ${artistProfileImage ? 'Yes' : 'No'}`);
      
      // If no Apple Music image and we have Spotify, try Spotify as fallback
      if (!artistProfileImage && platforms.Spotify) {
        const spotifyId = platforms.Spotify.split('/').pop() as string;
        console.log(`Trying Spotify fallback for artist ID: ${spotifyId}`);
        artistProfileImage = await lookupSpotifyArtistProfileImage(spotifyId);
        console.log(`Got Spotify profile image: ${artistProfileImage ? 'Yes' : 'No'}`);
      }
      
      // Use the same image as both avatar and background for now
      
      // Create artist record
      const [newArtist] = await db.insert(artists).values({
        name: artistName,
        avatar: artistProfileImage || '',
        background_image: artistProfileImage || '',
      }).returning();
      
      // Create a subdomain entry for the artist
      const uniqueSubdomain = await generateUniqueSubdomain(artistName);
      await db.insert(domains).values({
        artist_id: newArtist.id,
        subdomain: uniqueSubdomain,
      });
      
      artist = newArtist;
      
      // Add all platform links for this artist
      for (const [platform, url] of Object.entries(platforms)) {
        await db.insert(artist_links).values({
          artist_id: artist.id,
          name: getPlatformDisplayName(platform),
          url: url,
          icon: getPlatformIcon(platform),
          color: getPlatformColor(platform),
          order: getPlatformOrder(platform),
        }).onConflictDoNothing();
      }
    } catch (error) {
      console.error('Error adding artist:', error);
    }
  } else if (!artist && platforms.Spotify) {
    // If artist doesn't exist and no Apple Music but has Spotify, create with Spotify
    const spotifyId = platforms.Spotify.split('/').pop() as string;
    console.log(`Creating new artist from Spotify ID: ${spotifyId}`);
    
    try {
      // Get artist profile image from Spotify
      const artistProfileImage = await lookupSpotifyArtistProfileImage(spotifyId);
      console.log(`Got Spotify profile image: ${artistProfileImage ? 'Yes' : 'No'}`);
      
      // Create artist record
      const [newArtist] = await db.insert(artists).values({
        name: artistName,
        avatar: artistProfileImage || '',
        background_image: artistProfileImage || '',
      }).returning();
      
      // Create a subdomain entry for the artist
      const uniqueSubdomain = await generateUniqueSubdomain(artistName);
      await db.insert(domains).values({
        artist_id: newArtist.id,
        subdomain: uniqueSubdomain,
      });
      
      artist = newArtist;
      
      // Add all platform links for this artist
      for (const [platform, url] of Object.entries(platforms)) {
        await db.insert(artist_links).values({
          artist_id: artist.id,
          name: getPlatformDisplayName(platform),
          url: url,
          icon: getPlatformIcon(platform),
          color: getPlatformColor(platform),
          order: getPlatformOrder(platform),
        }).onConflictDoNothing();
      }
    } catch (error) {
      console.error('Error adding artist with Spotify:', error);
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
      
      // Check if we need to update the artist profile with Apple Music data or Spotify fallback
      if (!artist.avatar && !artist.background_image) {
        let artistProfileImage = '';
        
        // Try Apple Music first
        if (platforms.AppleMusic) {
          const appleMusicId = platforms.AppleMusic.split('/').pop() as string;
          try {
            artistProfileImage = await lookupArtistProfileImage(appleMusicId);
            console.log(`Got Apple Music profile image for existing artist: ${artistProfileImage ? 'Yes' : 'No'}`);
          } catch (error) {
            console.error('Error getting Apple Music profile image:', error);
          }
        }
        
        // If no Apple Music image and we have Spotify, try Spotify as fallback
        if (!artistProfileImage && platforms.Spotify) {
          const spotifyId = platforms.Spotify.split('/').pop() as string;
          try {
            artistProfileImage = await lookupSpotifyArtistProfileImage(spotifyId);
            console.log(`Got Spotify profile image for existing artist: ${artistProfileImage ? 'Yes' : 'No'}`);
          } catch (error) {
            console.error('Error getting Spotify profile image:', error);
          }
        }
        
        if (artistProfileImage) {
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
        }
      }
      
      // Add any new platform links
      for (const [platform, url] of Object.entries(platforms)) {
        const displayName = getPlatformDisplayName(platform);
        if (!existingPlatforms.has(displayName)) {
          console.log(`Adding new platform ${platform} for artist ${artistName}`);
          await db.insert(artist_links).values({
            artist_id: artist.id,
            name: displayName,
            url: url,
            icon: getPlatformIcon(platform),
            color: getPlatformColor(platform),
            order: getPlatformOrder(platform),
          }).onConflictDoNothing();
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