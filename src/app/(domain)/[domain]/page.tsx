/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { getArtist, getArtistLinks } from '@/lib/get-artist';
import * as motion from '@/lib/motion';
import Links from '@/components/links';


async function ArtistCard(props: { artistData: any }) {
  const artistData = props.artistData.artist
  const artistLinks = props.artistData.links
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

      className="h-dvh flex items-center justify-center relative"
      style={{
        backgroundImage: artistData.background_image ? `url(${artistData.background_image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />
      <Card className="w-screen h-dvh bg-black/10 backdrop-blur-3xl border-none text-white relative z-10">
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
                src={artistData.avatar || '/default-avatar.png'}
                alt={artistData.name || 'Artist'}
                width={200}
                height={200}
                className="rounded-full shadow-lg"
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
              {artistData.name}
            </motion.h1>

            {
              artistData.bio &&
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
                {artistData.bio}
              </motion.p>
            }
          </motion.div>

          <Links artistLinks={artistLinks} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default async function Page() {
  const artistData = await getArtistLinks();
  if (!artistData) return (
    <div className="h-dvh flex items-center justify-center bg-black text-white">
      <p>Artist not found</p>
    </div>
  );
  return (
    <ArtistCard artistData={artistData} />
  );
}

export async function generateMetadata() {
  const artist = await getArtist()
  if (artist) {
    return {
      title: `${artist.name} - Official Artist Page`,
      description: artist.bio || 'Official artist page for ' + artist.name + ' on Soniic',
      icons: {
        icon: artist.background_image,
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
