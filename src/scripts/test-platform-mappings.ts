#!/usr/bin/env tsx
/**
 * Test script to verify platform icon mappings work correctly
 */

import { getPlatformIcon, getPlatformColor, getPlatformDisplayName } from '../lib/utils/platform-config';

const testPlatforms = [
  'AppleMusic',
  'Spotify', 
  'Tidal',
  'YouTube',
  'SoundCloud',
  'Amazon Music',
  'Deezer',
  'Pandora',
  'Instagram',
  'Twitter',
  'Facebook',
  'TikTok',
  'Unknown Platform' // Test fallback
];

console.log('Testing platform icon mappings...\n');

testPlatforms.forEach(platform => {
  const icon = getPlatformIcon(platform);
  const color = getPlatformColor(platform);
  const displayName = getPlatformDisplayName(platform);
  console.log(`Platform: ${platform.padEnd(15)} | Display: ${displayName.padEnd(15)} | Icon: ${icon.padEnd(15)} | Color: ${color}`);
});

console.log('\n✅ All platform mappings tested!');
console.log('\nExpected Simple Icons format: SiPlatformname');
console.log('All icons should start with "Si" prefix for Simple Icons compatibility.');
