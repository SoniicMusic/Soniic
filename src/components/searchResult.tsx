
import { testLookup } from '@/lib/createPage';
import Image from 'next/image';
import { useState } from 'react';

interface SearchResultProps {
    title: string;
    artists: string[];
    coverUrl: string;
    id: string;
    type: 'track' | 'album';
    explicit?: boolean;
    onLookupStart?: () => void;
    onLookupEnd?: () => void;
}
export default function SearchResult({ id, title, artists, coverUrl, type, explicit, onLookupStart, onLookupEnd }: SearchResultProps) {
    const artistNames = artists.join(', ');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleClick = async () => {
        try {
            setIsLoading(true);
            onLookupStart?.(); // Start the full screen loader
            
            // Call testLookup and handle the response
            const result = await testLookup(id, type);
            
            // If successful and we have a redirectUrl, navigate to it
            if (result.success && result.redirectUrl) {
                window.location.href = result.redirectUrl;
                // Note: onLookupEnd will be called when the page unloads/navigates
            } else {
                // Show message if there's no redirect URL
                setIsLoading(false);
                onLookupEnd?.(); // End the full screen loader
            }
        } catch (error) {
            setIsLoading(false);
            onLookupEnd?.(); // End the full screen loader on error
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
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        {type === 'track' && explicit && (
                            <span className="text-xs bg-gray-600 text-white px-1.5 py-0.5 rounded">E</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-400">{artistNames}</p>
                    {isLoading && <p className="text-xs text-blue-400">Loading...</p>}
                </div>
            </div>
        </a>
    )
}