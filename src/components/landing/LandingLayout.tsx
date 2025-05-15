'use client';

import { ReactNode } from 'react';

interface LandingLayoutProps {
  background?: string;
  children: ReactNode;
}

export default function LandingLayout({
  background = "bg-gradient-to-b from-black to-gray-900",
  children
}: LandingLayoutProps) {
  return (
    <div className={`min-h-screen ${background} text-white`}>
      {children}
    </div>
  );
}
