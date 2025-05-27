// Script to add unique constraints to prevent duplicate platform links
import { db } from '../src/db/drizzle-db';
import { sql } from 'drizzle-orm';

async function addUniqueConstraints() {
  try {
    console.log('Adding unique constraints to prevent duplicate platform links...');

    // Artist links: ensure one link per platform per artist
    await db.execute(sql`
      ALTER TABLE "artist_links" 
      ADD CONSTRAINT "artist_links_artist_id_name_unique" 
      UNIQUE("artist_id","name")
    `);
    console.log('✓ Added unique constraint to artist_links');

    // Album links: ensure one link per platform per album  
    await db.execute(sql`
      ALTER TABLE "album_links" 
      ADD CONSTRAINT "album_links_album_upc_name_unique" 
      UNIQUE("album_upc","name")
    `);
    console.log('✓ Added unique constraint to album_links');

    // Track links: ensure one link per platform per track
    await db.execute(sql`
      ALTER TABLE "track_links" 
      ADD CONSTRAINT "track_links_track_isrc_name_unique" 
      UNIQUE("track_isrc","name")
    `);
    console.log('✓ Added unique constraint to track_links');

    console.log('All unique constraints added successfully!');
  } catch (error) {
    console.error('Error adding unique constraints:', error);
  }
}

addUniqueConstraints();
