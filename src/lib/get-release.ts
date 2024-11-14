import { headers } from 'next/headers';
import conn from '@/db/drizzle-db';
import { artists, albums, tracks, track_links, album_links, track_artists } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getDomainAndSlug() {
  const headersList = await headers();
  const domain = headersList.get('host')?.split(':')[0] || '';
  const path = headersList.get('x-invoke-path') || '';
  const slug = path.split('/').pop() || '';
  return { domain, slug };
}

export async function getRelease() {
  const { domain, slug } = await getDomainAndSlug();
  const { db, client } = await conn();

  // First find the artist by domain
  const artist = await db.select().from(artists).where(
    eq(artists.domain, domain)
  ).execute();

  if (!artist.length) {
    client.end();
    return null;
  }

  // Check tracks first
  const track = await db.select()
    .from(tracks)
    .where(eq(tracks.slug, slug))
    .execute();

  if (track.length > 0) {
    // Found a track, get its metadata
    const trackArtist = await db.select()
      .from(track_artists)
      .where(eq(track_artists.track_isrc, track[0].isrc))
      .execute();

    // Only return if this track belongs to the artist
    if (trackArtist[0]?.artist_id === artist[0].id) {
      const links = await db.select()
        .from(track_links)
        .where(eq(track_links.track_isrc, track[0].isrc))
        .execute();

      client.end();
      return { info: track[0], links };
    }
  }

  // Check albums if no track was found
  const album = await db.select()
    .from(albums)
    .where(eq(albums.slug, slug))
    .execute();

  if (album.length > 0) {
    const links = await db.select()
      .from(album_links)
      .where(eq(album_links.album_upc, album[0].upc))
      .execute();

    client.end();
    return { info: album[0], links };
  }

  client.end();
  return null;
}

export async function getReleaseLinks() {
  const release = await getRelease();
  return release;
}

