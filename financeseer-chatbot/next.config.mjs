/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle PDF.js dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      canvas: false,
    }

    // Ignore problematic modules
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push("canvas")
    }

    return config
  },
  // Add experimental features for better compatibility
  experimental: {
    serverComponentsExternalPackages: ["pdfjs-dist"],
  },
}

export default nextConfig
