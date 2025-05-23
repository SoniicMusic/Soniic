'use server';
import { getISRCSpotify, getSpotifyUPCAlbum, getSpotifyUPCTrack } from './lookup/spotify';
import { lookupISRC, lookupUPC } from './magic-lookup';
import { addArtistLink } from './db/artist-db';
import { addTrack, linkArtistToTrack } from './db/track-db';
import { addAlbum, getAlbumByUPC } from './db/album-db';
import { buildRedirectUrl } from './redirect';
import { db } from '@/db/drizzle-db';
import { domains, artists, tracks, track_artists } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Main function to test looking up and saving a song or album
 */
export async function testLookup(identifier: string, type: "track" | "album") {
  console.log('testLookup', identifier, type);
  
  try {
    if (type === 'track') {
      // Get ISRC from Spotify
      const isrc = await getISRCSpotify(identifier);
      // Look up track across platforms
      const track = await lookupISRC(isrc, 'CA');
      
      // Look up the album UPC directly from Spotify
      const albumUPC = await getSpotifyUPCTrack(identifier);
      
      if (!albumUPC) {
        throw new Error('UPC not found for the given Spotify ID');
      }
      
      // Check if the album exists first
      let album = await getAlbumByUPC(albumUPC);
      
      // If album doesn't exist, look it up and create it
      if (!album) {
        const albumData = await lookupUPC(albumUPC, 'CA');
        // As long as we have a UPC, we can continue even if some platforms didn't have data
        // We just need basic album info that could come from any of the platforms
        if (albumData && albumData.UPC) {
          // Use fallback data if needed
          if (!albumData.AlbumName) {
            albumData.AlbumName = "Unknown Album";
            console.warn(`No album name found for UPC: ${albumUPC}, using fallback`);
          }
          album = await addAlbum(albumData);
        } else {
          throw new Error('Failed to fetch album data for UPC: ' + albumUPC);
        }
      }
      
      // Add track to database
      const savedTrack = await addTrack(track, albumUPC);
      console.log('Saved track:', savedTrack);
      if (!savedTrack) {
        throw new Error('Failed to save track');
      }
      
      // Process artists and link them to the track
      for (const artist in track.ArtistLinks) {
        const platforms = track.ArtistLinks[artist];        
        // Add the artist and get the artist record
        const artistRecord = await addArtistLink(artist, platforms);
        
        if (artistRecord) {
          // Link artist to track
          await linkArtistToTrack(savedTrack.isrc, artistRecord.id);
        }
      }
      
      // Find the primary artist to determine which domain to redirect to
      const firstArtist = Object.keys(track.ArtistLinks)[0];
      if (firstArtist) {
        const artistRecord = await db.query.artists.findFirst({
          where: eq(artists.name, firstArtist)
        });
        
        if (artistRecord) {
          // Get the domain for this artist
          const artistId = artistRecord.id;
          const domainRecord = await db.select().from(domains).where(
            eq(domains.artist_id, artistId)
          ).execute();
          
          if (domainRecord && domainRecord.length > 0) {
            // Build the redirect URL
            const domain = domainRecord[0].subdomain;
            const slug = savedTrack.slug;
            
            // Return success with redirect URL using the new format with '/track/'
            return {
              success: true,
              message: `Successfully added track: ${track.TrackName}`,
              track: savedTrack,
              redirectUrl: buildRedirectUrl(`${domain}/track/${slug}`)
            };
          }
        }
      }
      
      // Return data without redirect if we couldn't determine a redirect URL
      return {
        success: true,
        message: `Successfully added track: ${track.TrackName}`,
        track: savedTrack
      };
    }
    else if (type === 'album') {
      // Get UPC from Spotify
      const upc = await getSpotifyUPCAlbum(identifier);
      
      if (!upc) {
        return {
          success: false,
          message: 'Could not find UPC for album'
        };
      }
      
      // Check if album already exists
      let existingAlbum = await getAlbumByUPC(upc);
      if (existingAlbum) {
        // Find an artist associated with this album to determine which domain to redirect to
        // This lookup is a bit complex since we don't have a direct album-artist relationship
        // We'll try to find a track in this album first, then look up an artist from that track
        const albumTracks = await db.select().from(tracks).where(
          eq(tracks.album_upc, existingAlbum.upc)
        ).execute();
        
        if (albumTracks && albumTracks.length > 0) {
          const trackArtists = await db.select().from(track_artists).where(
            eq(track_artists.track_isrc, albumTracks[0].isrc)
          ).execute();
          
          if (trackArtists && trackArtists.length > 0 && trackArtists[0].artist_id) {
            // Use a string variable to work around the type check
            const artistId = trackArtists[0].artist_id as string;
            const domainRecords = await db.select().from(domains).where(
              eq(domains.artist_id, artistId)
            ).execute();
            
            if (domainRecords && domainRecords.length > 0) {
              // Return success with redirect URL with the new format including '/album/'
              return {
                success: true,
                message: `Album already exists: ${existingAlbum.title}`,
                album: existingAlbum,
                redirectUrl: buildRedirectUrl(`${domainRecords[0].subdomain}/album/${existingAlbum.slug}`)
              };
            }
          }
        }
        
        return {
          success: true,
          message: `Album already exists: ${existingAlbum.title}`,
          album: existingAlbum
        };
      }
      
      // Look up album across platforms
      const album = await lookupUPC(upc, 'CA');
      
      // Add album to database
      const savedAlbum = await addAlbum(album);
      
      // Process artists for the album
      for (const artistName in album.ArtistIDs) {
        const platforms: Record<string, string> = {};
        
        // Convert artist IDs to URLs for each platform
        const artistIds = album.ArtistIDs[artistName];
        if (artistIds.AppleMusic) {
          platforms.AppleMusic = `https://music.apple.com/artist/${artistIds.AppleMusic}`;
        }
        if (artistIds.Spotify) {
          platforms.Spotify = `https://open.spotify.com/artist/${artistIds.Spotify}`;
        }
        if (artistIds.Tidal) {
          platforms.Tidal = `https://tidal.com/browse/artist/${artistIds.Tidal}`;
        }
        
        // Add artist to database
        const artistRecord = await addArtistLink(artistName, platforms);
        
        // If we were implementing album-artist relationships, we'd link them here
        // Since your schema update doesn't include an album_artists table,
        // we're assuming this relationship is implied through tracks
      }
      
      // Find the primary artist to determine which domain to redirect to
      const firstArtistName = Object.keys(album.ArtistIDs)[0];
      
      if (firstArtistName) {
        const artistRecords = await db.select().from(artists).where(
          eq(artists.name, firstArtistName)
        ).execute();
        
        if (artistRecords && artistRecords.length > 0) {
          // Get the domain for this artist
          const artistId = artistRecords[0].id;
          const domainRecords = await db.select().from(domains).where(
            eq(domains.artist_id, artistId)
          ).execute();
          
          if (domainRecords && domainRecords.length > 0) {
            // Build the redirect URL
            const domain = domainRecords[0].subdomain;
            const slug = savedAlbum.slug;
            
            // Return success with redirect URL using the new format with '/album/'
            return {
              success: true,
              message: `Successfully added album: ${album.AlbumName}`,
              album: savedAlbum,
              redirectUrl: buildRedirectUrl(`${domain}/album/${slug}`)
            };
          }
        }
      }
      
      // Return data without redirect if we couldn't determine a redirect URL
      return {
        success: true,
        message: `Successfully added album: ${album.AlbumName}`,
        album: savedAlbum
      };
    }
    
    return {
      success: false,
      message: 'Invalid type specified. Use "track" or "album".'
    };
  } catch (error) {
    console.error('Error in testLookup:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}