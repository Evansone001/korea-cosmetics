/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'koreacosmetics.top',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'api.koreacosmetics.top',
                pathname: '/uploads/**',
            },
        ],
    }
};

export default nextConfig;
