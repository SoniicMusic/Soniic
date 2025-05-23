'use client';

import HeroSection from '@/components/landing/HeroSection';
import LandingLayout from '@/components/landing/LandingLayout';
import ArtistShowcase from '@/components/landing/ArtistShowcase';
import { Search, Music, Share2 } from 'lucide-react';

// Temporary features section component
const FeaturesSection = () => {
  const features = [
    {
      icon: 'search',
      title: 'Cross-Platform Search',
      description: 'Find any song or album across Spotify, Apple Music, Tidal, and more — all in one unified search.',
      color: 'blue'
    },
    {
      icon: 'music',
      title: 'Custom Artist Pages',
      description: 'Artists can create fully customized profiles with their branding, links, and music, all in one beautiful page.',
      color: 'purple'
    },
    {
      icon: 'share',
      title: 'Platform-Agnostic',
      description: "No more broken links. Share music that opens in your fans' preferred platform automatically, every time.",
      color: 'pink'
    }
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Why Choose Soniic?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => {
            let iconComponent;
            if (feature.icon === 'search') {
              iconComponent = <Search className="h-6 w-6 text-blue-500" />;
            } else if (feature.icon === 'music') {
              iconComponent = <Music className="h-6 w-6 text-purple-500" />;
            } else {
              iconComponent = <Share2 className="h-6 w-6 text-pink-500" />;
            }
            
            return (
              <div 
                key={index} 
                className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 ${
                  feature.color === 'blue' ? 'hover:border-blue-500/50' : 
                  feature.color === 'purple' ? 'hover:border-purple-500/50' : 
                  'hover:border-pink-500/50'
                } transition-all`}
              >
                <div className={`${
                  feature.color === 'blue' ? 'bg-blue-500/10' : 
                  feature.color === 'purple' ? 'bg-purple-500/10' : 
                  'bg-pink-500/10'
                } p-3 rounded-lg w-fit mb-4`}>
                  {iconComponent}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  // Define all your content as configuration objects that can be easily modified
  const heroConfig = {
    title: "One Link. Any Platform.",
    description: "Find music across Spotify, Apple Music, Tidal and more — all from a single search. Artists can create beautiful custom pages that work everywhere.",
    logoSrc: "/soniic.png",
    primaryButtonText: "Start Searching",
    primaryButtonHref: "/search",
    secondaryButtonText: "Learn More",
    secondaryButtonHref: "#features"
  };
  
  const artistShowcaseConfig = {
    title: "Custom Artist Pages That Work Everywhere",
    description: "Artists get beautiful, customizable pages with their own branding and direct links to their music across all streaming platforms. Powered by the same technology that makes our cross-platform search work seamlessly.",
    backgroundImage: "https://images.unsplash.com/photo-1614149162883-504ce46d75a4?q=80",
    artistImage: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80",
    artistName: "Artist Name",
    artistBio: "Electronic music producer and DJ based in Los Angeles. New album \"Neon Dreams\" out now on all platforms.",
    artistDomain: "artist.soniic.com",
    artistLinks: [
      { name: "Spotify", url: "#", icon: "SiSpotify", color: "#1DB954" },
      { name: "Apple Music", url: "#", icon: "SiApplemusic", color: "#FA324A" },
      { name: "Latest Album", url: "#", icon: "SiYoutube", color: "#FF0000" },
      { name: "Instagram", url: "#", icon: "SiInstagram", color: "#E1306C" }
    ],
    ctaText: "Create Your Artist Page",
    ctaHref: "/search"
  };
  
  // Footer has been moved to root layout

  return (
    <>
      <LandingLayout>
        <HeroSection {...heroConfig} />
        <FeaturesSection />
        <ArtistShowcase {...artistShowcaseConfig} />
      </LandingLayout>
    </>
  );
}
