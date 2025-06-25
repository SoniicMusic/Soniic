'use client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from 'lucide-react'
import { searchSpotify } from '@/lib/lookup/spotify'
import { useEffect, useMemo, useState, useTransition, useCallback, useRef } from "react"
import debounce from 'lodash/debounce'
import SearchResultsComponent from "./SearchResultAnimation"
import FullScreenLoader from "./FullScreenLoader"
import { useRouter, useSearchParams } from 'next/navigation'
import * as motion from  "@/lib/motion"

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

  const [lastSearchedQuery, setLastSearchedQuery] = useState(initialQuery)
  const currentSearchRef = useRef<string>('')

  const performSearch = useCallback(async (searchQuery: string) => {
    // Set the current search query
    currentSearchRef.current = searchQuery
    
    try {
      const searchResults = await searchSpotify(searchQuery)
      
      // Only update results if this is still the current search
      if (currentSearchRef.current === searchQuery) {
        setResults(searchResults || { tracks: [], albums: [] })
        setLastSearchedQuery(searchQuery)
      }
    } catch (error) {
      // Only update results if this is still the current search
      if (currentSearchRef.current === searchQuery) {
        setResults({ tracks: [], albums: [] })
      }
    }
  }, [])

  const handleSearch = useCallback((searchQuery: string) => {
    startTransition(() => performSearch(searchQuery))
  }, [performSearch])

  const debouncedSearch = useMemo(() => {
    return debounce((searchQuery: string) => {
      handleSearch(searchQuery)
    }, 500);
  }, [handleSearch])

  // Update URL only when the actual search completes successfully
  useEffect(() => {
    if (lastSearchedQuery && lastSearchedQuery !== initialQuery) {
      router.replace(`/search?q=${encodeURIComponent(lastSearchedQuery)}`, { scroll: false })
    }
  }, [lastSearchedQuery, router, initialQuery])

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
      // For initial query, don't update URL since it's already there
      // Just perform the search directly
      performSearch(initialQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]); // Only run on initial mount if initialQuery exists


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    if (newQuery.trim()) {
      // Don't update URL immediately - let debounced search handle it
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
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-6 bg-white/10 text-white placeholder-white/50 text-xl"
            value={query}
            onChange={handleInputChange}
            autoFocus
          />
          <motion.button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={handleClearSearch}
            disabled={!query.trim()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="text-white/50" size={20} />
          </motion.button>
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={24} />
          {isPending && (
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
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