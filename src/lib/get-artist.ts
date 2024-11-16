import { headers } from 'next/headers';
import { db } from '@/db/drizzle-db';
import { artists, artist_links } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getDomain() {
    const headersList = await headers()
    const domain = headersList.get('host')?.split(':')[0] || ''
    return domain;
  }
export async function getArtist() {
    const domain = await getDomain()
    const artist = await db.select().from(artists).where(
      eq(artists.domain, domain)
    ).execute()
    return artist[0]
  }
export async function getArtistLinks() {
    const artist = await getArtist()
    const links = await db.select().from(artist_links).where(
      eq(artist_links.artist_id, artist.id)
    ).execute()
    return {artist, links}
  }