'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Music, Share2, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Icons from '@icons-pack/react-simple-icons';
import { getPlatformDisplayName } from '@/lib/utils/platform-config';

interface ArtistShowcaseProps {
  title: string;
  description: string;
  backgroundImage: string;
  artistImage: string;
  artistName: string;
  artistBio: string;
  artistDomain: string;
  artistLinks: Array<{
    name: string;
    url: string;
    icon: string;
    color: string;
  }>;
  ctaText: string;
  ctaHref: string;
}

export default function ArtistShowcase({
  title = "Custom Artist Pages That Work Everywhere",
  description = "Artists get beautiful, customizable pages with their own branding and direct links to their music across all streaming platforms. Powered by the same technology that makes our cross-platform search work seamlessly.",
  backgroundImage = "https://images.unsplash.com/photo-1614149162883-504ce46d75a4?q=80",
  artistImage = "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80",
  artistName = "Artist Name",
  artistBio = "Electronic music producer and DJ based in Los Angeles. New album \"Neon Dreams\" out now on all platforms.",
  artistDomain = "artist.soniic.com",
  artistLinks = [
    { name: "Spotify", url: "#", icon: "SiSpotify", color: "#1DB954" },
    { name: "Apple Music", url: "#", icon: "SiApplemusic", color: "#FA324A" },
    { name: "Latest Album", url: "#", icon: "SiYoutube", color: "#FF0000" },
    { name: "Instagram", url: "#", icon: "SiInstagram", color: "#E1306C" }
  ],
  ctaText = "Create Your Artist Page",
  ctaHref = "/search"
}: Partial<ArtistShowcaseProps>) {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          {/* Left side - Exact Artist Page Layout */}
          <div className="md:w-1/2 relative transform scale-90 md:scale-75 lg:scale-85">
            <div className="min-h-[500px] flex items-center justify-center relative" style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black/50" />
              <div className="w-full min-h-[500px] bg-black/10 backdrop-blur-3xl border-none text-white relative z-10">
                <div className="container mx-auto max-w-lg px-2 py-8 flex flex-col items-center">
                  <div className="flex flex-col items-center space-y-6 w-full">
                    <div>
                      <Image
                        src={artistImage}
                        alt={artistName}
                        width={200}
                        height={200}
                        className="rounded-full shadow-lg"
                      />
                    </div>

                    <h1 className="text-3xl font-bold">{artistName}</h1>

                    <p className="text-center text-lg px-3">
                      {artistBio}
                    </p>
                  </div>

                  {/* Artist Links - In exact style from your components */}
                  <section className="w-full mt-8 space-y-4 px-2">
                    {artistLinks.map((link, idx) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const Icon = (Icons as any)[link.icon];
                      
                      return (
                        <Button
                          key={idx}
                          className="w-full flex items-center justify-start gap-2 h-12 px-4"
                          style={{ backgroundColor: link.color }}
                        >
                          {Icon ? (
                            <Icon className="w-5 h-5" />
                          ) : (
                            <Music size={20} />
                          )}
                          <span>{getPlatformDisplayName(link.name)}</span>
                        </Button>
                      );
                    })}
                  </section>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Text */}
          <div className="md:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-gray-300 mb-6">
              {description}
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg mt-1">
                  <Globe className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Custom Domains</h3>
                  <p className="text-sm text-gray-400">Get your own branded URL that fans can easily remember</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg mt-1">
                  <Palette className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Complete Customization</h3>
                  <p className="text-sm text-gray-400">Personalize colors, images, and link styles to match your brand</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white px-8"
              >
                <Link href={ctaHref}>
                  {ctaText}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
