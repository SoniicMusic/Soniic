import { AppleMusiclookupISRC, AppleMusiclookupUPC, lookupArtistName } from './lookup/applemusic.js';
import { SpotifylookupISRC, SpotifylookupUPC } from './lookup/spotify.js';
import { TidalLookupISRC, TidalLookupUPC } from './lookup/tidal.js';
import { ArtistMapper } from './artist-mapper.js';

async function lookupISRC(ISRC: string, CountryCode: string) {
    const [AM, Spotify, Tidal] = await Promise.all([
        AppleMusiclookupISRC(ISRC, CountryCode),
        SpotifylookupISRC(ISRC),
        TidalLookupISRC(ISRC, CountryCode),
    ]);

    const mapper = new ArtistMapper();

    // Process Apple Music artists
    await Promise.all(AM.relationships.artists.data.map(async (artist: { id: string; }) => {
        const artistName = await lookupArtistName(artist.id);
        mapper.addArtist(artistName, 'AppleMusic', artist.id);
    }));

    // Process Spotify artists
    Spotify.artists.forEach((artist: { name: string; id: string; }) => {
        mapper.addArtist(artist.name, 'Spotify', artist.id);
    });

    // Process Tidal artists
    Tidal.artists.forEach((artist: { name: string; id: string; }) => {
        mapper.addArtist(artist.name, 'Tidal', artist.id);
    });

    const artistIDs = mapper.getArtistGroups();

    // Get Colors
    const artwork = AM.attributes.artwork;
    const colors: { [key: string]: string } = {};

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
            Tidal: Tidal ? Tidal.id : null,
        },
    };
}

async function lookupUPC(UPC: string, CountryCode: string) {
    // Start all asynchronous operations concurrently
    const [AM, Spotify, Tidal] = await Promise.all([
        AppleMusiclookupUPC(UPC, CountryCode),
        SpotifylookupUPC(UPC),
        TidalLookupUPC(UPC, CountryCode),
    ]);
    const artistIDs: { [key: string]: { [key: string]: string } } = {};

    // Extracting Apple Music artist IDs
    const appleMusicArtists = AM.relationships.artists.data;
    await Promise.all(appleMusicArtists.map(async (artist: { id: string; }) => {
        // lookup the artist ID and find the name
        const artistID = artist.id;
        const artistName = await lookupArtistName(artistID);
        if (!artistIDs[artistName]) artistIDs[artistName] = {};
        artistIDs[artistName]['AppleMusic'] = artistID;
    }));

    // Extract artist IDs from Spotify
    Spotify.artists.forEach((artist: { name: string; id: string; }) => {
        const artistName = artist.name;
        if (!artistIDs[artistName]) artistIDs[artistName] = {};
        artistIDs[artistName]['Spotify'] = artist.id;
    });

    // Extract artist IDs from Tidal
    Tidal.resource.artists.forEach((artist: { name: string; id: string; }) => {
        const artistName = artist.name;
        if (!artistIDs[artistName]) artistIDs[artistName] = {};
        artistIDs[artistName]['Tidal'] = artist.id;
    });

    // Get Colors
    const artwork = AM.attributes.artwork;
    const colors: { [key: string]: string } = {};

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