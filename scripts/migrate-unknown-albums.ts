import { db } from '../src/db/drizzle-db';
import { albums } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { lookupUPC } from '../src/lib/magic-lookup';
import slugify from 'slugify';

async function migrateUnknownAlbums() {
  console.log('Starting migration of unknown albums...');

  const unknownAlbums = await db.select().from(albums).where(eq(albums.slug, 'unknown-album'));

  if (unknownAlbums.length === 0) {
    console.log('No albums with "unknown-album" slug found. Migration not needed.');
    return;
  }

  console.log(`Found ${unknownAlbums.length} albums with "unknown-album" slug.`);

  for (const album of unknownAlbums) {
    console.log(`Processing album with UPC: ${album.upc}`);
    try {
      const albumData = await lookupUPC(album.upc, 'CA');
      
      if (albumData && albumData.AlbumName && albumData.AlbumName !== 'Unknown Album') {
        const newSlug = slugify(albumData.AlbumName, { lower: true, strict: true });
        console.log(`Found new title: "${albumData.AlbumName}", new slug: "${newSlug}" for UPC: ${album.upc}`);
        
        await db.update(albums)
          .set({
            title: albumData.AlbumName,
            slug: newSlug,
            // Optionally, update other fields if they might have been incorrect
            // release_date: albumData.ReleaseDate || album.release_date,
            // genre: albumData.genreNames && albumData.genreNames.length > 0 ? albumData.genreNames[0] : album.genre,
            // cover_art: albumData.BackgroundImage?.replace('{w}x{h}', '3000x3000') || album.cover_art,
          })
          .where(eq(albums.upc, album.upc));
        
        console.log(`Successfully updated album with UPC: ${album.upc}`);
      } else {
        console.warn(`Could not find a valid new title for album with UPC: ${album.upc}. Original title: "${album.title}". Lookup result: ${JSON.stringify(albumData)}`);
      }
    } catch (error) {
      console.error(`Error processing album with UPC: ${album.upc}`, error);
    }
  }

  console.log('Migration of unknown albums completed.');
}

migrateUnknownAlbums().catch(err => {
  console.error('Migration script failed:', err);
  process.exit(1);
});
