import { AppleMusiclookupISRC, AppleMusiclookupUPC, lookupArtistName } from './lookup/applemusic.js';
import { SpotifylookupISRC, SpotifylookupUPC } from './lookup/spotify.js';
import { TidalLookupISRC, TidalLookupUPC } from './lookup/tidal.js';


async function lookupISRC(ISRC, CountryCode) {

	// Start all asynchronous operations concurrently
	const [AM, Spotify, Tidal] = await Promise.all([
		AppleMusiclookupISRC(ISRC, CountryCode),
		SpotifylookupISRC(ISRC),
		TidalLookupISRC(ISRC, CountryCode),
	]);
	const artistIDs = {};

	// Extracting Apple Music artist IDs
	const appleMusicArtists = AM.relationships.artists.data;
	await Promise.all(appleMusicArtists.map(async artist => {
		// lookup the artist ID and find the name
		const artistID = artist.id;
		const artistName = await lookupArtistName(artistID);
		if (!artistIDs[artistName]) artistIDs[artistName] = {};
		artistIDs[artistName]['AppleMusic'] = artistID;
	}));

	// Extract artist IDs from Spotify
	Spotify.artists.forEach(artist => {
		const artistName = artist.name;
		if (!artistIDs[artistName]) artistIDs[artistName] = {};
		artistIDs[artistName]['Spotify'] = artist.id;
	});

	// Extract artist IDs from Tidal
	Tidal.resource.artists.forEach(artist => {
		const artistName = artist.name;
		if (!artistIDs[artistName]) artistIDs[artistName] = {};
		artistIDs[artistName]['Tidal'] = artist.id;
	});
	// Get Colors
	const artwork = AM.attributes.artwork;
	const colors = {};

	for (const key in artwork) {
		if (key.endsWith('Color')) {
			colors[key] = artwork[key];
		}
	}
	// Return the results
	return {
		TrackName: AM ? AM.attributes.name : null,
		ISRC: AM ? AM.attributes.isrc : null,
		Duration: AM ? AM.attributes.durationInMillis : null,
		AlbumName: AM ? AM.attributes.albumName : null,
		genreNames: AM ? AM.attributes.genreNames : null,
		ReleaseDate: AM ? AM.attributes.releaseDate : null,
		PreviewAudio: AM ? AM.attributes.previews[0].url : null,
		BackgroundImage: AM ? AM.attributes.artwork.url : null,
		Colors: colors,
		ArtistIDs: artistIDs,
		IDs: {
			AppleMusic: AM ? AM.id : null,
			Spotify: Spotify ? Spotify.id : null,
			Tidal: Tidal ? Tidal.resource.id : null,
		},
	};
}
async function lookupUPC(UPC, CountryCode) {
	// Start all asynchronous operations concurrently
	const [AM, Spotify, Tidal] = await Promise.all([
		AppleMusiclookupUPC(UPC, CountryCode),
		SpotifylookupUPC(UPC),
		TidalLookupUPC(UPC, CountryCode),
	]);
	const artistIDs = {};

	// Extracting Apple Music artist IDs
	const appleMusicArtists = AM.relationships.artists.data;
	await Promise.all(appleMusicArtists.map(async artist => {
		// lookup the artist ID and find the name
		const artistID = artist.id;
		const artistName = await lookupArtistName(artistID);
		if (!artistIDs[artistName]) artistIDs[artistName] = {};
		artistIDs[artistName]['AppleMusic'] = artistID;
	}));

	// Extract artist IDs from Spotify
	Spotify.artists.forEach(artist => {
		const artistName = artist.name;
		if (!artistIDs[artistName]) artistIDs[artistName] = {};
		artistIDs[artistName]['Spotify'] = artist.id;
	});

	// Extract artist IDs from Tidal
	Tidal.resource.artists.forEach(artist => {
		const artistName = artist.name;
		if (!artistIDs[artistName]) artistIDs[artistName] = {};
		artistIDs[artistName]['Tidal'] = artist.id;
	});

	// Get Colors
	const artwork = AM.attributes.artwork;
	const colors = {};

	for (const key in artwork) {
		if (key.endsWith('Color')) {
			colors[key] = artwork[key];
		}
	}
	// Return the results
	return {
		AlbumName: AM ? AM.attributes.name : null,
		genreNames: AM ? AM.attributes.genreNames : null,
		ReleaseDate: AM ? AM.attributes.releaseDate : null,
		PreviewAudio: AM ? AM.relationships.tracks.data[0].attributes.previews[0].url : null,
		BackgroundImage: AM ? AM.attributes.artwork.url : null,
		Colors: colors,
		ArtistIDs: artistIDs,
		IDs: {
			AppleMusic: AM ? AM.id : null,
			Spotify: Spotify ? Spotify.id : null,
			Tidal: Tidal ? Tidal.resource.id : null,
		},
	};
}

export {
	lookupISRC,
	lookupUPC,
};