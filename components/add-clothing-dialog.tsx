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
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";
import { Category, ClothingItem } from "@/types";
import { createClient } from "@/utils/supabase/component";
import { Plus } from "lucide-react";
import { useState } from "react";
import "react-image-crop/dist/ReactCrop.css";
import { AddClothingForm } from "./add-clothing-form";
import { compressImage } from "@/lib/utils";

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

            const cleanDataValues = Object.entries(cleanData).filter(([k, v]) => v);

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
            <DrawerContent className="rounded-t-3xl">
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
