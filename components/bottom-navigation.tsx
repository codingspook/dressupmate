import { ShirtIcon, BlocksIcon, CogIcon } from "lucide-react";
import router from "next/router";
import React from "react";
import Link from "next/link";

const BottomNavigation = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 flex lg:hidden justify-around items-center bg-background p-2 select-none z-10">
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
                className={`flex flex-col items-center text-sm px-4 py-2 rounded-2xl pointer-events-none opacity-10 ${
                    router.pathname === "/settings" ? "opacity-100 bg-muted" : "opacity-50"
                }`}>
                <CogIcon className="h-6 w-6" />
                <span>Impostazioni</span>
            </Link>
        </nav>
    );
};

export default BottomNavigation;
