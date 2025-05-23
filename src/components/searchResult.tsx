
import { testLookup } from '@/lib/createPage';
import Image from 'next/image';
import { useState } from 'react';

interface SearchResultProps {
    title: string;
    artists: string[];
    coverUrl: string;
    id: string;
    type: 'track' | 'album';
}
export default function SearchResult({ id, title, artists, coverUrl, type }: SearchResultProps) {
    const artistNames = artists.join(', ');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleClick = async () => {
        try {
            setIsLoading(true);
            console.log('Starting lookup for:', { id, type });
            
            // Call testLookup and handle the response
            const result = await testLookup(id, type);
            console.log('Lookup result:', result);
            
            // If successful and we have a redirectUrl, navigate to it
            if (result.success && result.redirectUrl) {
                console.log('Redirecting to:', result.redirectUrl);
                window.location.href = result.redirectUrl;
            } else {
                // Show message if there's no redirect URL
                console.log('Lookup successful but no redirect URL available. Result:', result);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error during lookup:', error);
            setIsLoading(false);
        }
    };
    
    return (
        <a 
            className={`flex items-center space-x-4 p-3 rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200 ${isLoading ? 'opacity-50' : ''}`}
            onMouseDown={handleClick}
            role="button" 
            aria-label={`Play ${type}: ${title} by ${artistNames}`}
        >
            <div className="flex items-center space-x-4">
                <Image src={coverUrl} alt={title} width={64} height={64} className="rounded-md" />
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-gray-400">{artistNames}</p>
                    {isLoading && <p className="text-xs text-blue-400">Loading...</p>}
                </div>
            </div>
        </a>
    )
}