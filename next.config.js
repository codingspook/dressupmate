/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ["tsx", "ts"],
    i18n: {
        locales: ["it", "en"],
        defaultLocale: "it",
    },
    images: {
        domains: ["qnsayahexjstxxbjztvz.supabase.co"],
    },
    // Configurazione per Turborepo
    output: "standalone",
    transpilePackages: ["ui"],
    // Ottimizzazione build per Turborepo
    reactStrictMode: true,
};

module.exports = nextConfig;
