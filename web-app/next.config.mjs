/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Las fichas y la comparación leen los JSON nacionales con fs en el
    // servidor: en Vercel hay que incluirlos en esas funciones.
    outputFileTracingIncludes: {
      "/colegio/[rbd]": ["./public/data/nacional/indice.json", "./public/data/nacional/fichas/**"],
      "/comparar": ["./public/data/nacional/indice.json", "./public/data/nacional/fichas/**"],
      "/explorar": ["./public/data/nacional/comunas.json"],
    },
  },
};

export default nextConfig;
