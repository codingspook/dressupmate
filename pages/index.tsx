import { PantsIcon, ShoesIcon, TShirtIcon } from "@/components/icons";
import Layout from "@/components/layout";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import useTextTransform from "@/hooks/use-text-transform";
import { useI18n } from "@/locales";
import { createClient } from "@/utils/supabase/server-props";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { ReactElement, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ClothingItem } from "@/types";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { promises as fs } from "fs";
import { LoaderCircle, SendIcon } from "lucide-react";
import { AuroraText } from "@/components/ui/aurora-text";
import { ButtonAurora } from "@/components/ui/button-aurora";
import { MagicCard } from "@/components/ui/magic-card";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { motion } from "framer-motion";
import { Marquee } from "@/components/ui/marquee";

interface IHomeProps {
    weatherData: any;
    locale: string;
}

interface IOutfit {
    top: ClothingItem;
    bottom: ClothingItem;
    shoes: ClothingItem;
    description?: string;
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

    const file = await fs.readFile(process.cwd() + "/weather/weather-conditions.json", "utf8");
    const weatherConditions = JSON.parse(file);

    const conditionIconCode = weatherConditions.find(
        (c: any) => c.code === weatherData.current.condition.code
    ).icon;

    const iconsMapFile = await fs.readFile(
        process.cwd() + "/weather/weather-icons-mapping.json",
        "utf8"
    );
    const iconsMap = JSON.parse(iconsMapFile);

    const iconPath = `/weather-icons/${
        iconsMap[conditionIconCode][weatherData.current.is_day ? "day" : "night"]
    }`;

    weatherData.current.condition = {
        ...weatherData.current.condition,
        icon: iconPath,
    };

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
    const { temp_c, condition, is_day } = weatherData.current;

    const t = useI18n();

    const { cF } = useTextTransform();

    const [occasion, setOccasion] = useState("");
    const [outfit, setOutfit] = useState<null | IOutfit>(null);
    const [loading, setLoading] = useState(false);

    const generateOutfit = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/generate-outfit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    weather: `${temp_c}°C, ${condition.text}`,
                    occasion,
                }),
            });
            const data = await response.json();
            console.log(data);

            setOutfit(data);
        } catch (error) {
            console.error("Failed to generate outfit:", error);
        } finally {
            setLoading(false);
        }
    };

    const [isMarquee, setIsMarquee] = useState(false);

    return (
        <>
            <Head>
                <title>Home - DressUpMate</title>
            </Head>
            <div className="flex place-content-center place-items-center flex-col min-h-[calc(100svh-11.5rem)]">
                <span className="text-2xl mb-4">
                    {format(new Date(), "dd MMMM yyyy", { locale: it }).replace(
                        /^\w|\s\w/g,
                        (letter) => letter.toUpperCase()
                    )}
                </span>
                <h1 className="text-center font-bold tracking-tighter text-6xl lg:text-7xl mb-8">
                    Cosa <AuroraText>indosserai</AuroraText> oggi?
                </h1>
                {/* <p className="mb-5 text-lg">
                Il meteo oggi a {weatherData.location.name}, {weatherData.location.region} è al
                momento {temp_c}°C e {condition.text}.
            </p> */}
                <div className="flex items-center gap-4 hover:scale-110 transition-all duration-300 transform-gpu will-change-transform mb-5">
                    <Image
                        className="size-24"
                        src={condition.icon}
                        alt={condition.text}
                        width={85}
                        height={85}
                    />
                    <div className="flex-none">
                        <div className="text-2xl font-bold">{temp_c}°C</div>
                        <span>{condition.text}</span>
                        <div className="text-white/50 text-sm">
                            {weatherData.location.name}, {weatherData.location.region}
                        </div>
                    </div>
                </div>

                <MagicCard
                    gradientColor="#9E7AFF"
                    gradientFrom="#9E7AFF"
                    gradientTo="#FE8BBB"
                    gradientOpacity={0.2}
                    className="rounded-3xl p-2 w-full max-w-md items-center">
                    <div className="flex gap-4 items-center">
                        <Input
                            wrapperClassName="flex-1"
                            className="h-12 w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Per quale occasione? (es. lavoro, festa, casual...)"
                            value={occasion}
                            onChange={(e) => setOccasion(e.target.value)}
                        />
                        <ButtonAurora
                            className="bg-transparent text-white size-11"
                            onClick={generateOutfit}
                            neonColors={{
                                firstColor: "hsl(var(--color-1))",
                                secondColor: "hsl(var(--color-2))",
                                thirdColor: "hsl(var(--color-3))",
                            }}
                            disabled={loading}>
                            {loading ? <LoaderCircle className="animate-spin" /> : <SendIcon />}
                        </ButtonAurora>
                    </div>
                </MagicCard>
                {outfit && (
                    <div className="mb-5">
                        {outfit.description && (
                            <p className="mb-4 text-lg italic text-gray-600">
                                {outfit.description}
                            </p>
                        )}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Card>
                                <CardHeader className="flex-row items-center gap-2">
                                    <TShirtIcon />
                                    <h2 className="mt-0 text-xl font-bold">Top</h2>
                                </CardHeader>
                                <CardContent>
                                    {outfit.top.image_url ? (
                                        <img
                                            className="rounded-xl"
                                            src={outfit.top.image_url}
                                            alt={outfit.top.name}
                                        />
                                    ) : (
                                        <Skeleton className="aspect-[2/3] rounded-xl" />
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex-row items-center gap-2">
                                    <PantsIcon />
                                    <h2 className="mt-0 text-xl font-bold">Bottom</h2>
                                </CardHeader>
                                <CardContent>
                                    {outfit.bottom.image_url ? (
                                        <img
                                            className="rounded-xl"
                                            src={outfit.bottom.image_url}
                                            alt={outfit.bottom.name}
                                        />
                                    ) : (
                                        <Skeleton className="aspect-[2/3] rounded-xl" />
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex-row items-center gap-2">
                                    <ShoesIcon />
                                    <h2 className="mt-0 text-xl font-bold">Shoes</h2>
                                </CardHeader>
                                <CardContent>
                                    {outfit.shoes.image_url ? (
                                        <img
                                            className="rounded-xl"
                                            src={outfit.shoes.image_url}
                                            alt={outfit.shoes.name}
                                        />
                                    ) : (
                                        <Skeleton className="aspect-[2/3] rounded-xl" />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Home.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
};
