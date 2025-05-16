'use server';
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Type definitions for Tidal API responses
interface TidalArtist {
    id: string;
    name: string;
    attributes?: {
        name: string;
        profilePicture?: string;
    };
    type?: string;
    url?: string;
}

interface TidalTrack {
    id: string;
    attributes?: {
        // Track attributes from the API
        name?: string;
        duration?: number;
        releaseDate?: string;
        isrc?: string;
        title?: string;
        artistName?: string;
    };
    resource?: {
        tidalUrl: string;
    };
    artists?: TidalArtist[];
    included?: {
        artists?: { id: string; name: string; }[];
    };
    relationships?: {
        artists?: {
            data?: { id: string; type?: string }[];
        };
        albums?: {
            data?: { id: string; type?: string }[];
        };
    };
}

interface TidalAlbum {
    id: string;
    attributes?: {
        title?: string;
        releaseDate?: string;
        upc?: string;
        numberOfTracks?: number;
        duration?: number;
        audioQuality?: string;
        copyright?: string;
    };
    resource?: {
        tidalUrl: string;
    };
    artists?: TidalArtist[];
    included?: {
        artists?: { id: string; name: string; }[];
    };
    relationships?: {
        artists?: {
            data?: { id: string; type?: string }[];
        };
    };
}

interface TidalResponse {
    data: TidalTrack[];
    included?: any[];
}

async function TidalLookupISRC(ISRC: string, CountryCode: string): Promise<TidalTrack> {
    console.log('Tidal lookup');
    const token = await getToken();
    const url = 'https://openapi.tidal.com/v2/tracks?';
    const params = new URLSearchParams({
        'countryCode': CountryCode,
        'include': 'artists',
        'filter[isrc]': ISRC,
    });
    const headers = {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.api+json',
    };
    const response = await fetch(url + params, { method: 'GET', headers: headers });
    const data = await response.json() as TidalResponse;
    console.log('Tidal response', data);
    
    if (!data.data || data.data.length === 0) {
        console.warn('No track found in Tidal for ISRC: ' + ISRC);
        // Return an empty track object instead of failing
        return {
            id: '',
            attributes: {
                isrc: ISRC,
                name: '',
                title: ''
            }
        } as TidalTrack;
    }
    
    const track = data.data[0];

    // enrich track with artist info from the included array if available
    if (data.included && track && track.relationships?.artists?.data?.length) {
        // Get all artist IDs from the relationships
        const artistIds = track.relationships.artists.data.map(artist => artist.id);
        
        // Find all matching artists in the included array
        const artistDetails = artistIds.map(artistId => 
            data.included?.find(item => item.type === 'artists' && item.id === artistId)
        ).filter(Boolean); // Remove any undefined values
        
        if (artistDetails.length > 0) {
            // Map artist details to our TidalArtist interface
            track.artists = artistDetails.map(artistDetail => ({
                id: artistDetail.id,
                name: artistDetail.attributes.name,
                type: artistDetail.type,
                attributes: {
                    name: artistDetail.attributes.name,
                    profilePicture: artistDetail.attributes.profilePicture?.uri
                }
            }));
        }
    }
    
    return track;
}

async function TidalLookupUPC(UPC: string, CountryCode: string = 'US'): Promise<TidalAlbum> {
    console.log('Tidal lookup');
    console.log('UPC', UPC);
    const token = await getToken();
    const url = 'https://openapi.tidal.com/v2/albums?';
    const params = new URLSearchParams({
        'countryCode': CountryCode,
        'filter[barcodeId]': UPC,
        'include': 'artists',
    });
    const headers = {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.api+json',
    };
    const response = await fetch(url + params, { method: 'GET', headers: headers });
    const data = await response.json() as TidalResponse;
    console.log('Tidal response', data);
    
    if (!data.data || data.data.length === 0) {
        console.warn('No album found in Tidal for UPC: ' + UPC);
        // Return an empty album object instead of throwing an error
        return {
            id: '',
            attributes: {
                title: '',
                releaseDate: '',
                upc: UPC
            }
        } as TidalAlbum;
    }
    
    const album = data.data[0] as unknown as TidalAlbum;
    
    // Enrich album with artist info from the included array if available
    if (data.included && album && album.relationships?.artists?.data?.length) {
        // Get all artist IDs from the relationships
        const artistIds = album.relationships.artists.data.map(artist => artist.id);
        
        // Find all matching artists in the included array
        const artistDetails = artistIds.map(artistId => 
            data.included?.find(item => item.type === 'artists' && item.id === artistId)
        ).filter(Boolean); // Remove any undefined values
        
        if (artistDetails.length > 0) {
            // Map artist details to our TidalArtist interface
            album.artists = artistDetails.map(artistDetail => ({
                id: artistDetail.id,
                name: artistDetail.attributes.name,
                type: artistDetail.type,
                attributes: {
                    name: artistDetail.attributes.name,
                    profilePicture: artistDetail.attributes.profilePicture?.uri
                }
            }));
        }
    }
    
    return album;
}

async function TidalGetLink(ISRC: string, CountryCode: string): Promise<string> {
    const data = await TidalLookupISRC(ISRC, CountryCode);
    // strip the link from the response
    const link = data.resource!.tidalUrl;
    // return a link with a placeholder for the country code
    return link;
}

async function createToken(): Promise<string> {
    const client_id = process.env.TIDAL_CLIENT_ID as string;
    const client_secret = process.env.TIDAL_CLIENT_SECRET as string;
    const response = await fetch('https://auth.tidal.com/v1/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            'grant_type': 'client_credentials',
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
        }
    });

    const data = await response.json() as { access_token: string };
    fs.writeFileSync('./keys/TidalKey', data.access_token);
    return data.access_token;
}

async function getToken(): Promise<string> {
    if (!fs.existsSync('./keys/TidalKey')) {
        console.log('Token not found, generating new token');
        await createToken();
    }
    const token = fs.readFileSync('./keys/TidalKey', 'utf8');
    const decoded = jwt.decode(token, { complete: true }) as jwt.JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (decoded.payload.exp < now) {
        await createToken();
        console.log('Token has expired, generating new token');
        return getToken();
    }
    else {
        console.log('Token is still valid');
        return token;
    }
}

export {
    TidalLookupISRC,
    TidalLookupUPC,
    TidalGetLink,
};