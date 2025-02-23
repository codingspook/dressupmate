import { SIZES, BASIC_COLORS } from "@/config/constants";
import { Category } from "@/types";
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
import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogPortal,
    DialogOverlay,
} from "./ui/dialog";
import { ReactCrop, centerCrop, makeAspectCrop, type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ImageDropzone } from "./image-dropzone";
import { ImagePreview } from "./image-preview";
import { CropDialog } from "./crop-dialog";

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

export function AddClothingForm({
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
    const methods = useForm<z.infer<typeof formSchema>>({
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
    const [fileName, setFileName] = useState<string>("");

    const onSelectFile = useCallback((file: File) => {
        setFileName(file.name); // Salva il nome del file
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

    const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
        const photoFile = data.photoFile as File;
        onSubmit({ ...data, photoFile });
    };

    return (
        <>
            <FormProvider {...methods}>
                <form
                    onSubmit={methods.handleSubmit(handleFormSubmit)}
                    className={`space-y-4 ${className}`}>
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

                        <div className="grid gap-4">
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
                            {/* Campo: Notes */}
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
                            {/* Campo: Price */}
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
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Campo: Purchase Date con Datepicker */}
                            <FormField
                                control={methods.control}
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
                                control={methods.control}
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
                                                <SelectItem value="spring">Primavera</SelectItem>
                                                <SelectItem value="summer">Estate</SelectItem>
                                                <SelectItem value="fall">Autunno</SelectItem>
                                                <SelectItem value="winter">Inverno</SelectItem>
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
                                {methods.watch("photoFile") && !isCropping ? (
                                    <ImagePreview
                                        file={methods.watch("photoFile")}
                                        onRemove={() => {
                                            methods.setValue("photoFile", undefined);
                                        }}
                                    />
                                ) : (
                                    <ImageDropzone onFileSelect={onSelectFile} />
                                )}
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Salvataggio..." : "Salva"}
                    </Button>
                </form>
            </FormProvider>
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
        </>
    );
}
