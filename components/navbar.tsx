import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BlocksIcon, HomeIcon, Settings, ShirtIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeSwitch } from "./theme-switch";
import { Separator } from "./ui/separator";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    const handleClose = () => setOpen(false);

    return (
        <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
            <Sheet open={open} onOpenChange={setOpen}>
                <div className="flex justify-between items-center w-full lg:hidden">
                    <Link href="/" prefetch={false} className="font-semibold">
                        DressUpMate
                        <span className="sr-only">DressUpMate</span>
                    </Link>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="lg:hidden">
                            <MenuIcon className="h-6 w-6" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                </div>
                <SheetContent side="right" className="w-64">
                    <Link href="/" className="mr-6 hidden lg:flex" prefetch={false}>
                        DressUpMate
                        <span className="sr-only">DressUpMate</span>
                    </Link>
                    <div className="grid gap-2 py-6">
                        <Button
                            variant="ghost"
                            className="justify-start"
                            asChild
                            onClick={handleClose}>
                            <Link
                                href="/closet"
                                className="flex w-full items-center justify-start py-2 text-lg font-semibold"
                                prefetch={false}>
                                <ShirtIcon />
                                Guardaroba
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            className="justify-start"
                            asChild
                            onClick={handleClose}>
                            <Link
                                href="/categories"
                                className="flex w-full items-center py-2 text-lg font-semibold"
                                prefetch={false}>
                                <BlocksIcon />
                                Categorie
                            </Link>
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
            <Link href="/" className="mr-6 hidden lg:flex font-semibold" prefetch={false}>
                DressUpMate
                <span className="sr-only">DressUpMate</span>
            </Link>
            <nav className="ml-auto hidden lg:flex gap-2 h-7 items-center">
                <Button variant="ghost" asChild>
                    <Link href="/closet" prefetch={false}>
                        <ShirtIcon />
                        Guardaroba
                    </Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link href="/categories" prefetch={false}>
                        <BlocksIcon />
                        Categorie
                    </Link>
                </Button>
                <Separator orientation="vertical" />
                <ThemeSwitch />
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings" prefetch={false}>
                        <Settings />
                    </Link>
                </Button>
            </nav>
        </header>
    );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
    );
}
