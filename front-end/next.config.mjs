import { fileURLToPath } from "node:url";
import createJiti from "jiti";
const jiti = createJiti(fileURLToPath(import.meta.url));
jiti("./src/env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180
    }
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, path: false };
    }
    return config;
  },
  swcMinify: true,
  // serverExternalPackages: ["@node-rs/argon2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/*/*"
      }
    ]
  },
  rewrites: () => {
    return [
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag"
      }
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@node-rs/argon2");
    }
    return config;
  }
};

export default nextConfig;
