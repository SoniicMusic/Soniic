// Platform-specific utilities for colors, orders, etc.

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    'AppleMusic': '#fb233b',
    'Spotify': '#1DB954',
    'Tidal': '#000000',
    'YouTube': '#FF0000',
    'SoundCloud': '#FF3300',
    'Amazon Music': '#FF9900',
    'Deezer': '#FEAA2D',
    'Pandora': '#005483',
    'Instagram': '#E1306C',
    'Twitter': '#1DA1F2',
    'Facebook': '#1877F2',
    'TikTok': '#000000',
    // Add more platforms as needed
  };
  
  return colors[platform] || '#000000';
}

export function getPlatformOrder(platform: string): number {
  const order: Record<string, number> = {
    'AppleMusic': 1,
    'Spotify': 2,
    'Tidal': 3,
    'YouTube': 4,
    'SoundCloud': 5,
    'Amazon Music': 6,
    'Deezer': 7,
    'Pandora': 8,
    'Instagram': 20,
    'Twitter': 21,
    'Facebook': 22,
    'TikTok': 23,
    // Add more platforms as needed
  };
  
  return order[platform] || 99;
}

/**
 * Maps platform internal keys to display names
 */
export function getPlatformDisplayName(platform: string): string {
  const displayNames: Record<string, string> = {
    'AppleMusic': 'Apple Music',
    'Spotify': 'Spotify',
    'Tidal': 'Tidal',
    'YouTube': 'YouTube',
    'SoundCloud': 'SoundCloud',
    'Amazon Music': 'Amazon Music',
    'Deezer': 'Deezer',
    'Pandora': 'Pandora',
    'Instagram': 'Instagram',
    'Twitter': 'Twitter',
    'Facebook': 'Facebook',
    'TikTok': 'TikTok',
    // Add more platforms as needed
  };
  
  return displayNames[platform] || platform;
}

/**
 * Maps platform names to Simple Icons naming scheme (SiPlatformName)
 */
export function getPlatformIcon(platform: string): string {
  const iconMap: Record<string, string> = {
    'AppleMusic': 'SiApplemusic',
    'Spotify': 'SiSpotify', 
    'Tidal': 'SiTidal',
    'YouTube': 'SiYoutube',
    'SoundCloud': 'SiSoundcloud',
    'Amazon Music': 'SiAmazonmusic',
    'Deezer': 'SiDeezer',
    'Pandora': 'SiPandora',
    'Instagram': 'SiInstagram',
    'Twitter': 'SiTwitter',
    'Facebook': 'SiFacebook',
    'TikTok': 'SiTiktok',
    // Add more platforms as needed
  };
  
  return iconMap[platform] || 'SiMusicbrainz'; // fallback to generic music icon
}
