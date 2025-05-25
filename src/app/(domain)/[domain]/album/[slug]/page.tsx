/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { getAlbumLinks, getAlbumBySlug } from '@/lib/get-artist';
import { Button } from '@/components/ui/button';
import * as Icons from '@icons-pack/react-simple-icons';
import { notFound } from 'next/navigation';

// Type definitions for album data
interface AlbumInfo {
  id?: string;
  name?: string | null;
  avatar?: string | null;
  bio?: string | null;
  background_image?: string | null;
  album: {
    upc: string;
    title: string | null;
    release_date: string | null;
    genre: string | null;
    slug: string | null;
    cover_art: string | null;
  };
}

interface AlbumLink {
  id: string;
  album_upc: string | null;
  name: string | null;
  url: string | null;
  icon: string | null;
  color: string | null;
}

interface AlbumData {
  info: AlbumInfo;
  links: AlbumLink[];
}

async function AlbumCard(props: { albumData: AlbumData }) {
  const albumData = props.albumData.info
  const artistLinks = props.albumData.links
  return (
    <div
      className="min-h-screen flex items-center justify-center relative animate-in fade-in-0 duration-3000"
      style={{
        backgroundImage: albumData.album.cover_art ? `url(${albumData.background_image})` : undefined,
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
              src={albumData.album.cover_art || '/default-avatar.png'}
              alt={albumData.album.title || 'Album'}
              width={200}
              height={200}
              className="rounded-full shadow-lg"
            />
            <h1 className="text-3xl font-bold">{albumData.album.title}</h1>
            {albumData.bio && <p className="text-center text-lg px-3">{albumData.bio}</p>}
          </div>
          <section className="w-full mt-8 space-y-4 px-2">
            {artistLinks.map((link: AlbumLink, index: number) => {
              const Icon = link.icon ? (Icons as any)[link.icon] : null;
              
              // Debug logging and fallback for missing icons
              if (!Icon && link.icon) {
                console.warn(`Icon "${link.icon}" not found for link "${link.name}"`);
              }
                console.log('Rendering AlbumCard with data:', props.albumData);

              return (
                <Button
                  key={`${link.id || link.name}-${index}`}
                  variant="outline"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
                  asChild
                >
                  <a href={link.url || '#'} target="_blank" rel="noopener noreferrer"
                    className="flex items-center w-full h-full px-3 py-3">
                    <div className="flex items-center">
                      {Icon ? (
                        <Icon className="mr-3 w-6 h-6" />
                      ) : (
                        <div className="mr-3 w-6 h-6 bg-white/20 rounded" />
                      )}
                      <span className="text-lg font-semibold">{link.name}</span>
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
    const albumData = await getAlbumLinks(slug);
    if (!albumData) return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Album not found</p>
      </div>
    );
    return (
      <AlbumCard albumData={albumData} />
    );
  } catch (error) {
    console.error('Error loading album:', error);
    notFound();
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (album) {
    return {
      title: `${album.title} - Album Page`,
      description: `Listen to ${album.title} on Soniic`,
      icons: {
        icon: 'soniic.ico',
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
