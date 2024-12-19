import * as motion from '@/lib/motion'
import SearchResult from './searchResult'

const listVarients = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.9,
      duration: 0.5
    }
  }
}


export default function SearchResultsComponent(props: { results: { tracks: unknown[], albums: unknown[] }, isPending: boolean }) {
  const results = props.results
  const isPending = props.isPending
  return (

    <motion.section className="max-w-6xl mx-auto p-4 space-y-4 bg-black/50 rounded-md w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {results.tracks.length === 0 && results.albums.length === 0 && !isPending && (
        <p className="text-xl text-center font-bold">No results found</p>
      )}

      {
        results.tracks.length > 0 && <h2 className="text-xl font-bold">Tracks</h2>
      }

      {results.tracks.map((track) => (
        <motion.ul
          key={track.id}
          variants={listVarients}
        >
          <SearchResult
            key={track.id}
            id={track.id}
            title={track.title}
            artists={track.artists}
            coverUrl={track.coverUrl}
          />
        </motion.ul>
      ))}
      {
        results.albums.length > 0 && <h2 className="text-xl font-bold">Albums</h2>
      }
      {results.albums.map((album) => (
        <motion.ul
          key={album.id}
          variants={listVarients}
        >

          <SearchResult
            key={album.id}
            id={album.id}
            title={album.title}
            artists={album.artists}
            coverUrl={album.coverUrl}
          />
        </motion.ul>
      ))}
    </motion.section>
  )
}