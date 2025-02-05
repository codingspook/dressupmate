import Navbar from "@/components/navbar";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";
import { useEffect, useState } from "react";
import BottomNavigation from "./bottom-navigation";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                />
            </Head>
            <Navbar />
            <div className="relative flex flex-col min-h-screen pt-16 pb-[4.75rem] md:pb-4">
                <main className="container flex-grow px-6 pt-8 mx-auto max-w-7xl mb-4">
                    {children}
                </main>
                <footer className="flex items-center justify-center w-full py-3 pb-safe">
                    <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-current"
                        href="https://github.com/codingspook"
                        title="codingspook github">
                        <span className="text-default-600">Made with ❤️ by</span>
                        <p className="text-primary">👻 codingspook</p>
                    </Link>
                </footer>
            </div>
            <BottomNavigation />
            <Toaster />
        </>
    );
}
