/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        dynamicIO: true,
    },
    images: {
        domains: ['is1-ssl.mzstatic.com']
    }
};

export default nextConfig;
