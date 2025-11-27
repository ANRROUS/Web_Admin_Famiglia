/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        MONGO_URL: process.env.MONGO_URL,
    },
};

export default nextConfig;
