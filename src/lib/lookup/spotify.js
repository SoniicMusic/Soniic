'use server'
import * as fs from 'node:fs';
async function SpotifylookupISRC(ISRC) {
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
        const data = await response.json();
        return data.tracks.items[0];
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

async function SpotifylookupUPC(UPC) {
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
        const data = await response.json();
        return data.albums.items[0];
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

async function SpotifyGetLink(ISRC) {
    const data = await SpotifylookupISRC(ISRC);
    if (!data) return null;
    return data.external_urls.spotify;
}

async function getISRCSpotify(id) {
	const token = await getToken();
	const url = `https://api.spotify.com/v1/tracks/${id}`;
	const headers = {
		Authorization: 'Bearer ' + token,
	};
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.statusText}`);
	}
	const data = await response.json();
	return data.external_ids.isrc;
}
async function createToken() {
	const client_id = process.env.SPOTIFY_CLIENT_ID;
	const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
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

	const data = await response.json();
	fs.writeFileSync('./keys/SpotifyKey', data.access_token);
	return data.access_token;
}

async function getToken() {
	try {
		const UserID = process.env.SPOTIFY_USER_ID;
		if (!fs.existsSync('./keys/SpotifyKey')) {
			console.log('Token not found, generating new token');
			await createToken();
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
		}

	}
	catch (error) {
		console.error(error);
	}
}

async function searchSpotify(query) {
	const token = await getToken();
	
	const url = `https://api.spotify.com/v1/search?` + new URLSearchParams({
		q: query,
		type: 'track,album',
		limit: 10,
	}).toString();

	const headers = {
		Authorization: 'Bearer ' + token,
	};
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.statusText}`);
	}
	const data = await response.json();
// write the data to a file
  // Extract tracks
  const tracks = data.tracks.items.map(track => ({
    id: track.id,
    title: track.name,
    artists: track.artists.map(artist => artist.name),
    coverUrl: track.album.images[1]?.url || track.album.images[0]?.url,
    type: 'track'
  }));

  // Extract albums
  const albums = data.albums.items.map(album => ({
    id: album.id,
    title: album.name,
    artists: album.artists.map(artist => artist.name),
    coverUrl: album.images[1]?.url || album.images[0]?.url,
    type: 'album',
    releaseDate: album.release_date
  }));
  return {
    tracks,
    albums
  };
}
// function that accepts spotify id and type and returns either the ISRC or UPC depending on the type
async function getSpotifyUPC(id) {
	const token = await getToken();
	const url = `https://api.spotify.com/v1/album/${id}`;
	const headers =	{
		Authorization: 'Bearer ' + token,
	};
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.statusText}`);
	}
	const data = await response.json();
	return data.external_ids.upc;
}

async function getSpotifyISRC(id) {
	const token = await getToken();
	const url = `https://api.spotify.com/v1/tracks/${id}`;
	const headers = {
		Authorization: 'Bearer ' + token,
	};
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.statusText}`);
	}
	const data = await response.json();
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