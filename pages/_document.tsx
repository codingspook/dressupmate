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
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
