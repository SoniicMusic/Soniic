import { headers } from 'next/headers';
import { db } from '@/db/drizzle-db';
import { artists, artist_links, domains, tracks, albums, track_links, album_links, track_artists } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getDomain() {
    const headersList = await headers()
    const fullDomain = headersList.get('host')?.split(':')[0] || ''
    
    // Extract subdomain from domain like "troye-sivan.localhost" -> "troye-sivan"
    if (fullDomain.includes('.localhost')) {
        return fullDomain.split('.localhost')[0];
    }
    // For production domains like "troye-sivan.soniic.com" -> "troye-sivan"
    else if (fullDomain.includes('.')) {
        return fullDomain.split('.')[0];
    }
    
    return fullDomain;
}
export async function getArtist() {
    const subdomain = await getDomain()
    console.log('subdomain', subdomain)
    
    // First, find the domain entry for this host
    const domainRecord = await db.select().from(domains).where(
      eq(domains.subdomain, subdomain)
    ).execute()
    
    if (!domainRecord || domainRecord.length === 0) {
      // Also check for custom domain if no subdomain match is found
      const customDomainRecord = await db.select().from(domains).where(
        eq(domains.custom_domain, subdomain)
      ).execute()
      
      if (!customDomainRecord || customDomainRecord.length === 0) {
        return null
      }
      
      // Get artist using artist_id from custom domain
      const artist = await db.select().from(artists).where(
        eq(artists.id, customDomainRecord[0].artist_id)
      ).execute()
      
      return artist[0]
    }
    
    // Get artist using artist_id from domain
    const artist = await db.select().from(artists).where(
      eq(artists.id, domainRecord[0].artist_id)
    ).execute()
    
    return artist[0]
  }
export async function getArtistLinks() {
    const artist = await getArtist()
    console.log('artist', artist)
    if (!artist) {
      return null
    }
    const links = await db.select().from(artist_links).where(
      eq(artist_links.artist_id, artist.id)
    ).orderBy(artist_links.order).execute()
    return {artist, links}
  }

// These functions are needed for the [domain]/track/[slug]/page.tsx and [domain]/album/[slug]/page.tsx files
export async function getReleaseLinks() {
  const artist = await getArtist();
  if (!artist) {
    return null;
  }
  const links = await db.select().from(artist_links).where(
    eq(artist_links.artist_id, artist.id)
  ).orderBy(artist_links.order).execute();
  
  return {
    info: artist,
    links: links
  };
}

export async function getRelease() {
  return await getArtist();
}

// Track-specific functions
export async function getTrackBySlug(slug: string) {
  console.log('Getting track by slug:', slug);
  
  // First get the artist for this domain
  const artist = await getArtist();
  if (!artist) {
    console.log('No artist found for domain');
    return null;
  }
  
  // Find track by slug
  const track = await db.select().from(tracks).where(
    eq(tracks.slug, slug)
  ).execute();
  
  if (!track || track.length === 0) {
    console.log('No track found with slug:', slug);
    return null;
  }
  
  console.log('Found track:', track[0]);
  return track[0];
}

export async function getTrackLinks(slug: string) {
  const track = await getTrackBySlug(slug);
  if (!track) {
    return null;
  }
  
  // Get track links
  const links = await db.select().from(track_links).where(
    eq(track_links.track_isrc, track.isrc)
  ).execute();
  
  // Get the artist for this track
  const trackArtistRelation = await db.select().from(track_artists).where(
    eq(track_artists.track_isrc, track.isrc)
  ).execute();
  
  let artist = null;
  if (trackArtistRelation.length > 0) {
    const artistResult = await db.select().from(artists).where(
      eq(artists.id, trackArtistRelation[0].artist_id!)
    ).execute();
    artist = artistResult[0];
  }
  
  return {
    info: {
      ...artist,
      name: track.title, // Use track title as the main name
      track: track
    },
    links: links
  };
}

// Album-specific functions
export async function getAlbumBySlug(slug: string) {
  console.log('Getting album by slug:', slug);
  
  // First get the artist for this domain
  const artist = await getArtist();
  if (!artist) {
    console.log('No artist found for domain');
    return null;
  }
  
  // Find album by slug
  const album = await db.select().from(albums).where(
    eq(albums.slug, slug)
  ).execute();
  
  if (!album || album.length === 0) {
    console.log('No album found with slug:', slug);
    return null;
  }
  
  console.log('Found album:', album[0]);
  return album[0];
}

export async function getAlbumLinks(slug: string) {
  const album = await getAlbumBySlug(slug);
  if (!album) {
    return null;
  }
  
  // Get album links
  const links = await db.select().from(album_links).where(
    eq(album_links.album_upc, album.upc)
  ).execute();
  
  // Get the artist info (we can use the domain artist)
  const artist = await getArtist();
  
  return {
    info: {
      ...artist,
      name: album.title, // Use album title as the main name
      album: album
    },
    links: links
  };
}

// In the future, we can add track-specific and album-specific methods here
// For example:
// export async function getTrackInfo(slug: string) { ... }
// export async function getAlbumInfo(slug: string) { ... }