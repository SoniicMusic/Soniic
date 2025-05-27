'use server';
import { db } from '../db/drizzle-db';
import { track_links, album_links, tracks, albums } from '../db/schema';
import { eq } from 'drizzle-orm';
import { lookupISRC, lookupUPC } from './magic-lookup';
import { getPlatformColor, getPlatformIcon } from './utils/platform-config';

/**
 * Checks if track links exist and backfills missing ones
 */
export async function ensureTrackLinks(trackISRC: string): Promise<void> {
  try {
    console.log(`Checking track links for ISRC: ${trackISRC}`);
    
    // Get existing track links
    const existingLinks = await db.select().from(track_links).where(
      eq(track_links.track_isrc, trackISRC)
    ).execute();
    
    console.log(`Found ${existingLinks.length} existing track links`);
    
    // If we have no links at all, perform a lookup to get them
    if (existingLinks.length === 0) {
      console.log('No track links found, performing lookup...');
      
      const trackData = await lookupISRC(trackISRC, 'US');
      
      if (trackData?.TrackLinks) {
        console.log('Found track links from lookup:', Object.keys(trackData.TrackLinks));
        
        // Add the missing track links
        for (const [platform, url] of Object.entries(trackData.TrackLinks)) {
          if (url) {
            console.log(`Adding track link for ${platform}: ${url}`);
            
            await db.insert(track_links).values({
              track_isrc: trackISRC,
              name: platform,
              url: url,
              icon: getPlatformIcon(platform),
              color: getPlatformColor(platform),
            }).onConflictDoNothing();
          }
        }
        
        console.log('Track links backfilled successfully');
      } else {
        console.log('No track links found in lookup result');
      }
    } else {
      // Check if we're missing any of the major platforms
      const existingPlatforms = new Set(existingLinks.map(link => link.name));
      const majorPlatforms = ['AppleMusic', 'Spotify', 'Tidal'];
      const missingPlatforms = majorPlatforms.filter(platform => !existingPlatforms.has(platform));
      
      if (missingPlatforms.length > 0) {
        console.log(`Missing platforms: ${missingPlatforms.join(', ')}, performing lookup...`);
        
        const trackData = await lookupISRC(trackISRC, 'US');
        
        if (trackData?.TrackLinks) {
          // Add only the missing platform links
          for (const platform of missingPlatforms) {
            const url = trackData.TrackLinks[platform as keyof typeof trackData.TrackLinks];
            if (url) {
              console.log(`Adding missing track link for ${platform}: ${url}`);
              
              await db.insert(track_links).values({
                track_isrc: trackISRC,
                name: platform,
                url: url,
                icon: getPlatformIcon(platform),
                color: getPlatformColor(platform),
              }).onConflictDoNothing();
            }
          }
          
          console.log('Missing track links backfilled successfully');
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring track links:', error);
  }
}

/**
 * Checks if album links exist and backfills missing ones
 */
export async function ensureAlbumLinks(albumUPC: string): Promise<void> {
  try {
    console.log(`Checking album links for UPC: ${albumUPC}`);
    
    // Get existing album links
    const existingLinks = await db.select().from(album_links).where(
      eq(album_links.album_upc, albumUPC)
    ).execute();
    
    console.log(`Found ${existingLinks.length} existing album links`);
    
    // If we have no links at all, perform a lookup to get them
    if (existingLinks.length === 0) {
      console.log('No album links found, performing lookup...');
      
      const albumData = await lookupUPC(albumUPC, 'US');
      
      if (albumData?.Links) {
        console.log('Found album links from lookup:', Object.keys(albumData.Links));
        
        // Add the missing album links
        for (const [platform, url] of Object.entries(albumData.Links)) {
          if (url) {
            console.log(`Adding album link for ${platform}: ${url}`);
            
            await db.insert(album_links).values({
              album_upc: albumUPC,
              name: platform,
              url: url,
              icon: getPlatformIcon(platform),
              color: getPlatformColor(platform),
            }).onConflictDoNothing();
          }
        }
        
        console.log('Album links backfilled successfully');
      } else {
        console.log('No album links found in lookup result');
      }
    } else {
      // Check if we're missing any of the major platforms
      const existingPlatforms = new Set(existingLinks.map(link => link.name));
      const majorPlatforms = ['AppleMusic', 'Spotify', 'Tidal'];
      const missingPlatforms = majorPlatforms.filter(platform => !existingPlatforms.has(platform));
      
      if (missingPlatforms.length > 0) {
        console.log(`Missing platforms: ${missingPlatforms.join(', ')}, performing lookup...`);
        
        const albumData = await lookupUPC(albumUPC, 'US');
        
        if (albumData?.Links) {
          // Add only the missing platform links
          for (const platform of missingPlatforms) {
            const url = albumData.Links[platform as keyof typeof albumData.Links];
            if (url) {
              console.log(`Adding missing album link for ${platform}: ${url}`);
              
              await db.insert(album_links).values({
                album_upc: albumUPC,
                name: platform,
                url: url,
                icon: getPlatformIcon(platform),
                color: getPlatformColor(platform),
              }).onConflictDoNothing();
            }
          }
          
          console.log('Missing album links backfilled successfully');
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring album links:', error);
  }
}

/**
 * Bulk backfill links for all tracks that have missing links
 */
export async function backfillAllTrackLinks(): Promise<void> {
  try {
    console.log('Starting bulk backfill of track links...');
    
    // Get all tracks
    const allTracks = await db.select().from(tracks).execute();
    console.log(`Found ${allTracks.length} tracks to check`);
    
    for (const track of allTracks) {
      await ensureTrackLinks(track.isrc);
      // Add a small delay to avoid overwhelming the APIs
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Bulk track links backfill completed');
  } catch (error) {
    console.error('Error in bulk track links backfill:', error);
  }
}

/**
 * Bulk backfill links for all albums that have missing links
 */
export async function backfillAllAlbumLinks(): Promise<void> {
  try {
    console.log('Starting bulk backfill of album links...');
    
    // Get all albums
    const allAlbums = await db.select().from(albums).execute();
    console.log(`Found ${allAlbums.length} albums to check`);
    
    for (const album of allAlbums) {
      await ensureAlbumLinks(album.upc);
      // Add a small delay to avoid overwhelming the APIs
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Bulk album links backfill completed');
  } catch (error) {
    console.error('Error in bulk album links backfill:', error);
  }
}
