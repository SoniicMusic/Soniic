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
        ],
    }
};

export default nextConfig;
