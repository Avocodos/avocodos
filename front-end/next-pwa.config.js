const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true
});

module.exports = withPWA({
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180
    },
    ppr: true,
    reactCompiler: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/f/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/*`
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
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false
      };
    }
    if (isServer) {
      config.externals.push("@node-rs/argon2");
    }
    return config;
  }
});
