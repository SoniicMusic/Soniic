'use server';
import { db } from '@/db/drizzle-db'; // Assuming this is your database instance
import { track_artists, tracks, album_links, artist_links, artists, track_links } from '@/db/schema'; // Import your tables
import { eq } from 'drizzle-orm';
import { dynamicRedirect } from './redirect';
import { getISRCSpotify } from './lookup/spotify';
import { lookupISRC } from './magic-lookup';
import { lookupArtistName } from './lookup/applemusic';

async function getTrackIsrcFromUrl(spotifyURL) {
  const track_isrc = await db.select({
    track_isrc: track_links.track_isrc,
  }).from(track_links).where(eq(track_links.url, spotifyURL)).limit(1);
  
  return track_isrc.length > 0 ? track_isrc[0].track_isrc : null;
}

async function getTrackFromIsrc(isrc) {
  const track = await db.select()
    .from(tracks)
    .where(eq(tracks.isrc, isrc))
    .limit(1);
  
  return track.length > 0 ? track[0] : null;
}

async function getArtistDomainFromTrack(trackIsrc) {
  const artist = await db.select({
    artist_id: track_artists.artist_id,
  }).from(track_artists)
    .where(eq(track_artists.track_isrc, trackIsrc))
    .limit(1);

  if (artist.length === 0) return null;

  const domain = await db.select({
    artist_domain: artists.domain,
  }).from(artists)
    .where(eq(artists.id, artist[0].artist_id))
    .limit(1);

  return domain.length > 0 ? domain[0].artist_domain : null;
}

async function lookupPage(spotifyURL, type) {
  if (!spotifyURL) return null;
  if (type === 'track') {
  const isrc = await getTrackIsrcFromUrl(spotifyURL);
  if (!isrc) return null;

  const track = await getTrackFromIsrc(isrc);
  if (!track) return null;

  const artistDomain = await getArtistDomainFromTrack(track.isrc);
  if (!artistDomain) return null;

  return `${artistDomain}/${track.slug}`;
  }
  else if (type === 'album') {
  
  }
}
//
async function addArtistsToDB(artists) {
  // loop through artists and add them to the db
  const artistIds = [];
  for (let artist of artists) {
    lookupArtistName(artist);
    

  }
}
export async function testLookup(identifier, type) {
  console.log('testLookup', identifier, type);
if (type === 'track') {
const isrc = await getISRCSpotify(identifier);
const track = await lookupISRC(isrc, 'CA');



if (!isrc) 
{
 
  
}
}
else if (type === 'album') {
  const upc = await getUPCSpotify(identifier);
}
}

async function addTrackToDB(trackData) {
  const track = await db.insert(tracks).values(trackData).execute();
  return track;
  
}