
import { Button } from '@/components/ui/button';
import * as Icons from '@icons-pack/react-simple-icons';
import * as motion from '@/lib/motion';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: 1,
      staggerChildren: 0.2,
      duration: 1.5
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5
    }
  }
};

// Generic link interface that can represent any type of link
interface BaseLink {
  id?: string;
  name: string | null;
  url: string | null;
  icon: string | null;
  color?: string | null;
}

// More specific interfaces for type safety (but all compatible with BaseLink)
interface ArtistLink extends BaseLink {
  artist_id?: string | null;
  order?: number | null;
}

interface TrackLink extends BaseLink {
  track_isrc?: string | null;
}

interface AlbumLink extends BaseLink {
  album_upc?: string | null;
}

// Union type for all possible link types
type Link = ArtistLink | TrackLink | AlbumLink | BaseLink;

interface LinksProps {
  // Support multiple prop names for backward compatibility
  links?: Link[];
  artistLinks?: Link[]; 
  trackLinks?: Link[];
  albumLinks?: Link[];
}

export default function Links(props: LinksProps) {
  // Determine which links array to use, with fallback priority
  const allLinks = props.links || props.artistLinks || props.trackLinks || props.albumLinks || [];
  
  // Filter out any invalid links
  const validLinks = allLinks.filter((link): link is Link => 
    link && 
    typeof link.name === 'string' && link.name.trim() !== '' &&
    typeof link.url === 'string' && link.url.trim() !== '' &&
    typeof link.icon === 'string' && link.icon.trim() !== ''
  );

  if (validLinks.length === 0) {
    return null; // Don't render anything if no valid links
  }

  return (
    <motion.section className="w-full mt-8 space-y-4 px-2"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    > {/* Increased spacing between buttons */}
      {validLinks.map((link, index) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Icon = link.icon ? (Icons as any)[link.icon] : null;
        
        // Create a unique key that works for all link types
        const linkKey = link.id || `${link.name}-${link.url}-${index}`;
        
        return (
          <motion.ul
            key={linkKey}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
              asChild
            >
              <a href={link.url || ''} target="_blank" rel="noopener noreferrer"
                className="flex items-center w-full h-full px-3 py-3"> {/* Removed justify-center */}
                <div className="flex items-center">
                  {Icon ? (
                    <Icon className="mr-3 w-6 h-6"/>
                  ) : (
                    <div className="mr-3 w-6 h-6 bg-white/20 rounded" />
                  )}
                  <span className="text-lg font-semibold">{link.name}</span> {/* Removed text-center */}
                </div>
              </a>
            </Button>
          </motion.ul>
        );
      })}
    </motion.section>
  );
}