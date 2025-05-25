import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { getTrackLinks, getTrackBySlug } from '@/lib/get-artist';
import { Button } from '@/components/ui/button';
import * as Icons from '@icons-pack/react-simple-icons';
import { notFound } from 'next/navigation';

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
  const artistLinks = props.trackData.links
  return (
    <div
      className="min-h-screen flex items-center justify-center relative animate-in fade-in-0 duration-3000"
      style={{
        backgroundImage: trackData.album?.cover_art ? `url(${trackData.album?.cover_art})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />

      <Card className="w-screen min-h-screen bg-black/10 backdrop-blur-3xl border-none text-white relative z-10">
        <CardContent className="container mx-auto max-w-lg px-2 py-8 flex flex-col items-center">
          <div className="flex flex-col items-center space-y-6 w-full">
            <Image
              src={trackData.album?.cover_art || trackData.avatar || '/default-avatar.png'}
              alt={trackData.track.title || 'Track'}
              width={200}
              height={200}
              className=" shadow-lg"
            />
            <h1 className="text-3xl font-bold">{trackData.track.title}</h1>
            {trackData.bio && <p className="text-center text-lg px-3">{trackData.bio}</p>}
          </div>
          <section className="w-full mt-8 space-y-4 px-2">
            {artistLinks.map((link: TrackLink, index: number) => {
              const IconComponent = link.icon && link.icon in Icons 
                ? (Icons as any)[link.icon]
                : null;
              
              // Debug logging and fallback for missing icons
              if (!IconComponent && link.icon) {
                console.warn(`Icon "${link.icon}" not found for track link`);
              }
              
              return (
                <Button
                  key={`${link.id || link.url}-${index}`}
                  variant="outline"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
                  asChild
                >
                  <a href={link.url || '#'} target="_blank" rel="noopener noreferrer"
                    className="flex items-center w-full h-full px-3 py-3">
                    <div className="flex items-center">
                      {IconComponent ? (
                        <IconComponent className="mr-3 w-6 h-6" />
                      ) : (
                        <div className="mr-3 w-6 h-6 bg-white/20 rounded" />
                      )}
                      <span className="text-lg font-semibold">{link.name || link.url}</span>
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

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const trackData = await getTrackLinks(slug);
    if (!trackData) return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Track not found</p>
      </div>
    );
    return (
      <TrackCard trackData={trackData} />
    );
  } catch (error) {
    console.error('Error loading track:', error);
    notFound();
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
