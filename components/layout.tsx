import Navbar from "@/components/navbar";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container flex-grow px-6 pt-16 mx-auto max-w-7xl">{children}</main>
            <footer className="flex items-center justify-center w-full py-3">
                <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-current"
                    href="https://github.com/codingspook"
                    title="codingspook github">
                    <span className="text-default-600">Made with ❤️ by</span>
                    <p className="text-primary">codingspook</p>
                </Link>
            </footer>
            <Toaster />
        </div>
    );
}
