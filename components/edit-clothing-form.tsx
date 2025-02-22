import { SIZES, BASIC_COLORS } from "@/config/constants";
import { Category, ClothingItem } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { it } from "date-fns/locale";
import { CalendarIcon, ImageIcon, Trash } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import { ImageDropzone } from "./image-dropzone";
import { ImagePreview } from "./image-preview";
import { CropDialog } from "./crop-dialog";
import { useDropzone } from "react-dropzone";

function ExistingImagePreview({
    imageUrl,
    onRemove,
    onFileSelect,
}: {
    imageUrl: string;
    onRemove: () => void;
    onFileSelect: (file: File) => void;
}) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles[0]) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".webp"],
        },
        maxFiles: 1,
        multiple: false,
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "flex items-center gap-4 p-4 border rounded-2xl w-full transition-colors relative",
                isDragActive && "border-primary bg-primary/5 ring-2 ring-primary/20"
            )}>
            <input {...getInputProps()} />
            <div className="relative aspect-[2/3] w-24 flex-shrink-0 overflow-hidden rounded-xl border">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight mb-1">Immagine corrente</p>
                    <p className="text-xs text-muted-foreground">
                        Trascina qui una nuova immagine per sostituirla
                    </p>
                </div>
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}>
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
            {isDragActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-2xl backdrop-blur-sm">
                    <p className="text-primary font-medium">Rilascia per sostituire l'immagine</p>
                </div>
            )}
        </div>
    );
}

const formSchema = z.object({
    name: z.string().min(2, "Nome richiesto"),
    brand: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    category_id: z.string().min(1, "Categoria richiesta"),
    image_url: z.string().optional(),
    photoFile: z.any().optional(),
    notes: z.string().optional(),
    price: z.number().optional(),
    purchase_date: z.string().optional(),
    season: z.string().optional(),
});

export function EditClothingForm({
    className,
    onSubmit,
    isLoading,
    categories,
    item,
}: {
    className?: string;
    onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
    isLoading: boolean;
    categories: Category[];
    item: ClothingItem;
}) {
    const [upImg, setUpImg] = useState<string>();
    const [isCropping, setIsCropping] = useState(false);
    const [fileName, setFileName] = useState<string>("");

    const methods = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: item?.name || "",
            brand: item?.brand || "",
            size: item?.size || "",
            color: item?.color || "",
            category_id: item?.category_id || "",
            image_url: item?.image_url || "",
            notes: item?.notes || "",
            price: item?.price || 0,
            purchase_date: item?.purchase_date || "",
            season: item?.season || "",
        },
    });

    const onSelectFile = useCallback((file: File) => {
        setFileName(file.name);
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setUpImg(reader.result?.toString() || "");
            setIsCropping(true);
        });
        reader.readAsDataURL(file);
    }, []);

    const handleCropComplete = (file: File) => {
        methods.setValue("photoFile", file);
        setIsCropping(false);
        setUpImg(undefined);
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setUpImg(undefined);
        const input = document.getElementById("image-upload") as HTMLInputElement;
        if (input) input.value = "";
    };

    const handleRemoveCurrentImage = () => {
        methods.setValue("image_url", "");
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className={cn("space-y-6", className)}>
                <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                            control={methods.control}
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
                            control={methods.control}
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

                    <FormField
                        control={methods.control}
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
                        control={methods.control}
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
                                            onClick={() => field.onChange(color.name)}
                                        />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={methods.control}
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
                        <FormField
                            control={methods.control}
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

                        <FormField
                            control={methods.control}
                            name="purchase_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Data acquisto</FormLabel>
                                    <Popover modal={true}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}>
                                                    {field.value ? (
                                                        format(new Date(field.value), "PPP", {
                                                            locale: it,
                                                        })
                                                    ) : (
                                                        <span>Seleziona una data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    field.value ? new Date(field.value) : undefined
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={methods.control}
                        name="season"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stagione</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
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

                    <FormField
                        control={methods.control}
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Foto</label>
                        <div className="flex flex-col gap-4">
                            {methods.watch("photoFile") && !isCropping ? (
                                <ImagePreview
                                    file={methods.watch("photoFile")}
                                    onRemove={() => {
                                        methods.setValue("photoFile", undefined);
                                    }}
                                />
                            ) : methods.watch("image_url") ? (
                                <ExistingImagePreview
                                    imageUrl={methods.watch("image_url") || ""}
                                    onRemove={handleRemoveCurrentImage}
                                    onFileSelect={onSelectFile}
                                />
                            ) : (
                                <ImageDropzone onFileSelect={onSelectFile} />
                            )}
                        </div>
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Salvataggio..." : "Salva modifiche"}
                </Button>
            </form>

            {upImg && (
                <CropDialog
                    open={isCropping}
                    onOpenChange={setIsCropping}
                    image={upImg}
                    fileName={fileName}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </FormProvider>
    );
}
