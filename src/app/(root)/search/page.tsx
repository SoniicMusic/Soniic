import { Input } from "@/components/ui/input"
import * as motion from '@/lib/motion';
export default function SearchPage() {
    return (
        <div
        className="h-screen bg-gradient-to-r from-gray-100 to-gray-900"
        >
        <motion.div
        className="mt-5 mr-5 ml-5"
        initial={{ opacity: 0, y: 10, filter: 'blur(5px)'}}
        animate={{ opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 1.5,
            delay: 0.5
             }
         }}
        >
        <Input
            placeholder="Search for a song or album"
            className=" bg-gray-800/2 text-white"
        />
        </motion.div>
</div>
    );
    }