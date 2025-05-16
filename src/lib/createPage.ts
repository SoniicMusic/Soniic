'use server';
import { getISRCSpotify, getSpotifyUPCAlbum, getSpotifyUPCTrack } from './lookup/spotify';
import { lookupISRC, lookupUPC } from './magic-lookup';
import { addArtistLink } from './db/artist-db';
import { addTrack, linkArtistToTrack } from './db/track-db';
import { addAlbum, getAlbumByUPC } from './db/album-db';

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
        if (albumData) {
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