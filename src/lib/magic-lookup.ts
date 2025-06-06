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
    // Use Promise.allSettled instead of Promise.all to handle rejections from individual platforms
    const results = await Promise.allSettled([
        AppleMusiclookupISRC(ISRC, CountryCode),
        SpotifylookupISRC(ISRC),
        TidalLookupISRC(ISRC, CountryCode),
    ]);
    
    // Extract results, using default empty values if a promise was rejected
    const AM = results[0].status === 'fulfilled' ? results[0].value : null;
    const Spotify = results[1].status === 'fulfilled' ? results[1].value : null;
    const Tidal = results[2].status === 'fulfilled' ? results[2].value : null;
    
    // Log any rejections for debugging
    if (results[0].status === 'rejected') console.warn('Apple Music lookup failed:', results[0].reason);
    if (results[1].status === 'rejected') console.warn('Spotify lookup failed:', results[1].reason);
    if (results[2].status === 'rejected') console.warn('Tidal lookup failed:', results[2].reason);

    const mapper = new ArtistMapper();
    console.log('Lookup ISRC:', Tidal?.artists);

    // Process Apple Music artists
    const appleMusicArtistData = AM?.relationships?.artists?.data || [];
    await Promise.all(appleMusicArtistData.map(async (artist: { id: string; }) => {
        if (artist?.id) {
            const artistName = await lookupArtistName(artist.id);
            if (artistName) {
                mapper.addArtist(artistName, 'AppleMusic', 'https://music.apple.com/artist/' + artist.id);
            }
        }
    }));

    // Process Spotify artists if available
    if (Spotify?.artists) {
        Spotify.artists.forEach((artist: { name: string; id: string; }) => {
            if (artist?.name && artist?.id) {
                mapper.addArtist(artist.name, 'Spotify', 'https://open.spotify.com/artist/' + artist.id);
            }
        });
    }

    // Process Tidal artists - updated to handle new structure
    if (Tidal?.artists && Tidal.artists.length > 0) {
        Tidal.artists.forEach((artist) => {
            if (artist?.name && artist?.id) {
                mapper.addArtist(artist.name, 'Tidal', 'https://tidal.com/browse/artist/' + artist.id);
            }
        });
    } else if (Tidal?.included) {
        // Fallback to old structure if needed
        Tidal.included.artists?.forEach((artist: { name: string; id: string; }) => {
            if (artist?.name && artist?.id) {
                mapper.addArtist(artist.name, 'Tidal', 'https://tidal.com/browse/artist/' + artist.id);
            }
        });
    }

    const artistIDs = mapper.getArtistGroups();

    // Get Colors
    const colors: { [key: string]: string } = {};
    const artwork = AM?.attributes?.artwork;
    
    if (artwork) {
        for (const key in artwork) {
            if (key.endsWith('Color')) {
                colors[key] = artwork[key];
            }
        }
    }
    // Get background image with Spotify fallback
    let backgroundImage = AM?.attributes?.artwork?.url || null;
    if (!backgroundImage && Spotify?.album?.images && Spotify.album.images.length > 0) {
        // Use Spotify album cover as fallback
        backgroundImage = Spotify.album.images[1]?.url || Spotify.album.images[0]?.url || null;
    }

    // Return the results
    return {
        TrackName: AM?.attributes?.name || null,
        ISRC: AM?.attributes?.isrc || null,
        Duration: AM?.attributes?.durationInMillis || null,
        AlbumName: AM?.attributes?.albumName || null,
        genreNames: AM?.attributes?.genreNames || null,
        ReleaseDate: AM?.attributes?.releaseDate || null,
        PreviewAudio: AM?.attributes?.previews?.[0]?.url || null,
        BackgroundImage: backgroundImage,
        Colors: colors,
        ArtistLinks: artistIDs,
        TrackLinks: {
            AppleMusic: AM ? 'https://music.apple.com/song/' + AM.id : undefined,
            Spotify: Spotify ? 'https://open.spotify.com/track/' + Spotify.id : undefined,
            Tidal: (Tidal && Tidal.id) ? 'https://tidal.com/browse/track/' + Tidal.id : undefined,
        },
    };
}

