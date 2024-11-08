import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { AtSign } from "lucide-react"
import { getArtist, getDomain } from '@/lib/get-artist';
import { Button } from '@/components/ui/button';

async function ArtistCard() {
  const artistData = await getArtist();
  const artistLinks = [
    { name: 'Instagram', url: `https://instagram.com/`, icon: AtSign },
    { name: 'Twitter', url: `https://twitter.com/`, icon: AtSign },
    { name: 'Facebook', url: `https://facebook.com/`, icon: AtSign },
    { name: 'YouTube', url: `https://youtube.com/`, icon: AtSign },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-none text-white">
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
            <a
              href={`https://${artistData.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-100 transition-colors"
            >
              <AtSign className="inline mr-1" size={16} />
              {artistData.domain}
            </a>
          </div>
          <div className="space-y-3">
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
