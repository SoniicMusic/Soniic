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
    <div className="min-h-screen text-white overflow-hidden fixed inset-0 ">
      {/* Dark blue edge glows - with more center coverage */}
      <div className="fixed bottom-0 left-0 w-full h-[15vh] bg-gradient-to-t from-blue-900/40 to-transparent blur-[100px]" />
      <div className="fixed left-0 top-0 w-[60vw] h-full bg-gradient-to-r from-blue-900/40 to-transparent blur-[100px]" />
      <div className="fixed right-0 top-0 w-[60vw] h-full bg-gradient-to-l from-blue-900/40 to-transparent blur-[100px]" />

      {/* Search header - fixed position */}
      <div className="bg-black backdrop-blur-md p-4 sticky top-0 z-10">
        <div className="relative max-w-6xl mx-auto">
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-6 bg-white/10 text-white placeholder-white/50 text-xl"
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