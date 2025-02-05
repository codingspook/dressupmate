// pages/_document.tsx
import { fontSans } from "@/config/fonts";
import { cn } from "@/lib/utils";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html
            lang="it"
            className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="application-name" content="DressUpMate" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="DressUpMate" />
                <meta name="theme-color" content="#000000" />
                <meta name="mobile-web-app-capable" content="yes" />

                {/* Icone per iOS */}
                <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
                <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.png" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
