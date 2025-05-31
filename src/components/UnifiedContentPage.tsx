/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { getTrackLinks, getTrackBySlug, getAlbumLinks, getAlbumBySlug } from '@/lib/get-artist';
import { getTrackArtistsWithDomains, getAlbumArtistsWithDomains, ArtistWithDomain } from '@/lib/artist-helpers';
import * as motion from '@/lib/motion';
import Links from '@/components/links';
import ArtistLinks from '@/components/ArtistLinks';
import AudioPreview from '@/components/AudioPreview';

// Union type for content types
type ContentType = 'track' | 'album';

// Generic interfaces that work for both tracks and albums
interface BaseInfo {
  id?: string;
  name?: string | null;
  avatar?: string | null;
  bio?: string | null;
  background_image?: string | null;
}

interface TrackInfo extends BaseInfo {
  track: {
    isrc: string;
    title: string | null;
    album_upc: string;
    slug: string | null;
    preview_url: string | null;
  };
  album?: {
    upc: string;
    title: string | null;
    cover_art: string | null;
    slug: string | null;
  } | null;
}

interface AlbumInfo extends BaseInfo {
  album: {
    upc: string;
    title: string | null;
    release_date: string | null;
    genre: string | null;
    slug: string | null;
    cover_art: string | null;
  };
}

interface BaseLink {
  id: string;
  name: string | null;
  url: string | null;
  icon: string | null;
  color: string | null;
}

interface TrackLink extends BaseLink {
  track_isrc: string | null;
}

interface AlbumLink extends BaseLink {
  album_upc: string | null;
}

// Data structures for each content type
interface TrackData {
  info: TrackInfo;
  links: TrackLink[];
  artists?: ArtistWithDomain[];
}

interface AlbumData {
  info: AlbumInfo;
  links: AlbumLink[];
  artists?: ArtistWithDomain[];
}

// Union type for data
type ContentData = TrackData | AlbumData;

// Type guards to determine content type
function isTrackData(data: ContentData): data is TrackData {
  return 'track' in data.info;
}

function isAlbumData(data: ContentData): data is AlbumData {
  return 'album' in data.info && !('track' in data.info);
}

// Helper function to get the main title
function getMainTitle(data: ContentData): string {
  if (isTrackData(data)) {
    return data.info.track.title || 'Unknown Track';
  } else {
    return data.info.album.title || 'Unknown Album';
  }
}

// Helper function to get the cover art
function getCoverArt(data: ContentData): string | null {
  if (isTrackData(data)) {
    return data.info.album?.cover_art || null;
  } else {
    return data.info.album.cover_art || null;
  }
}

// Helper function to get the subtitle (for albums, this could be artist name or other info)
function getSubtitle(data: ContentData): string | null {
  // No longer showing album title as subtitle for tracks
  return null;
}

async function UnifiedContentCard(props: { data: ContentData; contentType: ContentType }) {
  const { data, contentType } = props;
  const title = getMainTitle(data);
  const coverArt = getCoverArt(data);
  const subtitle = getSubtitle(data);

  // Fetch artists for subtitle
  let artists: ArtistWithDomain[] = [];
  if (isTrackData(data)) {
    artists = await getTrackArtistsWithDomains(data.info.track.isrc);
  } else if (isAlbumData(data)) {
    artists = await getAlbumArtistsWithDomains(data.info.album.upc);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          duration: 1.5,
          delay: 0.5
        }
      }}
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: coverArt ? `url(${coverArt})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />
      <Card className="w-screen min-h-screen bg-black/10 backdrop-blur-3xl border-none text-white relative z-10">
        <CardContent className="container mx-auto max-w-lg px-2 py-8 flex flex-col items-center">
          <motion.div 
            className="flex flex-col items-center space-y-4 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                duration: 1.5,
                delay: 0.5
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0, 
                y: 10,
                filter: 'blur(5px)'
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: {
                  duration: 1.5,
                  delay: 0.5
                }
              }}
              className="relative"
            >
              <Image
                src={coverArt || '/default-avatar.png'}
                alt={title}
                width={300}
                height={300}
                className={`shadow-lg ${contentType === 'album' ? 'rounded-md' : 'rounded-md'}`}
              />
              
              {/* Audio Preview for tracks */}
              {contentType === 'track' && isTrackData(data) && data.info.track.preview_url && (
                <AudioPreview 
                  src={data.info.track.preview_url} 
                  title={title}
                  variant="circular-overlay"
                />
              )}
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0, 
                y: 10,
                filter: 'blur(5px)'
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: {
                  duration: 1.5,
                  delay: 0.5
                }
              }}
              className="text-3xl font-bold text-center"
            >
              {title}
            </motion.h1>

            {/* Display clickable artist links */}
            <ArtistLinks artists={artists} />

            {/* Show original subtitle for tracks (album name) */}
            {subtitle && (
              <motion.p
                className="text-center text-lg px-3"
                initial={{ 
                  opacity: 0, 
                  y: 10, 
                  filter: 'blur(5px)' 
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: {
                    duration: 1.5,
                    delay: 0.5
                  }
                }}
              >
                {subtitle}
              </motion.p>
            )}

            {/* Show bio if available and relevant */}
            {data.info.bio && (
              <motion.p
                className="text-center text-lg px-3"
                initial={{ 
                  opacity: 0, 
                  y: 10, 
                  filter: 'blur(5px)' 
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: {
                    duration: 1.5,
                    delay: 0.5
                  }
                }}
              >
                {data.info.bio}
              </motion.p>
            )}
          </motion.div>

          <Links links={data.links} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default async function UnifiedPage({ 
  params, 
  contentType 
}: { 
  params: Promise<{ domain: string; slug: string }>; 
  contentType: ContentType;
}) {
  const { domain, slug } = await params;
  
  let data: ContentData | null = null;
  
  if (contentType === 'track') {
    data = await getTrackLinks(slug);
  } else {
    data = await getAlbumLinks(slug);
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>{contentType === 'track' ? 'Track' : 'Album'} not found</p>
      </div>
    );
  }

  return <UnifiedContentCard data={data} contentType={contentType} />;
}

export async function generateUnifiedMetadata({ 
  params, 
  contentType 
}: { 
  params: Promise<{ domain: string; slug: string }>; 
  contentType: ContentType;
}) {
  const { domain, slug } = await params;

  if (contentType === 'track') {
    const track = await getTrackBySlug(slug);
    if (track) {
      return {
        title: `${track.title} - Track Page`,
        description: `Listen to ${track.title} on Soniic`,
        icons: {
          icon: track.album?.cover_art || 'soniic.ico',
        },
      };
    }
  } else {
    const album = await getAlbumBySlug(slug);
    if (album) {
      return {
        title: `${album.title} - Album Page`,
        description: `Listen to ${album.title} on Soniic`,
        icons: {
          icon: album.cover_art || 'soniic.ico',
        },
      };
    }
  }

  return {
    title: 'Soniic',
    description: 'Be Heard',
    icons: {
      icon: 'soniic.ico',
    },
  };
}
