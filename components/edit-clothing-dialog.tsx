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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Category, ClothingItem } from "@/types";
import { createClient } from "@/utils/supabase/component";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(2, "Nome richiesto"),
    brand: z.string().min(2, "Brand richiesto"),
    size: z.string().min(1, "Taglia richiesta"),
    color: z.string().min(1, "Colore richiesto"),
    category_id: z.string().min(1, "Categoria richiesta"),
    image_url: z.string().optional(),
});

interface EditClothingDialogProps {
    item: ClothingItem | null;
    categories: Category[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (item: ClothingItem) => void;
}

function EditClothingForm({
    className,
    onSubmit,
    item,
    categories,
}: {
    className?: string;
    onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
    item: ClothingItem | null;
    categories: Category[];
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: item?.name || "",
            brand: item?.brand || "",
            size: item?.size || "",
            color: item?.color || "",
            category_id: item?.category_id || "",
            image_url: item?.image_url || "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", className)}>
                <div className="space-y-3">
                    <FormField
                        control={form.control}
                        name="category_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoria</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nome del capo" {...field} />
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
                                <FormLabel>Brand</FormLabel>
                                <FormControl>
                                    <Input placeholder="Brand" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Taglia</FormLabel>
                                <FormControl>
                                    <Input placeholder="Taglia" {...field} />
                                </FormControl>
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
                                <FormControl>
                                    <Input placeholder="Colore" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full">
                    Salva modifiche
                </Button>
            </form>
        </Form>
    );
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

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const { data, error } = await supabase
            .from("clothes")
            .update(values)
            .eq("id", item?.id)
            .select()
            .single();

        if (error) {
            toast({
                variant: "destructive",
                title: "Errore",
                description: "Impossibile modificare il capo",
            });
            return;
        }

        toast({
            title: "Capo modificato",
            description: "Il capo è stato modificato con successo",
        });

        onComplete(data);
        onOpenChange(false);
    };

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Modifica capo</DialogTitle>
                    </DialogHeader>
                    <EditClothingForm onSubmit={handleSubmit} item={item} categories={categories} />
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
                        item={item}
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
