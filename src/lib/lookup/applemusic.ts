'use server';
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Type definitions
interface AppleMusicTrack {
  attributes: {
    url: string;
    artwork: {
      url: string;
    };
  };
}

interface AppleMusicArtist {
  attributes: {
    name: string;
    artwork: {
      url: string;
    };
  };
}

interface AppleMusicResponse {
  data: AppleMusicTrack[];
}

interface AppleMusicArtistResponse {
  data: AppleMusicArtist[];
}

async function AppleMusiclookupISRC(ISRC: string, CountryCode: string): Promise<AppleMusicTrack> {
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
	const data = await response.json() as AppleMusicResponse;
	return data.data[0];
}

async function AppleMusiclookupUPC(UPC: string, CountryCode: string): Promise<AppleMusicTrack> {
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
	const data = await response.json() as AppleMusicResponse;
	return data.data[0];
}

// generate a new JWT
async function generateJWT(): Promise<void> {
	const keyID = process.env.APPLE_MUSIC_KEY_ID;
	const teamID = process.env.APPLE_MUSIC_TEAM_ID;
	// Load the private key
	const secret = fs.readFileSync(process.env.APPLE_MUSIC_KEY_PATH as string, 'utf8');
	// Sign the JWT
	const options = {
		issuer: teamID,
		// Max time specified by Apple (6 months)
		expiresIn: '182d',
		algorithm: 'ES256',
		header: {
			kid: keyID,
		},
	} as jwt.SignOptions;

	const newJWT = jwt.sign({}, secret, options);
	// write the JWT to a file
	fs.writeFileSync('./keys/AppleMusicKey', newJWT);
}

// ensure JWT isn't expired
async function getJWT(): Promise<string> {
	if (!fs.existsSync('./keys/AppleMusicKey')) {
		console.log('JWT not found, generating new JWT');
		await generateJWT();
	}
	const JWT = fs.readFileSync('./keys/AppleMusicKey', 'utf8');
	const decoded = jwt.decode(JWT, { complete: true }) as jwt.JwtPayload;
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

async function AppleMusicGetLink(ISRC: string, CountryCode: string): Promise<string> {
	const data = await AppleMusiclookupISRC(ISRC, CountryCode);
	// strip the link from the response
	const link = data.attributes.url;
	// return a link with a placeholder for the country code
	const countryLink = link.replace(CountryCode, '{countryCode}');
	return countryLink;
}

async function AppleMusicGetArtwork(ISRC: string, CountryCode: string): Promise<string> {
	const data = await AppleMusiclookupISRC(ISRC, CountryCode);
	// strip the link from the response
	const artwork = data.attributes.artwork.url;
	return artwork;
}

async function lookupArtistName(artistID: string): Promise<string> {
	const appleMusicKey = await getJWT();
	const url = `https://api.music.apple.com/v1/catalog/ca/artists/${artistID}`;
	const headers = {
		Authorization: `Bearer ${appleMusicKey}`,
	};
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json() as AppleMusicArtistResponse;
	return data.data[0].attributes.name;
}

async function lookupArtistProfileImage(artistID: string): Promise<string> {
	const appleMusicKey = await getJWT();
	const url = `https://api.music.apple.com/v1/catalog/ca/artists/${artistID}`;
	const headers = {
		Authorization: `Bearer ${appleMusicKey}`,
	};
	const response = await fetch(url, { headers });
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json() as AppleMusicArtistResponse;

	// Get the highest quality artwork URL
	const artwork = data.data[0].attributes.artwork;
	const profileImage = artwork.url.replace('{w}x{h}', '3000x3000');

	return profileImage;
}

export {
	AppleMusiclookupISRC,
	AppleMusicGetLink,
	AppleMusicGetArtwork,
	lookupArtistName,
	lookupArtistProfileImage,
	AppleMusiclookupUPC,
};
