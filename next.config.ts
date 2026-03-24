import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // En desarrollo, Next.js intenta optimizar las imágenes haciendo un fetch server-side,
    // lo que falla con Docker en Windows. Con unoptimized=true el browser las pide directamente.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      // Supabase local (desarrollo) — ambos hostnames por compatibilidad Windows/Docker
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
      // Supabase cloud (producción)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
