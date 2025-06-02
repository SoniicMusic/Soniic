'use server'
import * as fs from 'node:fs';

// Type definitions
interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

interface SpotifyArtist {
    id: string;
    name: string;
}

// Add detailed Spotify artist interface for artist profile lookups
interface SpotifyArtistProfile {
    id: string;
    name: string;
    images: SpotifyImage[];
    external_urls: {
        spotify: string;
    };
}

interface SpotifyArtistProfileResponse {
    id: string;
    name: string;
    images: SpotifyImage[];
    external_urls: {
        spotify: string;
    };
}

interface SpotifyTrack {
    id: string;
    name: string;
    explicit: boolean;
    external_urls: {
        spotify: string;
    };
    external_ids: {
        isrc: string;
    };
    album: {
        images: SpotifyImage[];
        id: string;
    };
    artists: SpotifyArtist[];
}

interface SpotifyAlbum {
    id: string;
    name: string;
    external_urls: {
        spotify: string;
    };
    external_ids: {
        upc: string;
    };
    images: SpotifyImage[];
    artists: SpotifyArtist[];
    release_date: string;
}

interface SpotifyTrackResponse {
    tracks: {
        items: SpotifyTrack[];
    };
}

interface SpotifyAlbumResponse {
    albums: {
        items: SpotifyAlbum[];
    };
}

interface SpotifySearchResult {
    tracks: {
        id: string;
        title: string;
        artists: string[];
        coverUrl: string;
        type: 'track';
        explicit: boolean;
    }[];
    albums: {
        id: string;
        title: string;
        artists: string[];
        coverUrl: string;
        type: 'album';
        releaseDate: string;
    }[];
}

interface SpotifyTokenResponse {
    access_token: string;
}

async function SpotifylookupISRC(ISRC: string): Promise<SpotifyTrack | null> {
    try {
        console.log('Spotify lookup');
        const token = await getToken();
        const url = `https://api.spotify.com/v1/search?q=isrc:${ISRC}&type=track`;
        const headers = {
            Authorization: 'Bearer ' + token,
        };
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json() as SpotifyTrackResponse;
        
        // If no tracks found, return null
        if (!data.tracks.items || data.tracks.items.length === 0) {
            return null;
        }
        
        // Prioritize explicit versions over clean versions
        const explicitTrack = data.tracks.items.find(track => track.explicit === true);
        if (explicitTrack) {
            console.log('Found explicit version, using that instead of clean version');
            return explicitTrack;
        }
        
        // If no explicit version found, return the first result (likely clean)
        console.log('No explicit version found, using first result');
        return data.tracks.items[0];
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

async function SpotifylookupUPC(UPC: string): Promise<SpotifyAlbum | null> {
    try {
        console.log('Spotify lookup');
        const token = await getToken();
        const url = `https://api.spotify.com/v1/search?q=upc:${UPC}&type=album`;
        const headers = {
            Authorization: 'Bearer ' + token,
        };
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json() as SpotifyAlbumResponse;
        return data.albums.items[0];
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

async function SpotifyGetLink(ISRC: string): Promise<string | null> {
    const data = await SpotifylookupISRC(ISRC);
    if (!data) return null;
    return data.external_urls.spotify;
}

async function getISRCSpotify(id: string): Promise<string> {
	const token = await getToken();
	const url = `https://api.spotify.com/v1/tracks/${id}`;
	const headers = {
		Authorization: 'Bearer ' + token,
	};
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.statusText}`);
	}
	const data = await response.json() as SpotifyTrack;
	return data.external_ids.isrc;
}

async function createToken(): Promise<string> {
	const client_id = process.env.SPOTIFY_CLIENT_ID as string;
	const client_secret = process.env.SPOTIFY_CLIENT_SECRET as string;
	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		body: new URLSearchParams({
			'grant_type': 'client_credentials',
		}),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
		},
	});

	const data = await response.json() as SpotifyTokenResponse;
	fs.writeFileSync('./keys/SpotifyKey', data.access_token);
	return data.access_token;
}

async function getToken(): Promise<string> {
	try {
		const UserID = process.env.SPOTIFY_USER_ID;
		if (!fs.existsSync('./keys/SpotifyKey')) {
			console.log('Token not found, generating new token');
			return await createToken();
		}
		const token = fs.readFileSync('./keys/SpotifyKey', 'utf8');
		// check if the token is expired
		try {
			const response = await fetch(`https://api.spotify.com/v1/users/${UserID}`, {
				headers: {
					Authorization: 'Bearer ' + token,
				},
			});
			if (response.status === 401) {
				console.log('Token has expired, generating new token');
				await createToken();
				return getToken();
			}
			else {
				console.log('Token is still valid');
				return token;
			}
		}
		catch (error) {
			console.error(error);
			throw error;
		}
	}
	catch (error) {
		console.error(error);
		throw error;
	}
}

