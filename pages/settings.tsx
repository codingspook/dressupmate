import Layout from "@/components/layout";
import { title } from "@/components/primitives";
import { ReactElement, useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/component";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

// Importazione icone
import {
    UserCircle,
    Briefcase,
    Palette,
    Shirt,
    Sparkles,
    SunDim,
    CalendarDays,
    Heart,
    Check,
} from "lucide-react";

const formSchema = z.object({
    occupation: z.string().optional(),
    preferredStyle: z.string().optional(),
    formality: z.string().optional(),
    colorPreferences: z.string().optional(),
    seasonalPreferences: z.string().optional(),
    specialRequirements: z.string().optional(),
    name: z.string().optional(),
    gender: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Definizioni delle opzioni per i menu circolari
const circularMenuOptions = {
    personal: [
        { value: "male", label: "Uomo" },
        { value: "female", label: "Donna" },
        { value: "non-binary", label: "Non binario" },
        { value: "other", label: "Altro" },
    ],
    occupation: [
        { value: "office", label: "Ufficio/Business" },
        { value: "creative", label: "Lavoro creativo" },
        { value: "education", label: "Insegnamento" },
        { value: "healthcare", label: "Settore sanitario" },
        { value: "service", label: "Servizi" },
        { value: "tech", label: "Tecnologia/IT" },
        { value: "student", label: "Studente" },
        { value: "other", label: "Altro" },
    ],
    preferredStyle: [
        { value: "casual", label: "Casual" },
        { value: "sporty", label: "Sportivo" },
        { value: "elegant", label: "Elegante" },
        { value: "minimal", label: "Minimal" },
        { value: "streetwear", label: "Streetwear" },
        { value: "bohemian", label: "Boho" },
        { value: "vintage", label: "Vintage" },
        { value: "preppy", label: "Classico" },
    ],
    formality: [
        { value: "very_casual", label: "Molto casual" },
        { value: "casual", label: "Casual" },
        { value: "smart_casual", label: "Smart casual" },
        { value: "business_casual", label: "Business casual" },
        { value: "business", label: "Business" },
        { value: "formal", label: "Formale" },
    ],
    colorPreferences: [
        { value: "bright", label: "Vivaci" },
        { value: "pastel", label: "Pastello" },
        { value: "neutral", label: "Neutri" },
        { value: "dark", label: "Scuri" },
        { value: "monochrome", label: "Monocromo" },
    ],
    seasonalPreferences: [
        { value: "all", label: "Tutte" },
        { value: "spring", label: "Primavera" },
        { value: "summer", label: "Estate" },
        { value: "fall", label: "Autunno" },
        { value: "winter", label: "Inverno" },
    ],
};

export default function SettingsPage() {
    const { toast } = useToast();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [showNameInput, setShowNameInput] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            gender: "",
            occupation: "",
            preferredStyle: "",
            formality: "",
            colorPreferences: "",
            seasonalPreferences: "",
            specialRequirements: "",
        },
    });

    // Carica le preferenze esistenti dell'utente
    useEffect(() => {
        async function loadUserPreferences() {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) return;

                const { data: preferences, error } = await supabase
                    .from("user_preferences")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                if (error && error.code !== "PGRST116") {
                    // PGRST116 è l'errore per "nessun risultato", che è ok per nuovi utenti
                    console.error("Errore nel caricamento delle preferenze:", error);
                    return;
                }

                if (preferences) {
                    form.reset({
                        name: preferences.name || "",
                        gender: preferences.gender || "",
                        occupation: preferences.occupation || "",
                        preferredStyle: preferences.preferred_style || "",
                        formality: preferences.formality || "",
                        colorPreferences: preferences.color_preferences || "",
                        seasonalPreferences: preferences.seasonal_preferences || "",
                        specialRequirements: preferences.special_requirements || "",
                    });
                }
            } catch (error) {
                console.error("Errore durante il recupero delle preferenze:", error);
            }
        }

        loadUserPreferences();
    }, [supabase, form]);

    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true);

            // Ottieni l'utente corrente
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                toast({
                    title: "Errore",
                    description: "Devi effettuare l'accesso per salvare le preferenze",
                    variant: "destructive",
                });
                return;
            }

            // Salva le preferenze nel database
            const { error } = await supabase.from("user_preferences").upsert(
                {
                    user_id: user.id,
                    name: data.name,
                    gender: data.gender,
                    occupation: data.occupation,
                    preferred_style: data.preferredStyle,
                    formality: data.formality,
                    color_preferences: data.colorPreferences,
                    seasonal_preferences: data.seasonalPreferences,
                    special_requirements: data.specialRequirements,
                },
                { onConflict: "user_id" }
            );

            if (error) {
                throw error;
            }

            toast({
                title: "Preferenze salvate",
                description: "Le tue preferenze sono state salvate con successo",
            });

            setActiveSection(null);
        } catch (error) {
            toast({
                title: "Errore",
                description: "Impossibile salvare le preferenze",
                variant: "destructive",
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Componente di scheda informativa circolare
    const CircleInfoCard = ({
        icon,
        title,
        position,
        onClick,
        isActive,
        fieldName,
        value,
    }: {
        icon: React.ReactNode;
        title: string;
        position: string;
        onClick: () => void;
        isActive: boolean;
        fieldName: string;
        value: string;
    }) => {
        const positionClasses = {
            "top-left": "top-[15%] left-[25%]",
            top: "top-[5%] left-[50%] transform -translate-x-1/2",
            "top-right": "top-[15%] right-[25%]",
            "middle-left": "top-[50%] left-[5%] transform -translate-y-1/2",
            "middle-right": "top-[50%] right-[5%] transform -translate-y-1/2",
            "bottom-left": "bottom-[15%] left-[25%]",
            bottom: "bottom-[5%] left-[50%] transform -translate-x-1/2",
            "bottom-right": "bottom-[15%] right-[25%]",
        };

        const positionClass = positionClasses[position as keyof typeof positionClasses] || "";

        // Ottieni il label corrispondente al valore selezionato
        let selectedLabel = "";
        if (value && fieldName in circularMenuOptions) {
            const option = circularMenuOptions[fieldName as keyof typeof circularMenuOptions]?.find(
                (opt) => opt.value === value
            );
            if (option) selectedLabel = option.label;
        }

        return (
            <div
                className={`absolute ${positionClass} transition-all duration-300 cursor-pointer
                    ${isActive ? "z-20" : "hover:scale-105 z-10"}`}>
                <div
                    className={`
                        rounded-full w-16 h-16 flex items-center justify-center relative
                        ${
                            isActive
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "bg-card border border-border hover:border-primary"
                        }
                    `}
                    onClick={onClick}>
                    <div className="text-2xl">{icon}</div>

                    {/* Indicatore di valore selezionato */}
                    {value && !isActive && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                            <Check className="w-3 h-3" />
                        </div>
                    )}
                </div>

                <div className="text-center mt-2 font-medium text-sm flex flex-col items-center">
                    <span>{title}</span>
                    {value && !isActive && (
                        <span className="text-xs text-muted-foreground mt-1">{selectedLabel}</span>
                    )}
                </div>

                {/* Menu circolare di opzioni */}
                <AnimatePresence>
                    {isActive && fieldName !== "special" && fieldName !== "personal" && (
                        <CircularOptionMenu
                            fieldName={fieldName}
                            onSelect={(value) => {
                                form.setValue(fieldName as any, value);
                                // Salvataggio automatico dopo la selezione
                                setTimeout(() => {
                                    form.handleSubmit(onSubmit)();
                                }, 300);
                            }}
                            currentValue={value}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // Componente per il menu circolare di opzioni
    const CircularOptionMenu = ({
        fieldName,
        onSelect,
        currentValue,
    }: {
        fieldName: string;
        onSelect: (value: string) => void;
        currentValue: string;
    }) => {
        const options = circularMenuOptions[fieldName as keyof typeof circularMenuOptions] || [];
        const optionCount = options.length;

        return (
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                style={{ width: "220px", height: "220px" }}>
                {options.map((option, index) => {
                    // Calcola la posizione circolare
                    const angle = (index / optionCount) * Math.PI * 2;
                    const radius = 80; // Raggio in px
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                        <motion.div
                            key={option.value}
                            initial={{ x: 0, y: 0, opacity: 0 }}
                            animate={{
                                x,
                                y,
                                opacity: 1,
                                scale: currentValue === option.value ? 1.2 : 1,
                            }}
                            transition={{
                                delay: index * 0.05,
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                            }}
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer
                                ${currentValue === option.value ? "z-20" : "z-10"}
                            `}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(option.value);
                                setActiveSection(null);
                            }}>
                            <div
                                className={`
                                    w-12 h-12 rounded-full flex items-center justify-center
                                    ${
                                        currentValue === option.value
                                            ? "bg-primary text-primary-foreground shadow-lg"
                                            : "bg-card hover:bg-secondary border border-border"
                                    }
                                `}>
                                <span className="text-xs font-medium">{option.label}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        );
    };

    // Elementi delle informazioni
    const infoSections = [
        {
            id: "personal",
            title: "Profilo",
            icon: <UserCircle />,
            position: "top-left",
            fieldName: "gender",
            value: form.getValues().gender,
        },
        {
            id: "occupation",
            title: "Professione",
            icon: <Briefcase />,
            position: "top",
            fieldName: "occupation",
            value: form.getValues().occupation,
        },
        {
            id: "style",
            title: "Stile",
            icon: <Palette />,
            position: "top-right",
            fieldName: "preferredStyle",
            value: form.getValues().preferredStyle,
        },
        {
            id: "formality",
            title: "Formalità",
            icon: <Shirt />,
            position: "middle-right",
            fieldName: "formality",
            value: form.getValues().formality,
        },
        {
            id: "colors",
            title: "Colori",
            icon: <Sparkles />,
            position: "bottom-right",
            fieldName: "colorPreferences",
            value: form.getValues().colorPreferences,
        },
        {
            id: "season",
            title: "Stagioni",
            icon: <SunDim />,
            position: "bottom",
            fieldName: "seasonalPreferences",
            value: form.getValues().seasonalPreferences,
        },
        {
            id: "special",
            title: "Preferenze",
            icon: <Heart />,
            position: "bottom-left",
            fieldName: "specialRequirements",
            value: form.getValues().specialRequirements,
        },
    ];

    // Gestisci i casi speciali (nome e requisiti speciali)
    const handleSpecialSection = () => {
        if (activeSection === "personal") {
            return (
                <div className="my-6 transition-all duration-300 animate-fadeIn">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <UserCircle /> Profilo
                    </h3>

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Il tuo nome" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button
                            variant="outline"
                            className="mr-2"
                            onClick={() => setActiveSection(null)}>
                            Annulla
                        </Button>
                        <Button
                            type="submit"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isLoading}>
                            {isLoading ? "Salvataggio..." : "Salva"}
                        </Button>
                    </div>
                </div>
            );
        }

        if (activeSection === "special") {
            return (
                <div className="my-6 transition-all duration-300 animate-fadeIn">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Heart /> Preferenze speciali
                    </h3>

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="specialRequirements"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Requisiti speciali</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Es: Preferisco outfit comodi, evito tacchi alti, ecc."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Inserisci qualsiasi nota o preferenza specifica per la
                                        generazione del tuo outfit
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button
                            variant="outline"
                            className="mr-2"
                            onClick={() => setActiveSection(null)}>
                            Annulla
                        </Button>
                        <Button
                            type="submit"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isLoading}>
                            {isLoading ? "Salvataggio..." : "Salva"}
                        </Button>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="container mx-auto md:py-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className={title({ size: "sm" })}>Il tuo profilo</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card className="mb-6 p-4 relative">
                        <div className="relative h-[500px] overflow-hidden">
                            {/* Icona utente al centro */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                                <div
                                    className="w-32 h-32 rounded-full bg-secondary flex flex-col items-center justify-center shadow-xl border-4 border-background cursor-pointer"
                                    onClick={() => {
                                        if (form.getValues().name) {
                                            setShowNameInput(!showNameInput);
                                        } else {
                                            setActiveSection("personal");
                                        }
                                    }}>
                                    <UserCircle className="w-16 h-16 text-secondary-foreground" />
                                    {form.getValues().name && (
                                        <span className="text-sm font-medium mt-1">
                                            {form.getValues().name}
                                        </span>
                                    )}
                                </div>

                                {/* Anello decorativo */}
                                <div className="absolute top-1/2 left-1/2 w-[280px] h-[280px] border-2 border-dashed border-muted-foreground rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
                            </div>

                            {/* Cards circolari intorno all'icona utente */}
                            {infoSections.map((section) => (
                                <CircleInfoCard
                                    key={section.id}
                                    icon={section.icon}
                                    title={section.title}
                                    position={section.position}
                                    onClick={() =>
                                        setActiveSection(
                                            activeSection === section.id ? null : section.id
                                        )
                                    }
                                    isActive={activeSection === section.id}
                                    fieldName={section.fieldName}
                                    value={section.value ?? ""}
                                />
                            ))}

                            {/* Input del nome che appare quando si clicca sull'icona utente */}
                            <AnimatePresence>
                                {showNameInput && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="absolute top-[65%] left-1/2 transform -translate-x-1/2 z-40 bg-card p-3 rounded-lg shadow-lg border border-border w-72">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Il tuo nome</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nome" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-end mt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mr-2"
                                                onClick={() => setShowNameInput(false)}>
                                                Annulla
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    form.handleSubmit(onSubmit)();
                                                    setShowNameInput(false);
                                                }}>
                                                Salva
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Gestisce i casi speciali */}
                        {handleSpecialSection()}

                        {!activeSection && !showNameInput && (
                            <div className="text-center mt-6 text-muted-foreground">
                                <p>Seleziona un&apos;opzione per modificare le tue preferenze</p>

                                {form.getValues().name && (
                                    <p className="mt-4 font-medium text-foreground">
                                        Ciao {form.getValues().name}! Personalizza il tuo profilo
                                        per outfit più adatti a te.
                                    </p>
                                )}

                                <Button
                                    variant="default"
                                    className="mt-6"
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={isLoading}>
                                    {isLoading ? "Salvataggio..." : "Salva tutte le preferenze"}
                                </Button>
                            </div>
                        )}
                    </Card>
                </form>
            </Form>
        </div>
    );
}

SettingsPage.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
};
