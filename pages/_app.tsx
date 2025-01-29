import { I18nProvider } from "../locales";
import { AppProps } from "next/app";
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
    // Use the layout defined at the page level, if available
    const getLayout = Component.getLayout ?? ((page) => page);

    return (
        <I18nProvider locale={pageProps.locale}>
            <ThemeProvider attribute="class" defaultTheme="system">
                {getLayout(<Component {...pageProps} />)}
            </ThemeProvider>
        </I18nProvider>
    );
}
