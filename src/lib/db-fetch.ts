import conn from '@/db/drizzle-db';
import { , artists } from '../db/schema';
import { eq } from 'drizzle-orm';
export async function fetchClientData(domain: string) {
    // Replace with a database or API call to retrieve client data by domain
    const db = await conn();
        const query = await db.select().from(artists).where(eq(artists.domain, domain));
        if (query.length > 0) {
            const artist_links = await db.select().from(artist_links).where(eq(artist_links.artist_id, query[0].id));
            return { ...query[0], links: artist_links };
        }
        else {
    // If no client is found,
    console.log(`No client found for domain: ${domain}`);
    return null;
  }
}