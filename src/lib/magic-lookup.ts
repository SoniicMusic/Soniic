import { AppleMusiclookupISRC, AppleMusiclookupUPC, lookupArtistName } from './lookup/applemusic';
import { SpotifylookupISRC, SpotifylookupUPC } from './lookup/spotify';
import { TidalLookupISRC, TidalLookupUPC } from './lookup/tidal';
import { ArtistMapper } from './artist-mapper';

// Define type definitions
export interface TrackLinks {
    AppleMusic?: string;
    Spotify?: string;
    Tidal?: string;
}

export interface LookupISRCResult {
    TrackName: string | null;
    ISRC: string | null;
    Duration: number | null;
    AlbumName: string | null;
    genreNames: string[] | null;
    ReleaseDate: string | null;
    PreviewAudio: string | null;
    BackgroundImage: string | null;
    Colors: { [key: string]: string };
    ArtistLinks: { [key: string]: any };
    TrackLinks: TrackLinks;
}

export interface UPCLinks {
    AppleMusic?: string;
    Spotify?: string;
    Tidal?: string;
}

export interface LookupUPCResult {
    UPC: string | null;  // Added UPC field
    AlbumName: string | null;
    genreNames: string[] | null;
    ReleaseDate: string | null;
    PreviewAudio: string | null;
    BackgroundImage: string | null;
    Colors: { [key: string]: string };
    ArtistIDs: { [artistName: string]: { [platform: string]: string } };
    Links: UPCLinks;
}

async function lookupISRC(ISRC: string, CountryCode: string): Promise<LookupISRCResult> {
    const [AM, Spotify, Tidal] = await Promise.all([
        AppleMusiclookupISRC(ISRC, CountryCode),
        SpotifylookupISRC(ISRC),
        TidalLookupISRC(ISRC, CountryCode),
    ]);

    const mapper = new ArtistMapper();
    console.log('Lookup ISRC:', Tidal.artists);

    // Process Apple Music artists
    await Promise.all(AM.relationships.artists.data.map(async (artist: { id: string; }) => {
        const artistName = await lookupArtistName(artist.id);
        mapper.addArtist(artistName, 'AppleMusic', 'https://music.apple.com/artist/' + artist.id);
    }));

    // Process Spotify artists if available
    if (Spotify && Spotify.artists) {
        Spotify.artists.forEach((artist: { name: string; id: string; }) => {
            mapper.addArtist(artist.name, 'Spotify', 'https://open.spotify.com/artist/' + artist.id);
        });
    }

    // Process Tidal artists - updated to handle new structure
    if (Tidal.artists && Tidal.artists.length > 0) {
        Tidal.artists.forEach((artist) => {
            mapper.addArtist(artist.name, 'Tidal', 'https://tidal.com/browse/artist/' + artist.id);
        });
    } else if (Tidal.included) {
        // Fallback to old structure if needed
        Tidal.included.artists?.forEach((artist: { name: string; id: string; }) => {
            mapper.addArtist(artist.name, 'Tidal', 'https://tidal.com/browse/artist/' + artist.id);
        });
    }

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
        ArtistLinks: artistIDs,
        TrackLinks: {
            AppleMusic: AM ? 'https://music.apple.com/song/' + AM.id : undefined,
            Spotify: Spotify ? 'https://open.spotify.com/track/' + Spotify.id : undefined,
            Tidal: Tidal ? 'https://tidal.com/browse/track/' + Tidal.id : undefined,
        },
    };
}

async function lookupUPC(UPC: string, CountryCode: string): Promise<LookupUPCResult> {
    const [AM, Spotify, Tidal] = await Promise.all([
        AppleMusiclookupUPC(UPC, CountryCode),
        SpotifylookupUPC(UPC),
        TidalLookupUPC(UPC, CountryCode),
    ]);
    const artistIDs: { [key: string]: { [key: string]: string } } = {};

    // Extracting Apple Music artist IDs
    const appleMusicArtists = AM.relationships.artists.data;
    await Promise.all(appleMusicArtists.map(async (artist: { id: string; }) => {
        const artistID = artist.id;
        const artistName = await lookupArtistName(artistID);
        if (!artistIDs[artistName]) artistIDs[artistName] = {};
        artistIDs[artistName]['AppleMusic'] = artistID;
    }));

    // Extract artist IDs from Spotify if available
    if (Spotify && Spotify.artists) {
        Spotify.artists.forEach((artist: { name: string; id: string; }) => {
            const artistName = artist.name;
            if (!artistIDs[artistName]) artistIDs[artistName] = {};
            artistIDs[artistName]['Spotify'] = artist.id;
        });
    }

    // Extract artist IDs from Tidal with improved handling
    if (Tidal.artists && Tidal.artists.length > 0) {
        // Use the new artists array structure
        Tidal.artists.forEach((artist) => {
            const artistName = artist.name;
            if (!artistIDs[artistName]) artistIDs[artistName] = {};
            artistIDs[artistName]['Tidal'] = artist.id;
        });
    } else if (Tidal.included && Tidal.included.artists) {
        // Fallback to old structure if needed
        Tidal.included.artists.forEach((artist: { name: string; id: string; }) => {
            const artistName = artist.name;
            if (!artistIDs[artistName]) artistIDs[artistName] = {};
            artistIDs[artistName]['Tidal'] = artist.id;
        });
    }

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
        UPC: UPC,  // Add the UPC to the result
        AlbumName: AM ? AM.attributes.name : null,
        genreNames: AM ? AM.attributes.genreNames : null,
        ReleaseDate: AM ? AM.attributes.releaseDate : null,
        PreviewAudio: AM && AM.relationships.tracks?.data?.[0]?.attributes?.previews?.[0]?.url || null,
        BackgroundImage: AM ? AM.attributes.artwork.url : null,
        Colors: colors,
        ArtistIDs: artistIDs,
        Links: {
            AppleMusic: AM ? 'https://music.apple.com/album/' + AM.id : undefined,
            Spotify: Spotify ? 'https://open.spotify.com/album/' + Spotify.id : undefined,
            Tidal: Tidal ? 'https://tidal.com/browse/album/' + Tidal.id : undefined,
        },
    };
}

export {
    lookupISRC,
    lookupUPC,
};