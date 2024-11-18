
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
  hidden: { opacity: 0, y: 20, filter: 'blur(5px)'},
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5
    }
  }
};

interface Link {
  name: string;
  url: string;
  icon: string;
}

interface LinksProps {
  artistLinks: Link[];
}

export default function Links(props: LinksProps) {
    const artistLinks = props.artistLinks;
    return (
        <motion.section className="w-full mt-8 space-y-4 px-2"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      > {/* Increased spacing between buttons */}
        {artistLinks.map((link: Link) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Icon = (Icons as any)[link.icon];
          return (
            <motion.ul
            key={link.name}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            >
            <Button
              key={link.name}
              variant="outline"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
              asChild
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center w-full h-full px-3 py-3"> {/* Removed justify-center */}
                <div className="flex items-center">
                  <Icon className="mr-3 w-6 h-6" /> {/* Using w-6 h-6 instead of size prop */}
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