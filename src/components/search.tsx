'use client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from 'lucide-react'
import { searchSpotify } from '@/lib/lookup/spotify'
import {  useMemo, useState, useTransition } from "react"
import debounce from 'lodash/debounce'
import SearchResultsComponent from "./SearchResultAnimation"


export default function SearchComponent() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ tracks: object[]; albums: object[] }>({ tracks: [], albums: [] })
  const [isPending, startTransition] = useTransition()

  const handleSearch = (searchQuery: string) => {
    startTransition(async () => {
      try {
        const searchResults = await searchSpotify(searchQuery)
        setResults(searchResults || { tracks: [], albums: [] })
      } catch (error) {
        console.error('Error searching Spotify:', error)
        setResults([])
      }
    })
  }

  const debouncedSearch = useMemo(() => {
    return debounce(handleSearch, 500);
  }, []);

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // wait for user to stop typing

    const newQuery = e.target.value
    setQuery(newQuery)
    if (newQuery) {
      // debounce the search
      debouncedSearch(newQuery)
    } else {
      setResults({ tracks: [], albums: [] })
    }
  }
  const handleClearSearch = () => {
    setQuery('')
    setResults({ tracks: [], albums: [] })
  }



  return (
    <div className="min-h-screen text-white overflow-hidden fixed inset-0 ">
      {/* Dark blue edge glows - with more center coverage */}
      {/* <div className="fixed bottom-0 left-0 w-full h-[15vh] bg-gradient-to-t from-blue-900/40 to-transparent blur-[100px]" />
      <div className="fixed left-0 top-0 w-[60vw] h-full bg-gradient-to-r from-blue-900/40 to-transparent blur-[100px]" />
      <div className="fixed right-0 top-0 w-[60vw] h-full bg-gradient-to-l from-blue-900/40 to-transparent blur-[100px]" /> */}
      {/* Dark blue edge glows - with less center coverage */}

      {/* Search header - fixed position */}
      <div className="bg-black backdrop-blur-md p-4 sticky top-0 z-10">
        <div className="relative max-w-6xl mx-auto">
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-6 bg-white/10 text-white placeholder-white/50 text-xl"
            value={query}
            onChange={handleInputChange}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={24} />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
              onClick={handleClearSearch}
            >
              <X size={24} />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="h-[calc(100vh-5rem)] overflow-hidden">
        <ScrollArea className="h-full">
          <SearchResultsComponent results={results} isPending={isPending} />
        </ScrollArea>
      </div>
    </div>
  )
}