/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { getArtist } from '@/lib/get-artist';
import { Button } from '@/components/ui/button';
import * as Icons from '@icons-pack/react-simple-icons';
async function ArtistCard(props: any) {
  const artistData = props.artistData;
  const artistLinks = [
    { name: 'Instagram', url: `https://instagram.com/`, icon: Icons.SiInstagram },
    { name: 'Twitter', url: `https://twitter.com/`, icon: Icons.SiX },
    { name: 'Facebook', url: `https://facebook.com/`, icon: Icons.SiFacebook },
    { name: 'YouTube', url: `https://youtube.com/`, icon: Icons.SiYoutube },
    { name: 'Snapchat', url: `https://snapchat.com/`, icon: Icons.SiSnapchat },
    { name: 'Threads', url: `https://threads.com/`, icon: Icons.SiThreads },
    { name: 'Spotify', url: `https://spotify.com/`, icon: Icons.SiSpotify },
    { name: 'SoundCloud', url: `https://soundcloud.com/`, icon: Icons.SiSoundcloud },
  ];
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-purple-900 relative animate-in fade-in-0 duration-3000"
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
          <div className="flex flex-col items-center space-y-6 w-full">
            <Image
              src={artistData.avatar || '/default-avatar.png'}
              alt={artistData.name || 'Artist'}
              width={200}
              height={200}
              className="rounded-full shadow-lg"
            />
            <h1 className="text-3xl font-bold">{artistData.name}</h1>
            {artistData.bio && <p className="text-center text-lg px-3">{artistData.bio}</p>}
          </div>
          <section className="w-full mt-8 space-y-4 px-2"> {/* Increased spacing between buttons */}
            {artistLinks.map((link) => (
              <Button
                key={link.name}
                variant="outline"
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
                asChild
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center w-full h-full px-3 py-3"> {/* Removed justify-center */}
                  <div className="flex items-center">
                    <link.icon className="mr-3 w-6 h-6" /> {/* Using w-6 h-6 instead of size prop */}
                    <span className="text-lg font-semibold">{link.name}</span> {/* Removed text-center */}
                  </div>
                </a>
              </Button>
            ))}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function Page() {
  const artistData = await getArtist();
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
      description: artist.bio,
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
