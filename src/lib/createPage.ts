'use server';
import { getISRCSpotify, getSpotifyUPC } from './lookup/spotify';
import { lookupISRC, lookupUPC } from './magic-lookup';
import { addArtistLink } from './db/artist-db';
import { addTrack, linkArtistToTrack } from './db/track-db';
import { lookupAlbumUPC, addAlbum } from './db/album-db';

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
      
      // Look up the album UPC (or create a placeholder)
      const albumUPC = await lookupAlbumUPC(identifier.split('/').pop() || identifier);
      
      // Add track to database
      const savedTrack = await addTrack(track, albumUPC);
      
      // Process artists and link them to the track
      for (const artist in track.ArtistLinks) {
        const platforms = track.ArtistLinks[artist];
        console.log('artist', artist, platforms);
        
        // Add the artist and get the artist record
        const artistRecord = await addArtistLink(artist, platforms);
        
        if (artistRecord) {
          // Link artist to track
          await linkArtistToTrack(savedTrack.isrc, artistRecord.id);
        }
      }
      
      return {
        success: true,
        message: `Successfully added track: ${track.TrackName}`,
        track: savedTrack
      };
    }
    else if (type === 'album') {
      // Get UPC from Spotify
      const upc = await getSpotifyUPC(identifier);
      
      if (!upc) {
        return {
          success: false,
          message: 'Could not find UPC for album'
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
        await addArtistLink(artistName, platforms);
      }
      
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