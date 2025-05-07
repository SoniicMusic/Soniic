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

interface SpotifyTrack {
    id: string;
    name: string;
    external_urls: {
        spotify: string;
    };
    external_ids: {
        isrc: string;
    };
    album: {
        images: SpotifyImage[];
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

  // Extract tracks
  const tracks = data.tracks.items.map(track => ({
    id: track.id,
    title: track.name,
    artists: track.artists.map(artist => artist.name),
    coverUrl: track.album.images[1]?.url || track.album.images[0]?.url,
    type: 'track' as const
  }));

  // Extract albums
  const albums = data.albums.items.map(album => ({
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

async function getSpotifyUPC(id: string): Promise<string> {
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

export {
	SpotifylookupISRC,
	SpotifylookupUPC,
	SpotifyGetLink,
	getISRCSpotify,
	getToken,
	searchSpotify,
	getSpotifyUPC,
	getSpotifyISRC,
};