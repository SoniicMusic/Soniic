import SearchComponent from '@/components/search';
import { Suspense } from 'react';

export default function SearchPage() {

    return (
        <main className="flex flex-col items-center justify-center w-full h-full bg-black">
        <Suspense fallback={
            <div className="flex items-center justify-center w-full h-full text-white">
                Loading search...
            </div>
        }>
            <SearchComponent />
        </Suspense>
        </main>
    );
}