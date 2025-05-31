// Helper functions to get artists for tracks and albums
import { db } from '@/db/drizzle-db';
import { artists, track_artists, tracks, domains } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface ArtistWithDomain {
  id: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  background_image: string | null;
  subdomain?: string;
}

/**
 * Get artists associated with a track by ISRC
 */
export async function getTrackArtistsWithDomains(isrc: string): Promise<ArtistWithDomain[]> {
  try {
    // Get track artists relationships
    const trackArtistRelations = await db
      .select()
      .from(track_artists)
      .where(eq(track_artists.track_isrc, isrc))
      .execute();

    if (trackArtistRelations.length === 0) {
      return [];
    }

    // Get artist details for each relation
    const artistsWithDomains: ArtistWithDomain[] = [];
    
    for (const relation of trackArtistRelations) {
      if (!relation.artist_id) continue;
      
      // Get artist info
      const artist = await db
        .select()
        .from(artists)
        .where(eq(artists.id, relation.artist_id))
        .execute();
      
      if (artist.length === 0) continue;
      
      // Get domain for artist
      const domain = await db
        .select()
        .from(domains)
        .where(eq(domains.artist_id, relation.artist_id))
        .execute();
      
      artistsWithDomains.push({
        ...artist[0],
        subdomain: domain[0]?.subdomain || undefined
      });
    }
    
    return artistsWithDomains;
  } catch (error) {
    return [];
  }
}

/**
 * Get artists associated with an album by finding artists through album tracks
 */
export async function getAlbumArtistsWithDomains(albumUpc: string): Promise<ArtistWithDomain[]> {
  try {
    // First get all tracks for this album
    const albumTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.album_upc, albumUpc))
      .execute();

    if (albumTracks.length === 0) {
      return [];
    }

    // Get all unique artists from all tracks in the album
    const artistMap = new Map<string, ArtistWithDomain>();
    
    for (const track of albumTracks) {
      const trackArtists = await getTrackArtistsWithDomains(track.isrc);
      
      for (const artist of trackArtists) {
        if (!artistMap.has(artist.id)) {
          artistMap.set(artist.id, artist);
        }
      }
    }
    
    return Array.from(artistMap.values());
  } catch (error) {
    console.error('Error getting album artists:', error);
    return [];
  }
}
