import { headers } from 'next/headers'
import React, { Suspense } from 'react';

async function DomainDisplay() {
  const domain = await getDomain();

  return domain ? (
    <p className="text-lg">You are viewing the {domain} subdomain.</p>
  ) : (
    <p className="text-lg">You are on the main domain.</p>
  );
}
async function getDomain() {
  const headersList = await headers()
  const domain = headersList.get('host')?.split(':')[0] || ''
  return domain;
}

export default function Page() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to our site</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <DomainDisplay />
      </Suspense>
    </div>
  )
}
 
export async function generateMetadata() {
const domain = await getDomain()
  if (domain) {
    return {
      title: `Welcome to the ${domain} subdomain`,
      description: 'A simple example of a domain-specific page',
    }
  }
  else {
  return {
    title: 'Welcome to our site',
    description: 'A simple example of a domain-specific page',
  }
}
 

};
