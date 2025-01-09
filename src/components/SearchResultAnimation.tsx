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
      delayChildren: 1,
      staggerChildren: 0.2,
      duration: 1.5
    }
  }
}


export default function SearchResultsComponent(props: { results: { tracks: unknown[], albums: unknown[] }, isPending: boolean }) {
  const results = props.results
  const isPending = props.isPending
  return (
    <motion.section className="max-w-6xl space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {results.tracks.length === 0 && results.albums.length === 0 && !isPending && (
        <p className="text-xl text-center font-bold p-4">No results found</p>
      )}

      {
        results.tracks.length > 0 &&
        <h2 className="text-xl font-bold z-10 sticky top-0 p-2 pl-5 items-center backdrop-blur-3xl">
          Tracks
        </h2>
      }

      {results.tracks.map((track) => {
        console.log(track)
        return (
          <motion.ul
            key={track.id}
            variants={listVarients}
            className='mr-2 ml-2'
          >
            <SearchResult
              key={track.id}
              id={track.id}
              title={track.title}
              artists={track.artists}
              coverUrl={track.coverUrl}
            />
          </motion.ul>
        )
      }
      )}
      {
        results.albums.length > 0 && <h2 className="text-xl font-bold z-10 sticky top-0 p-2 pl-5 items-center backdrop-blur-3xl">Albums</h2>
      }
      {results.albums.map((album) => (
        <motion.ul
          key={album.id}
          variants={listVarients}
          className='mr-2 ml-2'
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