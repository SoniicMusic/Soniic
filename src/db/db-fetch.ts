import conn from '@/db/drizzle-db';
import { artists } from './schema';
import { eq } from 'drizzle-orm';
export async function fetchClientData(domain: string) {
    // Replace with a database or API call to retrieve client data by domain
    const db = await conn();
        const query = await db.select().from(artists).where(eq(artists.domain, domain));
        if (query.length > 0) {
            return query[0];
        } 
        else {
    // If no client is found,
    console.log(`No client found for domain: ${domain}`);
    return null;
  }
}