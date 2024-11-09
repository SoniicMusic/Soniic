import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { getArtist, getDomain } from '@/lib/get-artist';
import { Button } from '@/components/ui/button';
import { SiX, SiFacebook, SiYoutube, SiInstagram } from '@icons-pack/react-simple-icons';

async function ArtistCard() {
  const artistData = await getArtist();
  const artistLinks = [
    { name: 'Instagram', url: `https://instagram.com/`, icon: SiInstagram },
    { name: 'Twitter', url: `https://twitter.com/`, icon: SiX },
    { name: 'Facebook', url: `https://facebook.com/`, icon: SiFacebook },
    { name: 'YouTube', url: `https://youtube.com/`, icon: SiYoutube },
  ];
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-purple-900 relative"
      style={{
        backgroundImage: artistData.background_image ? `url(${artistData.background_image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />
      
      <Card className="w-screen min-h-screen bg-black/10 backdrop-blur-3xl border-none text-white p-4 relative z-10">
        <CardContent className="p-6">
          <div className="flex flex-col items-center mb-6">
            <Image
              src={artistData.avatar || '/default-avatar.png'}
              alt={artistData.name || 'Artist'}
              width={200}
              height={200}
              className="rounded-full shadow-lg mb-4"
            />
            <h1 className="text-2xl font-bold mb-1">{artistData.name}</h1>
            {artistData.bio && <p className="text-center mb-4">{artistData.bio}</p>}
          </div>
          <div className="space-y-3 flex justify-center"> {/* Added flex and justify-center */}
            <section className="flex flex-col space-y-4 w-full md:w-2/3 lg:w-1/2 max-w-xl"> {/* Added responsive widths */}
            {artistLinks.map((link) => (
              <Button
                key={link.name}
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20"
                asChild
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between">
                  <span>{link.name}</span>
                  <link.icon size={20} />
                </a>
              </Button>
            ))}
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function Page() {
  return (
      <Suspense fallback={<p>Loading...</p>}>
        <ArtistCard />
      </Suspense>
  );
}
 
export async function generateMetadata() {
const domain = await getDomain()
const artist = await getArtist()
  if (domain) {
    return {
      title: `Welcome to the ${domain} subdomain`,
      description: 'A simple example of a domain-specific page',
      Image: artist.avatar,
      
    }
  }
  else {
  return {
    title: 'Welcome to our site',
    description: 'A simple example of a domain-specific page',
  }
}
 

};
