/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { getArtist, getArtistLinks } from '@/lib/get-artist';
import { Button } from '@/components/ui/button';
import * as Icons from '@icons-pack/react-simple-icons';
import * as motion from '@/lib/motion';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.5, // Controls delay between each child animation
      delayChildren: 0.5    // Delays the start of all children animations
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.5,
      delay: 0.5,
      staggerChildren: 0.5, // Controls delay between each child animation
    }
  }
};
async function ArtistCard(props: { artistData: any }) {
  const artistData = props.artistData.artist
  const artistLinks = props.artistData.links
  return (
    <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1,
      transition: { duration: 1.5,
        delay: 0.5
       }
     }}
    
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: artistData.background_image ? `url(${artistData.background_image})` : undefined,
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
            animate={{ opacity: 1,
              y: 0,
              transition: { duration: 1.5,
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
            <h1 className="text-3xl font-bold">{artistData.name}</h1>
            {artistData.bio && <p className="text-center text-lg px-3">{artistData.bio}</p>}
          </motion.div>
          <motion.section className="w-full mt-8 space-y-4 px-2"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          > {/* Increased spacing between buttons */}
            {artistLinks.map((link: any) => {
              const Icon = (Icons as any)[link.icon];
              return (
                <motion.div
                key={link.name}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                >
                <Button
                  key={link.name}
                  variant="outline"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center w-full h-full px-3 py-3"> {/* Removed justify-center */}
                    <div className="flex items-center">
                      <Icon className="mr-3 w-6 h-6" /> {/* Using w-6 h-6 instead of size prop */}
                      <span className="text-lg font-semibold">{link.name}</span> {/* Removed text-center */}
                    </div>
                  </a>
                </Button>
               </motion.div>
              );
            })}
          </motion.section>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default async function Page() {
  const artistData = await getArtistLinks();
  if (!artistData) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
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
