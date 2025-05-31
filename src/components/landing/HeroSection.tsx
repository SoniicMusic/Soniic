'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  title: string;
  description: string;
  logoSrc: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText: string;
  secondaryButtonHref: string;
}

export default function HeroSection({
  title = "One Link. Any Platform.",
  description = "Find music across Spotify, Apple Music, Tidal and more — all from a single search. Artists can create beautiful custom pages that work everywhere.",
  logoSrc = "/soniic.png",
  primaryButtonText = "Start Searching",
  primaryButtonHref = "/search",
  secondaryButtonText = "Learn More",
  secondaryButtonHref = "#features",
}: Partial<HeroSectionProps>) {
  return (
    <section className="h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 to-transparent" />
      <div className="absolute top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl" />
      <div className="absolute bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full filter blur-3xl" />
      
      <div className="relative z-10 max-w-4xl">
        <div className="mb-6 flex justify-center">
          <Image 
            src={logoSrc} 
            alt="Logo" 
            width={100} 
            height={100} 
            className="animate-pulse rounded-md shadow-lg" 
          />
        </div>
        <h1 className="text-6xl sm:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
          {title}
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white px-8"
          >
            <Link href={primaryButtonHref}>
              <Search className="mr-2 h-5 w-5" />
              {primaryButtonText}
            </Link>
          </Button>
          {/* <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            <a href={secondaryButtonHref}>
              {secondaryButtonText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button> */}
        </div>
      </div>
      
      {/* Scroll indicator
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowRight className="rotate-90 h-6 w-6 text-white/50" />
      </div> */}
    </section>
  );
}