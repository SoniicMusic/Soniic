'use client';
import Link from 'next/link';
export default function Home() {
  return (
    <>
    <header className="h-screen flex items-center justify-center text-center text-6xl bg-center">
      <div>
        <h1 className="text-indigo-800">Home</h1>
        <Link href="/search">
          Search
        </Link>

      </div>
    </header>
    </>
  );
}
