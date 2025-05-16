import { headers } from 'next/headers';
import { db } from '@/db/drizzle-db';
import { artists, artist_links, domains } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getDomain() {
    const headersList = await headers()
    const domain = headersList.get('host')?.split(':')[0] || ''
    return domain;
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

// These functions are needed for the [domain]/[slug]/page.tsx file
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