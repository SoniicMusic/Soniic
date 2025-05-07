// Platform-specific utilities for colors, orders, etc.

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    'AppleMusic': '#fb233b',
    'Spotify': '#1DB954',
    'Tidal': '#000000',
    // Add more platforms as needed
  };
  
  return colors[platform] || '#000000';
}

export function getPlatformOrder(platform: string): number {
  const order: Record<string, number> = {
    'AppleMusic': 1,
    'Spotify': 2,
    'Tidal': 3,
    // Add more platforms as needed
  };
  
  return order[platform] || 99;
}