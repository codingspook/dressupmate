import { Button } from "@/components/ui/button";
import { ShirtIcon, BlocksIcon, Settings, CogIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { ThemeSwitch } from "./theme-switch";
import { Separator } from "./ui/separator";
import { useRouter } from "next/router";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTheme } from "next-themes";

export default function Navbar() {
    const { resolvedTheme } = useTheme();
    const isMobile = useMediaQuery("(max-width: 767px)");

    useEffect(() => {
        document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    }, [resolvedTheme]);

    return (
        <>
            <header className="flex h-14 w-full shrink-0 items-center px-4 md:px-6 justify-between fixed top-0 z-10 bg-background/80 backdrop-blur-md">
                <Link href="/" className="font-semibold text-xl flex items-center gap-2">
                    <ShirtIcon className="size-6" fill="currentColor" />
                    DressUpMate
                    <span className="sr-only">DressUpMate</span>
                </Link>
                <nav className="ml-auto hidden lg:flex gap-2 h-7 items-center">
                    <Button variant="ghost" asChild>
                        <Link href="/closet">
                            <ShirtIcon />
                            Guardaroba
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/categories">
                            <BlocksIcon />
                            Categorie
                        </Link>
                    </Button>
                    <Separator orientation="vertical" />
                    {!isMobile && <ThemeSwitch />}
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/settings">
                            <Settings />
                        </Link>
                    </Button>
                </nav>
                {isMobile && <ThemeSwitch />}
            </header>
        </>
    );
}
