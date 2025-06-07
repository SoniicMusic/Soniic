'use server';
import { db } from '../../db/drizzle-db';
import { albums } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { lookupUPC } from '../magic-lookup';
import slugify from 'slugify';

export interface MigrationResult {
  success: boolean;
  message: string;
  updated: number;
  errors: number;
  errorDetails: string[];
}

/**
 * Migrates albums with "unknown-album" slugs to proper album names and slugs
 * This function can be called from API routes, scheduled jobs, or scripts
 */
export async function migrateUnknownAlbums(): Promise<MigrationResult> {
  try {
    console.log('Starting migration of unknown albums...');

    const unknownAlbums = await db.select().from(albums).where(eq(albums.slug, 'unknown-album'));

    if (unknownAlbums.length === 0) {
      console.log('No albums with "unknown-album" slug found. Migration not needed.');
      return {
        success: true,
        message: 'No albums with "unknown-album" slug found. Migration not needed.',
        updated: 0,
        errors: 0,
        errorDetails: []
      };
    }

    console.log(`Found ${unknownAlbums.length} albums with "unknown-album" slug.`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

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
            })
            .where(eq(albums.upc, album.upc));
          
          console.log(`Successfully updated album with UPC: ${album.upc}`);
          successCount++;
        } else {
          const errorMsg = `Could not find a valid new title for album with UPC: ${album.upc}. Original title: "${album.title}"`;
          console.warn(errorMsg);
          errors.push(errorMsg);
          errorCount++;
        }
      } catch (error) {
        const errorMsg = `Error processing album with UPC: ${album.upc} - ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        errorCount++;
      }
    }

    console.log('Migration of unknown albums completed.');
    
    return {
      success: true,
      message: `Migration completed. Updated: ${successCount}, Errors: ${errorCount}`,
      updated: successCount,
      errors: errorCount,
      errorDetails: errors
    };

  } catch (error) {
    console.error('Migration script failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : String(error)}`,
      updated: 0,
      errors: 1,
      errorDetails: [error instanceof Error ? error.message : String(error)]
    };
  }
}


