import Layout from "@/components/layout";
import { title } from "@/components/primitives";
import { ReactElement } from "react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-4">
            <section className="flex flex-col items-center gap-4">
                <h1 className={title({ size: "md" })}>Settings Page</h1>
                <p className="text-default-600">This is the settings page content</p>
            </section>
        </div>
    );
}

SettingsPage.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
};
