import { Button } from "@/components/ui/button";
import { ShirtIcon, BlocksIcon, Settings, CogIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeSwitch } from "./theme-switch";
import { Separator } from "./ui/separator";
import { useRouter } from "next/router";

export default function Navbar() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const router = useRouter();

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    return (
        <>
            <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6 justify-between">
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
                    <ThemeSwitch />
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/settings">
                            <Settings />
                        </Link>
                    </Button>
                </nav>
                <ThemeSwitch />
            </header>

            {/* Bottom navigation visibile solo su mobile */}
            <nav className="fixed bottom-0 left-0 right-0 flex lg:hidden justify-around items-center bg-background p-2 select-none">
                <Link
                    href="/closet"
                    className={`flex flex-col items-center text-sm px-4 py-2 rounded-2xl ${
                        router.pathname === "/closet" ? "opacity-100 bg-muted" : "opacity-50"
                    }`}>
                    <ShirtIcon className="h-6 w-6" />
                    <span>Guardaroba</span>
                </Link>
                <Link
                    href="/categories"
                    className={`flex flex-col items-center text-sm px-4 py-2 rounded-2xl ${
                        router.pathname === "/categories" ? "opacity-100 bg-muted" : "opacity-50"
                    }`}>
                    <BlocksIcon className="h-6 w-6" />
                    <span>Categorie</span>
                </Link>
                <Link
                    href="/settings"
                    className={`flex flex-col items-center text-sm px-4 py-2 rounded-2xl pointer-events-none opacity-20 ${
                        router.pathname === "/settings" ? "opacity-100 bg-muted" : "opacity-50"
                    }`}>
                    <CogIcon className="h-6 w-6" />
                    <span>Impostazioni</span>
                </Link>
            </nav>
        </>
    );
}
