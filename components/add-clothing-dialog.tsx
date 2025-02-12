import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
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
import { Camera, Image as ImageIcon, LoaderCircle, Plus, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { it } from "date-fns/locale";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const formSchema = z.object({
    name: z.string().min(2, "Nome richiesto"),
    brand: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    category_id: z.string().optional(),
    image_url: z.string().optional(),
    photoFile: z.any().optional(),
    notes: z.string().optional(),
    price: z.number().optional(),
    purchase_date: z.string().optional(),
    season: z.string().optional(),
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

// Add this utility function after imports
const compressImage = async (file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions if image is too large
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Canvas to Blob conversion failed"));
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: "%",
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

function CropDialog({
    open,
    onOpenChange,
    image,
    onCropComplete: onCropCompleteCallback,
    onCancel,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    image: string;
    onCropComplete: (file: File) => void;
    onCancel: () => void;
}) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>({
        unit: "px",
        x: 0,
        y: 0,
        width: 100,
        height: 150,
    });
    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 2 / 3));
    }

    const onCropComplete = async () => {
        if (!completedCrop || !imgRef.current) return;

        const canvas = document.createElement("canvas");
        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("No 2d context");
        }

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
                onCropCompleteCallback(file);
            }
        }, "image/jpeg");

        onOpenChange(false);
    };

    const getQualityInfo = (width: number, height: number) => {
        if (width < 300 || height < 450) {
            return {
                text: "Qualità molto bassa",
                color: "text-destructive",
                hint: "Seleziona un'area più grande",
            };
        }
        if (width < 500 || height < 750) {
            return {
                text: "Qualità bassa",
                color: "text-yellow-500",
                hint: "Aumenta l'area di selezione se possibile",
            };
        }
        return;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogPortal>
                <DialogOverlay className="bg-background/80 backdrop-blur-md z-[100]" />
                <DialogContent className="sm:max-w-lg z-[101]">
                    <DialogHeader>
                        <DialogTitle>Ritaglia l'immagine</DialogTitle>
                    </DialogHeader>
                    <div className="relative flex justify-center w-full overflow-hidden rounded-3xl border">
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={2 / 3}
                            ruleOfThirds
                            className="max-h-[60vh]"
                            renderSelectionAddon={() => {
                                if (!imgRef.current) return null;
                                const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
                                const actualWidth = Math.round(crop.width * scaleX);
                                const actualHeight = Math.round(crop.height * scaleX);

                                const qualityInfo = getQualityInfo(actualWidth, actualHeight);

                                return (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-lg text-sm flex flex-col items-center gap-1">
                                        <span className="block text-nowrap">
                                            {actualWidth} × {actualHeight}px
                                        </span>
                                        {qualityInfo && (
                                            <>
                                                <span className={cn("text-xs", qualityInfo.color)}>
                                                    {qualityInfo.text}
                                                </span>
                                                {qualityInfo.hint && (
                                                    <span className="text-xs opacity-75">
                                                        {qualityInfo.hint}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            }}>
                            <img
                                ref={imgRef}
                                src={image}
                                onLoad={onImageLoad}
                                className="max-h-[60vh] w-auto"
                            />
                        </ReactCrop>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Annulla
                        </Button>
                        <Button type="button" onClick={onCropComplete}>
                            Conferma
                        </Button>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
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
            notes: "",
            price: 0,
            purchase_date: "",
            season: "",
        },
    });

    const [upImg, setUpImg] = useState<string>();
    const [isCropping, setIsCropping] = useState(false);

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setUpImg(reader.result?.toString() || "");
                setIsCropping(true);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCropComplete = (file: File) => {
        form.setValue("photoFile", file);
        setIsCropping(false);
        setUpImg(undefined);
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setUpImg(undefined);
        const input = document.getElementById("image-upload") as HTMLInputElement;
        if (input) input.value = "";
    };

    const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
        const photoFile = data.photoFile as File;
        onSubmit({ ...data, photoFile });
    };

    return (
        <>
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
                                                        className="px-6 border border-input"
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
                                        <div className="grid grid-cols-9 gap-2">
                                            {BASIC_COLORS.map((color) => (
                                                <Button
                                                    key={color.value}
                                                    type="button"
                                                    variant="outline"
                                                    className={`w-full aspect-square h-auto rounded-full p-0 ${
                                                        field.value === color.name
                                                            ? "ring-2 ring-primary"
                                                            : ""
                                                    }`}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.name}
                                                    onClick={() =>
                                                        field.onChange(color.name)
                                                    }></Button>
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
                                    <FormLabel>Categoria</FormLabel>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category) => (
                                            <FormControl key={category.id}>
                                                <Button
                                                    type="button"
                                                    variant={
                                                        field.value === category.id
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    className="border border-input rounded-2xl"
                                                    onClick={() => field.onChange(category.id)}>
                                                    {category.name}
                                                </Button>
                                            </FormControl>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Campo: Notes */}
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Eventuali note" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Campo: Price */}
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prezzo</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    className="pl-8"
                                                />
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                                    €
                                                </span>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Campo: Purchase Date con Datepicker */}
                            <FormField
                                control={form.control}
                                name="purchase_date"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Data acquisto</FormLabel>
                                        <div className="relative">
                                            <Popover modal={true}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal rounded-2xl",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        type="button">
                                                        {field.value ? (
                                                            format(new Date(field.value), "PPP", {
                                                                locale: it,
                                                            })
                                                        ) : (
                                                            <span>Seleziona una data</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0 z-[9999] rounded-2xl bg-background"
                                                    align="start"
                                                    side="bottom"
                                                    sideOffset={4}>
                                                    <Calendar
                                                        locale={it}
                                                        mode="single"
                                                        selected={
                                                            field.value
                                                                ? new Date(field.value)
                                                                : undefined
                                                        }
                                                        onSelect={(date) =>
                                                            field.onChange(date?.toISOString())
                                                        }
                                                        disabled={(date) =>
                                                            date > new Date() ||
                                                            date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Campo: Season */}
                            <FormField
                                control={form.control}
                                name="season"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stagione</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-2xl">
                                                    <SelectValue placeholder="Seleziona stagione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="primavera">Primavera</SelectItem>
                                                <SelectItem value="estate">Estate</SelectItem>
                                                <SelectItem value="autunno">Autunno</SelectItem>
                                                <SelectItem value="inverno">Inverno</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Foto</label>
                            <div className="flex flex-col gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={onSelectFile}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full rounded-2xl"
                                        asChild>
                                        <span>
                                            <ImageIcon className="mr-2 h-4 w-4" />
                                            Carica un'immagine
                                        </span>
                                    </Button>
                                </label>

                                {form.watch("photoFile") && !isCropping && (
                                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border">
                                        <img
                                            src={URL.createObjectURL(form.watch("photoFile"))}
                                            className="w-full h-full object-cover"
                                            alt="Preview"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={() => {
                                                form.setValue("photoFile", undefined);
                                                const input = document.getElementById(
                                                    "image-upload"
                                                ) as HTMLInputElement;
                                                if (input) input.value = "";
                                            }}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Salvataggio..." : "Salva"}
                    </Button>
                </form>
            </Form>
            {upImg && (
                <CropDialog
                    open={isCropping}
                    onOpenChange={setIsCropping}
                    image={upImg}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </>
    );
}

export function AddClothingDialog({ categories, onClothingAdded }: AddClothingDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useMediaQuery("(max-width: 767px)");
    const { toast } = useToast();
    const supabase = createClient();

    const handleSubmit = async (data: FormData & { photoFile?: File }) => {
        try {
            setIsLoading(true);

            let image_url = "";

            if (data.photoFile) {
                // Compress the image before upload
                const compressedBlob = await compressImage(data.photoFile);
                const compressedFile = new File([compressedBlob], data.photoFile.name, {
                    type: "image/jpeg",
                });

                const fileName = `${Date.now()}-${compressedFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from("clothes")
                    .upload(fileName, compressedFile);

                if (uploadError) throw uploadError;

                const {
                    data: { publicUrl },
                } = supabase.storage.from("clothes").getPublicUrl(fileName);

                image_url = publicUrl;
            }

            const { photoFile, ...cleanData } = data;

            const cleanDataValues = Object.entries(cleanData).filter(([k, v]) => {
                console.log(v);
                return v;
            });

            let newClothingData = Object.fromEntries(cleanDataValues);

            const { data: newClothing, error } = await supabase
                .from("clothes")
                .insert([
                    {
                        ...newClothingData,
                        ...(image_url && { image_url }),
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

    if (!isMobile) {
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
                <div className="max-h-[85vh] overflow-y-auto">
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
