import { headers } from 'next/headers';
import conn from '@/db/drizzle-db';
import { artists } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getDomain() {
    const headersList = await headers()
    const domain = headersList.get('host')?.split(':')[0] || ''
    return domain;
  }
export async function getArtist() {
    const domain = await getDomain()
    const db = await conn()
    const artist = await db.select().from(artists).where(
      eq(artists.domain, domain)
    ).execute()
    console.log(artist)
    return artist[0]
  }
