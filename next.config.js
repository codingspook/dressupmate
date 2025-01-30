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
};

module.exports = nextConfig;
