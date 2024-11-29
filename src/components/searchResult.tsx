
import Image from 'next/image';
  
interface SearchResultProps {
    title: string;
    artists: string[];
    coverUrl: string;
}
export default function SearchResult({ title, artists, coverUrl }: SearchResultProps) {
    const artistNames = artists.join(', ')

    return (

        <div className="flex items-center space-x-4" >
            <Image src={coverUrl} alt={title} width={64} height={64} className="rounded-md" />
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-gray-400">{artistNames}</p>
            </div>
        </div>
    )
}