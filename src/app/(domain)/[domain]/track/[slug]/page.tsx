/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { getTrackLinks, getTrackBySlug, findCorrectDomainForTrack } from '@/lib/get-artist';
import * as motion from '@/lib/motion';
import Links from '@/components/links';
// Type definitions for track data
interface TrackInfo {
  id?: string;
  name?: string | null;
  avatar?: string | null;
  bio?: string | null;
  background_image?: string | null;
  track: {
    isrc: string;
    title: string | null;
    album_upc: string;
    slug: string | null;
  };
  album?: {
    upc: string;
    title: string | null;
    cover_art: string | null;
    slug: string | null;
  } | null;
}

interface TrackLink {
  id: string;
  track_isrc: string | null;
  name: string | null;
  url: string | null;
  icon: string | null;
  color: string | null;
}

interface TrackData {
  info: TrackInfo;
  links: TrackLink[];
}

async function TrackCard(props: { trackData: TrackData }) {
  const trackData = props.trackData.info
  const trackLinks = props.trackData.links
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
        backgroundImage: trackData.album?.cover_art ? `url(${trackData.album?.cover_art})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />
      <Card className="w-screen min-h-screen bg-black/10 backdrop-blur-3xl border-none text-white relative z-10">
        <CardContent className="container mx-auto max-w-lg px-2 py-8 flex flex-col items-center"> {/* Changed max-w-2xl to max-w-lg and px-4 to px-2 */}
          <motion.div className="flex flex-col items-center space-y-6 w-full"
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
                opacity: 0, y: 10,
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
              <Image
                src={trackData.album?.cover_art || '/default-avatar.png'}
                alt={trackData.track.title || 'Track'}
                width={200}
                height={200}
                className="rounded-md shadow-lg"
              />
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0, y: 10,
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

              className="text-3xl font-bold">
              {trackData.track.title}
            </motion.h1>

            {
              trackData.album?.title &&
              <motion.p
                className="text-center text-lg px-3"
                initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
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
                {trackData.bio}
              </motion.p>
            }
          </motion.div>

          <Links links={trackLinks} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default async function Page({ params }: { params: Promise<{ domain: string; slug: string }> }) {
  const { domain, slug } = await params;
  const trackData = await getTrackLinks(slug);
  if (!trackData) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>Track not found</p>
    </div>
  );
  return (
    <TrackCard trackData={trackData} />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ domain: string; slug: string }> }) {
  const { domain, slug } = await params;
  const track = await getTrackBySlug(slug);

  if (track) {
    return {
      title: `${track.title} - Track Page`,
      description: `Listen to ${track.title} on Soniic`,
      icons: {
        icon: track.album?.cover_art || 'soniic.ico',
      },
    }
  }
  else {
    return {
      title: 'Soniic',
      description: 'Be Heard',
      icons: {
        icon: 'soniic.ico',
      },
    }
  }
};
