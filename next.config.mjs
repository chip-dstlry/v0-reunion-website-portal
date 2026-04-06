/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const basePath = isGitHubPages ? '/v0-reunion-website-portal' : ''

// Expose basePath to client code as NEXT_PUBLIC_BASE_PATH
process.env.NEXT_PUBLIC_BASE_PATH = basePath

const nextConfig = {
  output: 'export',
  ...(isGitHubPages && {
    basePath,
    trailingSlash: true,
  }),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
