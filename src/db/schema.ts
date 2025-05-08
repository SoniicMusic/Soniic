import { integer, pgTable, text, timestamp, primaryKey, boolean, unique } from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';
// AuthJS
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})
 
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)
 
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})
 
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
)
 
export const authenticators = pgTable(
  "authenticator",
  {
    credentialid: text("credentialid").notNull(), // Changed to lowercase
    userid: text("userid") // Changed to lowercase
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    pk: primaryKey({
      columns: [authenticator.userid, authenticator.credentialid],
    }),
  })
);

// Matheson's Schema

// Artists Table
export const artists = pgTable('artists', {
    id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text(),
    domain: text(),
    avatar: text(),
    bio: text(),
    background_image: text(),
});

// Artist Links Table
export const artist_links = pgTable('artist_links', {
    id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    artist_id: text().references(() => artists.id),
    name: text(),
    url: text(),
    icon: text(),
    color: text(),
    order: integer(),
});

// Albums Table
export const albums = pgTable('albums', {
  upc: text().primaryKey(),
  title: text(),
  release_date: text(),
  genre: text(),
  slug: text(),
  cover_art: text(),
});

// Album Links Table
export const album_links = pgTable('album_links', {
    album_upc: text().references(() => albums.upc),
    name: text(),
    url: text(),
    icon: text(),
    color: text(),
});

// Tracks Table (Modified)
export const tracks = pgTable('tracks', {
  isrc: text().primaryKey(),
  title: text(),
  album_upc: text().references(() => albums.upc).notNull(), // Required reference to album
  slug: text(),
  track_number: integer(), // New field to order tracks within album
  // Removed cover_art since we'll use the album's cover_art
});

// Track Links Table
export const track_links = pgTable('track_links', {
    track_isrc: text().references(() => tracks.isrc),
    url: text(),
    icon: text(),
    color: text(),
});

// Track Artists Table
export const track_artists = pgTable('track_artists', {
    id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    track_isrc: text().references(() => tracks.isrc),
    artist_id: text().references(() => artists.id),
}, (track_artist) => ({
    uniqueTrackArtist: unique().on(track_artist.track_isrc, track_artist.artist_id)
}));

// Tracks Albums Table
export const track_albums = pgTable('track_albums', {
    id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    track_isrc: text().references(() => tracks.isrc),
    album_upc: text().references(() => albums.upc),
});






