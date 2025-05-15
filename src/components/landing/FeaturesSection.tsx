'use client';

import { Search, Music, Share2 } from 'lucide-react';

interface Feature {
  icon: 'search' | 'music' | 'share';
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'pink';
}

interface FeaturesProps {
  heading: string;
  features: Feature[];
}

export default function FeaturesSection({
  heading = "Why Choose Soniic?",
  features = [
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
  ]
}: Partial<FeaturesProps>) {
  const getIconComponent = (icon: string, color: string) => {
    // Fixed styling with predefined classes instead of template literals
    const colorClass = 
      color === 'blue' ? 'text-blue-500' : 
      color === 'purple' ? 'text-purple-500' : 
      'text-pink-500';
    
    switch(icon) {
      case 'search':
        return <Search className={`h-6 w-6 ${colorClass}`} />;
      case 'music':
        return <Music className={`h-6 w-6 ${colorClass}`} />;
      case 'share':
        return <Share2 className={`h-6 w-6 ${colorClass}`} />;
      default:
        return <Search className={`h-6 w-6 ${colorClass}`} />;
    }
  };

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">{heading}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => {
            // Fixed styling with conditional classes instead of template literals
            const hoverBorderClass = 
              feature.color === 'blue' ? 'hover:border-blue-500/50' : 
              feature.color === 'purple' ? 'hover:border-purple-500/50' : 
              'hover:border-pink-500/50';
              
            const bgColorClass = 
              feature.color === 'blue' ? 'bg-blue-500/10' : 
              feature.color === 'purple' ? 'bg-purple-500/10' : 
              'bg-pink-500/10';
              
            return (
              <div 
                key={index} 
                className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 ${hoverBorderClass} transition-all`}
              >
                <div className={`${bgColorClass} p-3 rounded-lg w-fit mb-4`}>
                  {getIconComponent(feature.icon, feature.color)}
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
}
