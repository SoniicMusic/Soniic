'use client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from 'lucide-react'
import { searchSpotify } from '@/lib/lookup/spotify'
import { useEffect, useMemo, useState, useTransition } from "react"
import debounce from 'lodash/debounce'
import SearchResultsComponent from "./SearchResultAnimation"
import FullScreenLoader from "./FullScreenLoader"
import { useRouter, useSearchParams } from 'next/navigation'

// Define interfaces for our track and album types to match with SearchResultAnimation
interface TrackResult {
  id: string;
  title: string;
  artists: string[];
  coverUrl: string;
  type: 'track' | 'album';
  explicit?: boolean;
}

interface AlbumResult {
  id: string;
  title: string;
  artists: string[];
  coverUrl: string;
  type: 'track' | 'album';
}

export default function SearchComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<{ tracks: TrackResult[]; albums: AlbumResult[] }>({ tracks: [], albums: [] })
  const [isPending, startTransition] = useTransition()
  const [isLookupLoading, setIsLookupLoading] = useState(false)
  const [resetItemLoading, setResetItemLoading] = useState(false)

  // Reset loading state when component mounts (handles browser back navigation)
  useEffect(() => {
    setIsLookupLoading(false);
    setResetItemLoading(true);
    // Reset the flag after a brief moment to allow child components to react
    const timer = setTimeout(() => setResetItemLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (searchQuery: string) => {
    startTransition(async () => {
      try {
        const searchResults = await searchSpotify(searchQuery)
        setResults(searchResults || { tracks: [], albums: [] })
      } catch (error) {
        setResults({ tracks: [], albums: [] })
      }
    })
  }

  const debouncedSearch = useMemo(() => {
    return debounce(handleSearch, 500);
  }, []);

  // Handle browser back navigation - reset loading state when returning to search page
  useEffect(() => {
    const handleFocus = () => {
      // Reset lookup loading state when the window regains focus (user navigates back)
      setIsLookupLoading(false);
      setResetItemLoading(true);
      setTimeout(() => setResetItemLoading(false), 100);
    };

    const handleVisibilityChange = () => {
      // Reset lookup loading state when page becomes visible again
      if (document.visibilityState === 'visible') {
        setIsLookupLoading(false);
        setResetItemLoading(true);
        setTimeout(() => setResetItemLoading(false), 100);
      }
    };

    // Add event listeners for browser back navigation
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]); // Only run on initial mount if initialQuery exists


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    if (newQuery.trim()) {
      router.replace(`/search?q=${encodeURIComponent(newQuery)}`, { scroll: false })
      // Cancel any pending debounced search before starting a new one
      debouncedSearch.cancel()
      debouncedSearch(newQuery.trim())
    } else {
      router.replace('/search', { scroll: false })
      debouncedSearch.cancel()
      setResults({ tracks: [], albums: [] })
    }
  }
  const handleClearSearch = () => {
    setQuery('')
    router.replace('/search', { scroll: false })
    debouncedSearch.cancel()
    setResults({ tracks: [], albums: [] })
  }

  return (
    <div className="min-h-screen text-white overflow-hidden fixed inset-0 bg-black">
      {/* Full screen loader */}
      <FullScreenLoader isVisible={isLookupLoading} message="Finding your music..." />
      
      {/* Search header - fixed position */}
      <div className="bg-black backdrop-blur-md p-4 sticky top-0 z-10">
        <div className="relative max-w-6xl mx-auto">
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-6 bg-white/10 text-white placeholder-white/50 text-xl"
            value={query}
            onChange={handleInputChange}
            autoFocus
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={24} />
          {isPending && (
            <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-white/50 border-t-white rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="h-[calc(100vh-5rem)] overflow-hidden">
        <ScrollArea className="h-full w-full">
          <section className="max-w-6xl space-y-4 w-full mx-auto mb-5">
            <SearchResultsComponent 
              results={results} 
              isPending={isPending} 
              onLookupStart={() => setIsLookupLoading(true)}
              onLookupEnd={() => setIsLookupLoading(false)}
              resetLoading={resetItemLoading}
            />
          </section>
        </ScrollArea>
      </div>
    </div>
  )
}