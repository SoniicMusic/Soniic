import { int, mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

// Artists Table
export const artists = mysqlTable('artists', {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }),
    domain: varchar({ length: 255 }),
});

// Artist Links Table
export const artist_links = mysqlTable('artist_links', {
    id: serial().primaryKey(),
    artist_id: int().references(() => artists.id),
    url: varchar({ length: 255 }),
    icon: varchar({ length: 255 }),
    color: varchar({ length: 255 }),
});

// Albums Table
export const albums = mysqlTable('albums', {
    upc: serial().primaryKey(),
    title: varchar({ length: 255 }),
    release_date: varchar({ length: 255 }), // You can use DATE type if your library supports it
    genre: varchar({ length: 100 }),
});

// Tracks Table
export const tracks = mysqlTable('tracks', {
    isrc: serial().primaryKey(),
    title: varchar({ length: 255 }),
    album_upc: int().references(() => albums.upc),
    slug: varchar({ length: 255 }),
});

// Track Links Table
export const track_links = mysqlTable('track_links', {
    id: serial().primaryKey(),
    track_isrc: int().references(() => tracks.isrc),
    url: varchar({ length: 255 }),
    icon: varchar({ length: 255 }),
    color: varchar({ length: 255 }),
});

// Track Artists Table
export const track_artists = mysqlTable('track_artists', {
    id: serial().primaryKey(),
    track_isrc: int().references(() => tracks.isrc),
    artist_id: int().references(() => artists.id),
});




