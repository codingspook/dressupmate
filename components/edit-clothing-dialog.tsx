import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";
import { Category, ClothingItem } from "@/types";
import { createClient } from "@/utils/supabase/component";
import { useState } from "react";
import { compressImage } from "@/lib/utils";
import { EditClothingForm } from "./edit-clothing-form";
import { z } from "zod";

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

interface EditClothingDialogProps {
    item: ClothingItem | null;
    categories: Category[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (item: ClothingItem) => void;
}

export function EditClothingDialog({
    item,
    categories,
    open,
    onOpenChange,
    onComplete,
}: EditClothingDialogProps) {
    const { toast } = useToast();
    const supabase = createClient();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            let image_url = values.image_url;

            if (values.photoFile) {
                const compressedBlob = await compressImage(values.photoFile);
                const compressedFile = new File([compressedBlob], values.photoFile.name, {
                    type: "image/jpeg",
                });

                const fileName = `${Date.now()}-${compressedFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from("clothes")
                    .upload(fileName, compressedFile);

                if (uploadError) throw uploadError;

                const {
                    data: { publicUrl },
                } = supabase.storage.from("clothes").getPublicUrl(fileName);

                image_url = publicUrl;
            }

            const { photoFile, ...cleanData } = values;
            const cleanDataValues = Object.entries(cleanData).filter(([k, v]) => v);
            let updateData = Object.fromEntries(cleanDataValues);

            const { data, error } = await supabase
                .from("clothes")
                .update({
                    ...updateData,
                    ...(image_url && { image_url }),
                })
                .eq("id", item?.id)
                .select()
                .single();

            if (error) throw error;

            toast({
                title: "Capo modificato",
                description: "Il capo è stato modificato con successo",
            });

            onComplete(data);
            onOpenChange(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Errore",
                description: "Impossibile modificare il capo",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Modifica capo</DialogTitle>
                    </DialogHeader>
                    <EditClothingForm
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        item={item as ClothingItem}
                        categories={categories}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <div className="max-h-[80vh] overflow-y-auto">
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Modifica capo</DrawerTitle>
                    </DrawerHeader>
                    <EditClothingForm
                        className="px-4"
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        item={item as ClothingItem}
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
