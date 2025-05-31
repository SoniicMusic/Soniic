'use client';

import Image from 'next/image';

interface FooterProps {
  logoSrc: string;
  links: Array<{
    label: string;
    href: string;
  }>;
  copyright: string;
}

export default function Footer({
  logoSrc = "/soniic.png",
  links = [
    { label: "About", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Contact", href: "#" }
  ],
  copyright = "© 2025 Soniic. All rights reserved."
}: Partial<FooterProps>) {
  return (
    <footer className="py-10 px-4 border-t border-white/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Image 
            src={logoSrc} 
            alt="Logo" 
            width={40} 
            height={40}
            className="mr-2 rounded-md shadow-lg" 
          />
          <span className="font-bold text-xl">Soniic</span>
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          {links.map((link, index) => (
            <a 
              key={index} 
              href={link.href} 
              className="hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="mt-4 md:mt-0 text-sm text-gray-400">
          {copyright}
        </div>
      </div>
    </footer>
  );
}
