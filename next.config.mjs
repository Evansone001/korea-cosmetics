/** @type {import('next').NextConfig} */
const nextConfig = {
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
    },
    // Performance optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
        optimizePackageImports: ['@radix-ui', 'lucide-react', 'framer-motion'],
    },
        // Reduce bundle size and handle SVG imports
    webpack: (config, { dev, isServer }) => {
        // Handle SVG imports
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });

        if (!dev && !isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
};

export default nextConfig;
