import { useEffect, useState } from 'react';

const Page = () => {
    const [subdomain, setSubdomain] = useState<string | null>(null);

    useEffect(() => {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        if (parts.length > 2) {
            setSubdomain(parts[0]);
        } else {
            setSubdomain(null);
        }
    }, []);

    return (
        <div>
            <h1>Current Subdomain</h1>
            {subdomain ? <p>{subdomain}</p> : <p>No subdomain detected</p>}
        </div>
    );
};

export default Page;