async function searchSpotify(query: string): Promise<SpotifySearchResult> {
	const token = await getToken();
	
	const url = `https://api.spotify.com/v1/search?` + new URLSearchParams({
		q: query,
		type: 'track,album',
		limit: '10',
	}).toString();

	const headers = {
		Authorization: 'Bearer ' + token,
	};
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.statusText}`);
	}
	const data = await response.json() as {
        tracks: { items: SpotifyTrack[] },
        albums: { items: SpotifyAlbum[] }
    };

  // Helper function to check if an artist should be filtered out
  const shouldFilterArtist = (artistName: string) => {
    const name = artistName.toLowerCase();
    return name.includes('various artists') || 
           name === 'various' || 
           name.startsWith('unknown artist');
  };

  // Extract tracks - filter out various artists
  const tracks = data.tracks.items
    .filter(track => !track.artists.some(artist => shouldFilterArtist(artist.name)))
    .map(track => ({
      id: track.id,
      title: track.name,
      artists: track.artists.map(artist => artist.name),
      coverUrl: track.album.images[1]?.url || track.album.images[0]?.url,
      type: 'track' as const,
      explicit: track.explicit
    }));

  // Extract albums - filter out various artists
  const albums = data.albums.items
    .filter(album => !album.artists.some(artist => shouldFilterArtist(artist.name)))
    .map(album => ({
      id: album.id,
      title: album.name,
      artists: album.artists.map(artist => artist.name),
      coverUrl: album.images[1]?.url || album.images[0]?.url,
      type: 'album' as const,
      releaseDate: album.release_date
    }));

  return {
    tracks,
    albums
  };
}
async function getSpotifyUPCTrack(id: string): Promise<string> {
    const token = await getToken();
    const url = `https://api.spotify.com/v1/tracks/${id}`;
    const headers = {
        Authorization: 'Bearer ' + token,
    };
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.statusText}`);
    }
    const data = await response.json() as SpotifyTrack;
    const albumId = data.album.id;
    const upc = await getSpotifyUPCAlbum(albumId);
    return upc;
}
async function getSpotifyUPCAlbum(id: string): Promise<string> {
	const token = await getToken();
	const url = `https://api.spotify.com/v1/albums/${id}`;
	const headers =	{
		Authorization: 'Bearer ' + token,
	};
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.statusText}`);
	}
	const data = await response.json() as SpotifyAlbum;
	return data.external_ids.upc;
}

async function getSpotifyISRC(id: string): Promise<string> {
	const token = await getToken();
	const url = `https://api.spotify.com/v1/tracks/${id}`;
	const headers = {
		Authorization: 'Bearer ' + token,
	};
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.statusText}`);
	}
	const data = await response.json() as SpotifyTrack;
	return data.external_ids.isrc;
}

async function lookupSpotifyArtistProfileImage(artistID: string): Promise<string> {
	const token = await getToken();
	const url = `https://api.spotify.com/v1/artists/${artistID}`;
	const headers = {
		Authorization: 'Bearer ' + token,
	};
	
	try {
		const response = await fetch(url, { headers });
		if (!response.ok) {
			console.warn(`Spotify API error! status: ${response.status}`);
			return ''; // Return empty string instead of throwing error
		}
		
		const data = await response.json() as SpotifyArtistProfileResponse;
		
		// Check if data exists and has images
		if (!data.images || data.images.length === 0) {
			console.warn(`No artist images found for Spotify ID: ${artistID}`);
			return '';
		}
		
		// Get the highest quality image (usually the first one or the largest)
		const bestImage = data.images.find(img => img.height >= 300) || data.images[0];
		return bestImage.url;
	} catch (error) {
		console.error(`Error looking up Spotify artist image: ${error}`);
		return '';
	}
}

export {
	SpotifylookupISRC,
	SpotifylookupUPC,
	SpotifyGetLink,
	getISRCSpotify,
	getToken,
	searchSpotify,
	getSpotifyUPCAlbum,
    getSpotifyUPCTrack,
	getSpotifyISRC,
	lookupSpotifyArtistProfileImage,
};