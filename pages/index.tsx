import { PantsIcon, ShoesIcon, TShirtIcon } from "@/components/icons";
import Layout from "@/components/layout";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import useTextTransform from "@/hooks/use-text-transform";
import { useI18n } from "@/locales";
import { createClient } from "@/utils/supabase/server-props";
import dayjs from "dayjs";
import { GetServerSideProps } from "next";
import { Props } from "next/script";
import { ReactElement } from "react";

interface IHomeProps {
    weatherData: any;
    locale: string;
}

export const getServerSideProps: GetServerSideProps<IHomeProps> = async (context) => {
    const supabase = createClient(context);

    const { data, error } = await supabase.auth.getUser();

    if (error || !data) {
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }

    const weatherData = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHERAPI_API_KEY}&lang=it&q=chieti`
    ).then((r) => r.json());

    const { data: styles } = await supabase.from("styles").select("*");

    return {
        props: {
            styles,
            weatherData,
            locale: context.locale || "it",
        },
    };
};
export default function Home({ weatherData, locale }: IHomeProps) {
    const { temp_c, condition } = weatherData.current;

    const t = useI18n();

    const { cF } = useTextTransform();

    return (
        <>
            <span className="text-xl">{dayjs().format("MMMM D, YYYY")}</span>
            <h1 className="mb-5 text-4xl font-bold">I tuoi outfit suggeriti di oggi</h1>
            <p className="mb-5 text-lg">
                Il meteo oggi a {weatherData.location.name}, {weatherData.location.region} è al
                momento {temp_c}°C e {condition.text}.
            </p>
            {/* {styles?.map((style) => (
                <div key={style.id} className="mb-5">
                    <h2 className="mb-3 text-2xl font-bold">{cF(style.name)}</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Card>
                            <CardHeader className="flex-row gap-2 items-center">
                                <TShirtIcon />
                                <h2 className="text-xl font-bold mt-0">Top</h2>
                            </CardHeader>
                            <CardContent>React t-shirt</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row gap-2 items-center">
                                <PantsIcon />
                                <h2 className="text-xl font-bold mt-0">Bottom</h2>
                            </CardHeader>
                            <CardContent>Jeans strappati</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row gap-2 items-center">
                                <ShoesIcon />
                                <h2 className="text-xl font-bold mt-0">Shoes</h2>
                            </CardHeader>
                            <CardContent>Nike Air Max</CardContent>
                        </Card>
                    </div>
                </div>
            ))} */}
        </>
    );
}

Home.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
};
