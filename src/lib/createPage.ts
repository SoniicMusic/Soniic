'use server';
import { getISRCSpotify } from './lookup/spotify';
import { lookupISRC } from './magic-lookup';


export async function testLookup(identifier: string, type: "track" | "album") {
  console.log('testLookup', identifier, type);
if (type === 'track') {
const isrc = await getISRCSpotify(identifier);
const track = await lookupISRC(isrc, 'CA');

for (const artist in track.ArtistLinks) {
  const platforms = track.ArtistLinks[artist];
  console.log('artist', artist, platforms);
  addArtistLink(artist, platforms);


}
}
else if (type === 'album') {
  console.log('album');
}
}