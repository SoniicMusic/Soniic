'use client';
import { useParams } from 'next/navigation'
export default function Home() {
  return (
    <>
    <header className="h-screen flex items-center justify-center text-center text-6xl bg-center">
      <div>
        <h1 className="text-indigo-800">Home</h1>
        <p>Home Page Content</p>
        <p>{JSON.stringify(useParams())}</p>
      </div>
    </header>
    </>
  );
}
