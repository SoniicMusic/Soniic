'use server';
import jwt from 'jsonwebtoken';
import fs from 'fs';
async function TidalLookupISRC(ISRC, CountryCode) {
    console.log('Tidal lookup');
    const token = await getToken();
    const url = 'https://openapi.tidal.com/v2/tracks?';
    const params = new URLSearchParams({
        'filter[isrc]': ISRC,
        'countryCode': CountryCode,
        'include': 'artists',
    });
    const headers = {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/vnd.tidal.v1+json',
        'Accept': 'application/vnd.tidal.v1+json',
    };
    const response = await fetch(url + params, { method: 'GET', headers: headers });
    const data = await response.json();
    const track = data.data[0];

    // enrich track with artist info from the included array if available
    if (data.included && track && track.relationships?.artists?.data?.length) {
        const artistId = track.relationships.artists.data[0].id;
        // find the matching artist in the included array
        const artistDetail = data.included.find(
            item => item.type === 'artists' && item.id === artistId
        );
        if (artistDetail) {
            // Wrap artist data in an array for consistency
            track.artists = [
                {
                    id: artistDetail.id,
                    name: artistDetail.attributes.name,
                }
            ];
        }
    }

    // remove relationships data
    if (track.relationships) {
        delete track.relationships;
    }
    return track;
}
async function TidalLookupUPC(UPC, CountryCode) {
	CountryCode = CountryCode || 'US';
	console.log('Tidal lookup');
	const token = await getToken();
	const url = 'https://openapi.tidal.com/albums/byBarcodeId?';
	const params = new URLSearchParams({
		'barcodeId': UPC,
		'countryCode': CountryCode,
	});
	const headers = {
		'Authorization': 'Bearer ' + token,
		'Content-Type': 'application/vnd.tidal.v1+json',
		'Accept': 'application/vnd.tidal.v1+json',
	};
	const response = await fetch(url + params, { method: 'GET', headers: headers });
	const data = await response.json();
	return data.data[0];
}

async function TidalGetLink(ISRC, CountryCode) {
	data = await TidalLookupISRC(ISRC, CountryCode);
	// strip the link from the response
	const link = data.resource.tidalUrl;
	// return a link with a placeholder for the country code
	return link;
}

async function createToken() {
	const client_id = process.env.TIDAL_CLIENT_ID;
	const client_secret = process.env.TIDAL_CLIENT_SECRET;
	const response = await fetch('https://auth.tidal.com/v1/oauth2/token', {
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
	fs.writeFileSync('./keys/TidalKey', data.access_token);
	return data.access_token;
}
async function getToken() {
	if (!fs.existsSync('./keys/TidalKey')) {
		console.log('Token not found, generating new token');
		await createToken();
	}
	const token = fs.readFileSync('./keys/TidalKey', 'utf8');
	const decoded = jwt.decode(token, { complete: true });
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