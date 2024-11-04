import { headers } from 'next/headers'
import React from 'react';

export default async function Page() {
    const headersList = await headers()
    const domain = headersList.get('host') || ''

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to our site</h1>
      {domain ? (
        <p className="text-lg">You are viewing the {domain} subdomain.</p>
      ) : (
        <p className="text-lg">You are on the main domain.</p>
      )}
    </div>
  )
}
