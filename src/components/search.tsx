'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from 'lucide-react'

export default function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [displayedResults, setDisplayedResults] = useState<string[]>([])

  const filterResults = useCallback(() => {
    const searchResults = [
      "React Hooks: Simplify your code with functional components",
      "Tailwind CSS: A utility-first framework for rapid UI development",
      "Next.js: The React framework for production-grade applications",
      "TypeScript: Add static typing to your JavaScript projects",
      "GraphQL: A query language for your API",
    ]
    return searchResults.filter(result => result.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery])

  useEffect(() => {
    if (searchQuery) {
        const timeout = setTimeout(() => {
            setDisplayedResults(filterResults())
        }, 500)
        return () => clearTimeout(timeout)
        }
  }, [searchQuery, filterResults])

  const handleClearSearch = () => {
    setSearchQuery('')
    setDisplayedResults([])
  }

  return (
    <div className="min-h-screen text-white overflow-hidden fixed inset-0">
      {/* Glowing orb */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-800 rounded-full blur-3xl opacity-20 animate-pulse" />
      
      {/* Search header - fixed position */}
      <div className="bg-white/10 backdrop-blur-md p-4 sticky top-0 z-10">
        <div className="relative max-w-6xl mx-auto">
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-6 bg-white/10 border-white/20 text-white placeholder-white/50 text-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={24} />
          {searchQuery && (
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
          <div className="max-w-6xl mx-auto p-4 space-y-4">
            {displayedResults.map((result, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                {result.split(searchQuery).map((part, index) => (
                    <span key={index} className={index % 2 === 0 ? 'text-white' : 'text-primary'}>{part}</span>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}