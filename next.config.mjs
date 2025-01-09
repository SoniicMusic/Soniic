/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        dynamicIO: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'is1-ssl.mzstatic.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.scdn.co',
                port: '',
                pathname: '/**',

            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
                port: '',
                pathname: '/**',
            }
        ],
    }
};

export default nextConfig;
