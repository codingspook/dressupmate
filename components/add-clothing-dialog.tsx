import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BASIC_COLORS, SIZES } from "@/config/constants";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";
import { Category, ClothingItem } from "@/types";
import { createClient } from "@/utils/supabase/component";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Image, Plus, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const formSchema = z.object({
    name: z.string().min(2, "Nome richiesto"),
    brand: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    category_id: z.string().optional(),
    image_url: z.string().optional(),
    photoFile: z.any().optional(),
});

interface FormData {
    name: string;
    category_id?: string;
    brand?: string;
    size?: string;
    color?: string;
    photoFile?: File; // additional type for the photo file
}

interface AddClothingDialogProps {
    categories: Category[];
    onClothingAdded?: (newClothing: ClothingItem) => void;
}

function AddClothingForm({
    className,
    onSubmit,
    isLoading,
    categories,
}: {
    className?: string;
    onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
    isLoading: boolean;
    categories: Category[];
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            brand: "",
            size: "",
            color: "",
            category_id: "",
            image_url: "",
        },
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [isPhoto, setIsPhoto] = useState(false);

    const startCamera = async () => {
        setIsCameraLoading(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(stream);
            setShowCamera(true);
        } catch (err) {
            console.error("Errore nell'accesso alla fotocamera:", err);
        } finally {
            setIsCameraLoading(false);
        }
    };

    useEffect(() => {
        if (showCamera && videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [showCamera]);

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

            const photoUrl = canvas.toDataURL("image/jpeg");
            setPhotoPreview(photoUrl);

            // Converti il dataURL in File
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
                    form.setValue("photoFile", file as any);
                }
            }, "image/jpeg");

            // Ferma la fotocamera
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            setShowCamera(false);
            setIsPhoto(true);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                form.setValue("photoFile", file);
            };
            reader.readAsDataURL(file);
            setIsPhoto(false);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDeletePhoto = () => {
        setPhotoPreview(null);
        form.setValue("photoFile", undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // reset dell'input file
        }
        setIsPhoto(false);
        if (stream) {
            stream.getTracks().forEach((track) => track.stop()); // ferma la fotocamera se attiva
        }
        setStream(null);
        setShowCamera(false);
    };

    const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
        const photoFile = data.photoFile as File;
        onSubmit({ ...data, photoFile });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className={`space-y-4 ${className}`}>
                <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome capo*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Es: Camicia bianca" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Marca</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Es: Nike" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid gap-4">
                        <FormField
                            control={form.control}
                            name="size"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel>Taglia</FormLabel>
                                    <div className="flex flex-wrap gap-2">
                                        {SIZES.map((size) => (
                                            <FormControl key={size.value}>
                                                <Button
                                                    type="button"
                                                    variant={
                                                        field.value === size.value
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    className={`px-6`}
                                                    onClick={() => field.onChange(size.value)}>
                                                    {size.label}
                                                </Button>
                                            </FormControl>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Colore</FormLabel>
                                    <div className="grid grid-cols-5 gap-2">
                                        {BASIC_COLORS.map((color) => (
                                            <Button
                                                key={color.value}
                                                type="button"
                                                variant="outline"
                                                className={`w-full h-10 p-0 ${
                                                    field.value === color.name
                                                        ? "ring-2 ring-primary"
                                                        : ""
                                                }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                                onClick={() => field.onChange(color.name)}></Button>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="category_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoria*</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleziona categoria" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Foto</label>
                        {showCamera ? (
                            <div className="relative aspect-video">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    className="w-full h-[300px] object-cover rounded-2xl border"
                                />
                                <Button
                                    className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-2xl size-12 border-2 border-white p-0.5 bg-transparent"
                                    type="button"
                                    onClick={capturePhoto}>
                                    <span className="sr-only">Cattura foto</span>
                                    <span className="size-full flex items-center justify-center bg-white rounded-2xl">
                                        <Camera size={24} />
                                    </span>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {photoPreview ? (
                                    <div className="relative">
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-full h-[300px] object-cover rounded-2xl border"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-30% to-transparent bg-opacity-0.5" />
                                        <Button
                                            type="button"
                                            onClick={handleDeletePhoto}
                                            variant="default"
                                            size="icon"
                                            className="absolute top-2 right-2">
                                            <Trash size={16} />
                                        </Button>
                                        <div className="absolute bottom-0 left-0 right-0 flex gap-2 justify-center p-4">
                                            {isPhoto ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setPhotoPreview(null);
                                                        startCamera();
                                                    }}>
                                                    <Camera size={16} />
                                                    Scatta un&apos; altra foto
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    onClick={triggerFileUpload}>
                                                    <Image size={16} />
                                                    Cambia immagine
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-[300px] border rounded-2xl flex items-center justify-center">
                                        {isCameraLoading ? (
                                            <div className="flex flex-col items-center gap-2 bg-gray-900">
                                                <div className="animate-spin rounded-2xl h-8 w-8 border-b-2 border-gray-900" />
                                                <p>Caricamento fotocamera...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4">
                                                <Button
                                                    type="button"
                                                    onClick={startCamera}
                                                    variant="outline"
                                                    className="gap-2">
                                                    <Camera size={24} />
                                                    Scatta una foto
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={triggerFileUpload}
                                                    variant="ghost"
                                                    className="gap-2">
                                                    <Image />
                                                    Carica un&apos;immagine
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Salvataggio..." : "Salva"}
                </Button>
            </form>
        </Form>
    );
}

export function AddClothingDialog({ categories, onClothingAdded }: AddClothingDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const isMobile = useMediaQuery("(max-width: 767px)");
    const { toast } = useToast();
    const supabase = createClient();

    const handleSubmit = async (data: FormData & { photoFile?: File }) => {
        try {
            setIsLoading(true);

            let image_url = "";

            if (data.photoFile) {
                const fileName = `${Date.now()}-${data.photoFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from("clothes")
                    .upload(fileName, data.photoFile);

                if (uploadError) throw uploadError;

                const {
                    data: { publicUrl },
                } = supabase.storage.from("clothes").getPublicUrl(fileName);

                image_url = publicUrl;
            }

            const { photoFile, ...cleanData } = data;

            const { data: newClothing, error } = await supabase
                .from("clothes")
                .insert([
                    {
                        ...cleanData,
                        image_url,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            setOpen(false);
            toast({ title: "Capo aggiunto" });
            if (onClothingAdded && newClothing) {
                onClothingAdded(newClothing);
            }
        } catch (error) {
            toast({
                title: "Errore",
                description: "Si è verificato un errore durante il salvataggio",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const Trigger = (
        <Button className="flex-none" size={isMobile ? "icon" : "default"}>
            <Plus size={16} />
            <span className="hidden md:inline">Aggiungi capo</span>
        </Button>
    );

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{Trigger}</DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Aggiungi nuovo capo</DialogTitle>
                        <DialogDescription>
                            Inserisci i dettagli del nuovo capo da aggiungere al tuo guardaroba.
                        </DialogDescription>
                    </DialogHeader>
                    <AddClothingForm
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        categories={categories}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{Trigger}</DrawerTrigger>
            <DrawerContent>
                <div className="max-h-[80vh] overflow-y-auto">
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Aggiungi nuovo capo</DrawerTitle>
                        <DialogDescription>
                            Inserisci i dettagli del nuovo capo da aggiungere al tuo guardaroba.
                        </DialogDescription>
                    </DrawerHeader>
                    <AddClothingForm
                        className="px-4"
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        categories={categories}
                    />
                    <DrawerFooter className="pt-2">
                        <DrawerClose asChild>
                            <Button variant="outline">Annulla</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
