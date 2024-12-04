/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
// import { getRelease, getReleaseLinks } from '@/lib/get-release';
import { Button } from '@/components/ui/button';
import * as Icons from '@icons-pack/react-simple-icons';
import { notFound } from 'next/navigation';
async function ArtistCard(props: { trackData: any }) {
  const trackData = props.trackData.info
  const artistLinks = props.trackData.links
  return (
    <div 
      className="min-h-screen flex items-center justify-center relative animate-in fade-in-0 duration-3000"
      style={{
        backgroundImage: trackData.background_image ? `url(${trackData.background_image})` : undefined,
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
              src={trackData.avatar || '/default-avatar.png'}
              alt={trackData.name || 'Artist'}
              width={200}
              height={200}
              className="rounded-full shadow-lg"
            />
            <h1 className="text-3xl font-bold">{trackData.name}</h1>
            {trackData.bio && <p className="text-center text-lg px-3">{trackData.bio}</p>}
          </div>
          <section className="w-full mt-8 space-y-4 px-2"> {/* Increased spacing between buttons */}
            {artistLinks.map((link: any) => {
              const Icon = (Icons as any)[link.icon];
              return (
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
              );
            })}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function Page() {
  try {
  const trackData = await getReleaseLinks();
  if (!trackData) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>Artist not found</p>
    </div>
  );
  return (
        <ArtistCard trackData={trackData} />
  );
} catch {
  notFound();
}
}

export async function generateMetadata() {
  
const artist = await getRelease()
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
