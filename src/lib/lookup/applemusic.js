import 'server-only';

import jwt from 'jsonwebtoken';
import fs from 'fs';

async function AppleMusiclookupISRC(ISRC, CountryCode) {
	console.log('Apple Music lookup');
	const appleMusicKey = await getJWT();
	const url = `https://api.music.apple.com/v1/catalog/${CountryCode}/songs?filter[isrc]=${ISRC}`;
	const headers = {
		Authorization: `Bearer ${appleMusicKey}`,
	};
	
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json();
	return data.data[0];
}
async function AppleMusiclookupUPC(UPC, CountryCode) {
	console.log('Apple Music lookup');
	const appleMusicKey = await getJWT();
	const url = `https://api.music.apple.com/v1/catalog/${CountryCode}/albums?filter[upc]=${UPC}`;
	const headers = {
		Authorization: `Bearer ${appleMusicKey}`,
	};
	
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json();
	return data.data[0];
}
// generate a new JWT
async function generateJWT() {
	const keyID = process.env.APPLE_MUSIC_KEY_ID;
	const teamID = process.env.APPLE_MUSIC_TEAM_ID;
	// Load the private key
	const secret = fs.readFileSync(process.env.APPLE_MUSIC_AUTH_KEY_PATH, 'utf8');
	// Sign the JWT
	const options = {
		issuer: teamID,
		// Max time specified by Apple (6 months)
		expiresIn: '182d',
		algorithm: 'ES256',
		header: {
			kid: keyID,
		},
	};

	const newJWT = jwt.sign({}, secret, options);
	// write the JWT to a file
	fs.writeFileSync('./keys/AppleMusicKey', newJWT);
}
// ensure JWT isn't expired
async function getJWT() {
	if (!fs.existsSync('./keys/AppleMusicKey')) {
		console.log('JWT not found, generating new JWT');
		await generateJWT();
	}
	const JWT = fs.readFileSync('./keys/AppleMusicKey', 'utf8');
	const decoded = jwt.decode(JWT, { complete: true });
	const now = Math.floor(Date.now() / 1000);
	if (decoded.payload.exp < now) {
		await generateJWT();
		console.log('JWT has expired, generating new JWT');
		return getJWT();
	}
	else {
		console.log('JWT is still valid');
		return JWT;
	}
}
async function AppleMusicGetLink(ISRC, CountryCode) {
	const data = await AppleMusiclookupISRC(ISRC, CountryCode);
	// strip the link from the response
	const link = data.attributes.url;
	// return a link with a placeholder for the country code
	const countryLink = link.replace(CountryCode, '{countryCode}');
	return countryLink;
}
async function AppleMusicGetArtwork(ISRC, CountryCode) {
	const data = await AppleMusiclookupISRC(ISRC, CountryCode);
	// strip the link from the response
	const artwork = data.attributes.artwork.url;
	return artwork;
}
async function lookupArtistName(artistID) {
	const appleMusicKey = await getJWT();
	const url = `https://api.music.apple.com/v1/catalog/ca/artists/${artistID}`;
	const headers = {
		Authorization: `Bearer ${appleMusicKey}`,
	};
	const { data } = await axios.get(url, { headers });
	return data.data[0].attributes.name;
}
async function lookupArtistProfileImage(artistID) {
	const appleMusicKey = await getJWT();
	const url = `https://api.music.apple.com/v1/catalog/ca/artists/${artistID}`;
	const headers = {
		Authorization: `Bearer ${appleMusicKey}`,
	};
	const { data } = await axios.get(url, { headers });

	// Get the highest quality artwork URL
	const artwork = data.data[0].attributes.artwork;
	const profileImage = artwork.url.replace('{w}x{h}', '3000x3000');

	return profileImage;
}

exports = {
	AppleMusiclookupISRC,
	AppleMusicGetLink,
	AppleMusicGetArtwork,
	lookupArtistName,
	lookupArtistProfileImage,
	AppleMusiclookupUPC,
};
