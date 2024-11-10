import { headers } from 'next/headers';
import conn from '@/db/drizzle-db';
import { artists, artist_links } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getDomain() {
    const headersList = await headers()
    const domain = headersList.get('host')?.split(':')[0] || ''
    return domain;
  }
export async function getArtist() {
    const domain = await getDomain()
    const {db, client} = await conn()
    const artist = await db.select().from(artists).where(
      eq(artists.domain, domain)
    ).execute()
    client.end()
    return artist[0]
  }
export async function getArtistLinks() {
    const artist = await getArtist()
    const {db, client }= await conn()
    const links = await db.select().from(artist_links).where(
      eq(artist_links.artist_id, artist.id)
    ).execute()
    client.end()
    return links
  }