async function lookupUPC(UPC: string, CountryCode: string): Promise<LookupUPCResult> {
    // Use Promise.allSettled instead of Promise.all to handle rejections from individual platforms
    const results = await Promise.allSettled([
        AppleMusiclookupUPC(UPC, CountryCode),
        SpotifylookupUPC(UPC),
        TidalLookupUPC(UPC, CountryCode),
    ]);
    
    // Extract results, using default empty values if a promise was rejected
    const AM = results[0].status === 'fulfilled' ? results[0].value : null;
    const Spotify = results[1].status === 'fulfilled' ? results[1].value : null;
    const Tidal = results[2].status === 'fulfilled' ? results[2].value : null;
    
    // Log any rejections for debugging
    if (results[0].status === 'rejected') console.warn('Apple Music lookup failed:', results[0].reason);
    if (results[1].status === 'rejected') console.warn('Spotify lookup failed:', results[1].reason);
    if (results[2].status === 'rejected') console.warn('Tidal lookup failed:', results[2].reason);

    // Attempt to get album name from multiple sources
    let albumNameToUse = AM?.attributes?.name || null;
    if (!albumNameToUse && Spotify?.name) {
      console.warn('Album name missing from Apple Music, using Spotify name for UPC:', UPC);
      albumNameToUse = Spotify.name;
    }
    if (!albumNameToUse && Tidal?.attributes?.title) {
      console.warn('Album name missing from Apple Music and Spotify, using Tidal name for UPC:', UPC);
      albumNameToUse = Tidal.attributes.title;
    }
    if (!albumNameToUse) {
      // If no album name is found from any source, throw an error
      console.error('Critical: Album name missing from all sources for UPC:', UPC);
      throw new Error(`Failed to find album name for UPC: ${UPC} from any source.`);
    }

    const artistIDs: { [key: string]: { [key: string]: string } } = {};

    // Extracting Apple Music artist IDs
    const appleMusicArtists = AM?.relationships?.artists?.data || [];
    await Promise.all(appleMusicArtists.map(async (artist: { id: string; }) => {
        if (artist?.id) {
            const artistID = artist.id;
            const artistName = await lookupArtistName(artistID);
            if (artistName) {
                if (!artistIDs[artistName]) artistIDs[artistName] = {};
                artistIDs[artistName]['AppleMusic'] = artistID;
            }
        }
    }));

    // Extract artist IDs from Spotify if available
    if (Spotify?.artists) {
        Spotify.artists.forEach((artist: { name: string; id: string; }) => {
            if (artist?.name && artist?.id) {
                const artistName = artist.name;
                if (!artistIDs[artistName]) artistIDs[artistName] = {};
                artistIDs[artistName]['Spotify'] = artist.id;
            }
        });
    }

    // Extract artist IDs from Tidal with improved handling
    if (Tidal?.artists && Tidal.artists.length > 0) {
        // Use the new artists array structure
        Tidal.artists.forEach((artist) => {
            if (artist?.name && artist?.id) {
                const artistName = artist.name;
                if (!artistIDs[artistName]) artistIDs[artistName] = {};
                artistIDs[artistName]['Tidal'] = artist.id;
            }
        });
    } else if (Tidal?.included?.artists) {
        // Fallback to old structure if needed
        Tidal.included.artists.forEach((artist: { name: string; id: string; }) => {
            if (artist?.name && artist?.id) {
                const artistName = artist.name;
                if (!artistIDs[artistName]) artistIDs[artistName] = {};
                artistIDs[artistName]['Tidal'] = artist.id;
            }
        });
    }

    // Get Colors
    const colors: { [key: string]: string } = {};
    const artwork = AM?.attributes?.artwork;

    if (artwork) {
        for (const key in artwork) {
            if (key.endsWith('Color')) {
                colors[key] = artwork[key];
            }
        }
    }
    
    // Get background image with Spotify fallback
    let backgroundImage = AM?.attributes?.artwork?.url || null;
    if (!backgroundImage && Spotify?.images && Spotify.images.length > 0) {
        // Use Spotify album cover as fallback
        backgroundImage = Spotify.images[1]?.url || Spotify.images[0]?.url || null;
    }
    
    // Return the results
    return {
        UPC: UPC,  // Add the UPC to the result
        AlbumName: albumNameToUse, // Use the determined album name
        genreNames: AM?.attributes?.genreNames || null,
        ReleaseDate: AM?.attributes?.releaseDate || null,
        PreviewAudio: AM?.relationships?.tracks?.data?.[0]?.attributes?.previews?.[0]?.url || null,
        BackgroundImage: backgroundImage,
        Colors: colors,
        ArtistIDs: artistIDs,
        Links: {
            AppleMusic: AM ? 'https://music.apple.com/album/' + AM.id : undefined,
            Spotify: Spotify ? 'https://open.spotify.com/album/' + Spotify.id : undefined,
            Tidal: (Tidal && Tidal.id) ? 'https://tidal.com/browse/album/' + Tidal.id : undefined,
        },
    };
}

export {
    lookupISRC,
    lookupUPC,
};