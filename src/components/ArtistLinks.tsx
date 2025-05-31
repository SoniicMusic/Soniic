// Component for displaying clickable artist links
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArtistWithDomain } from '@/lib/artist-helpers';
import * as motion from '@/lib/motion';

interface ArtistLinksProps {
  artists: ArtistWithDomain[];
  className?: string;
}

// Helper function to generate artist URL
function getArtistUrl(subdomain: string): string {
  if (typeof window !== 'undefined') {
    // Client-side: use current hostname
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    
    if (hostname.includes('localhost')) {
      return `${protocol}//${subdomain}.localhost${port ? `:${port}` : ''}`;
    } else {
      // For production, assume .soniic.link domain structure
      return `${protocol}//${subdomain}.soniic.link`;
    }
  } else {
    // Server-side: default to localhost for development
    return `https://${subdomain}.localhost:3000`;
  }
}

interface ArtistLinksProps {
  artists: ArtistWithDomain[];
  className?: string;
}

export default function ArtistLinks({ artists, className = '' }: ArtistLinksProps) {
  if (!artists || artists.length === 0) {
    return null;
  }

  // Filter out artists without domains (can't create links for them)
  const artistsWithDomains = artists.filter(artist => artist.subdomain);

  if (artistsWithDomains.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={`flex flex-col items-center space-y-3 ${className}`}
      initial={{ 
        opacity: 0, 
        y: 10,
        filter: 'blur(5px)'
      }}
      animate={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 1.5,
          delay: 0.6
        }
      }}
    >
      <div className="flex flex-wrap justify-center gap-1">
        {artistsWithDomains.map((artist, index) => (
          <motion.div
            key={artist.id}
            initial={{ 
              opacity: 0, 
              filter: 'blur(5px)'
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              transition: {
                duration: 1.5,
                delay: 0.6 + (index * 0.1)
              }
            }}
            className="flex items-center"
          >
            <Link
              href={getArtistUrl(artist.subdomain!)}
              className="text-gray-400 hover:underline transition-all duration-200"
            >
              <span className="text-lg">
                {artist.name}
              </span>
            </Link>
            {index < artistsWithDomains.length - 1 && (
              <span className="text-gray-400 text-lg">,</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
