'use server';
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Type definitions
interface AppleMusicTrack {
  id: string;
  attributes?: {
    name?: string;
    isrc?: string;
    durationInMillis?: number;
    albumName?: string;
    genreNames?: string[];
    releaseDate?: string;
    previews?: { url: string }[];
    url?: string;
    artwork?: {
      url?: string;
      [key: string]: any; // For the color properties
    };
  };
  relationships: {
    artists: {
      data: { id: string }[];
    };
    tracks?: {
      data: AppleMusicTrack[];
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
		console.warn(`Apple Music API error! status: ${response.status}`);
		// Return an empty track object instead of failing
		return {
			id: '',
			attributes: {},
			relationships: {
				artists: { data: [] }
			}
		} as AppleMusicTrack;
	}
	
	const data = await response.json() as AppleMusicResponse;
	
	if (!data.data || data.data.length === 0) {
		console.warn(`No track found in Apple Music for ISRC: ${ISRC}`);
		// Return an empty track object when no results are found
		return {
			id: '',
			attributes: {},
			relationships: {
				artists: { data: [] }
			}
		} as AppleMusicTrack;
	}
	
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
		console.warn(`Apple Music API error! status: ${response.status}`);
		// Return an empty album object instead of failing
		return {
			id: '',
			attributes: {},
			relationships: {
				artists: { data: [] }
			}
		} as AppleMusicTrack;
	}
	
	const data = await response.json() as AppleMusicResponse;
	
	if (!data.data || data.data.length === 0) {
		console.warn(`No album found in Apple Music for UPC: ${UPC}`);
		// Return an empty album object when no results are found
		return {
			id: '',
			attributes: {},
			relationships: {
				artists: { data: [] }
			}
		} as AppleMusicTrack;
	}
	
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
		algorithm: 'ES256' as const,
		header: {
			kid: keyID,
			alg: 'ES256'
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
	const url = data.attributes?.url;
	if (!url) {
		console.warn(`No URL found in Apple Music response for ISRC: ${ISRC}`);
		return '';
	}
	// return a link with a placeholder for the country code
	const countryLink = url.replace(CountryCode, '{countryCode}');
	return countryLink;
}

async function AppleMusicGetArtwork(ISRC: string, CountryCode: string): Promise<string> {
	const data = await AppleMusiclookupISRC(ISRC, CountryCode);
	// strip the artwork URL from the response
	const artwork = data.attributes?.artwork?.url;
	if (!artwork) {
		console.warn(`No artwork found in Apple Music response for ISRC: ${ISRC}`);
		return '';
	}
	return artwork;
}

async function lookupArtistName(artistID: string): Promise<string> {
	const appleMusicKey = await getJWT();
	const url = `https://api.music.apple.com/v1/catalog/ca/artists/${artistID}`;
	const headers = {
		Authorization: `Bearer ${appleMusicKey}`,
	};
	try {
		const response = await fetch(url, { headers });
		if (!response.ok) {
			console.warn(`Apple Music API error! status: ${response.status}`);
			return `Unknown Artist (${artistID})`;
		}
		const data = await response.json() as AppleMusicArtistResponse;
		if (!data.data || data.data.length === 0 || !data.data[0]?.attributes?.name) {
			console.warn(`No artist data found for ID: ${artistID}`);
			return `Unknown Artist (${artistID})`;
		}
		return data.data[0].attributes.name;
	} catch (error) {
		console.error(`Error looking up artist name: ${error}`);
		return `Unknown Artist (${artistID})`;
	}
}

async function lookupArtistProfileImage(artistID: string): Promise<string> {
	const appleMusicKey = await getJWT();
	const url = `https://api.music.apple.com/v1/catalog/ca/artists/${artistID}`;
	const headers = {
		Authorization: `Bearer ${appleMusicKey}`,
	};
	try {
		const response = await fetch(url, { headers });
		if (!response.ok) {
			console.warn(`Apple Music API error! status: ${response.status}`);
			return ''; // Return empty string instead of throwing error
		}
		const data = await response.json() as AppleMusicArtistResponse;

		// Check if data exists and has proper structure
		if (!data.data || data.data.length === 0 || 
			!data.data[0]?.attributes?.artwork?.url) {
			console.warn(`No artist artwork found for ID: ${artistID}`);
			return '';
		}
		
		// Get the highest quality artwork URL
		const artwork = data.data[0].attributes.artwork;
		const profileImage = artwork.url.replace('{w}x{h}', '3000x3000');
		return profileImage;
	} catch (error) {
		console.error(`Error looking up artist image: ${error}`);
		return '';
	}
}

export {
	AppleMusiclookupISRC,
	AppleMusicGetLink,
	AppleMusicGetArtwork,
	lookupArtistName,
	lookupArtistProfileImage,
	AppleMusiclookupUPC,
};
