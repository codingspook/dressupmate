import { Category } from "@/types";
import { title } from "@/components/primitives";
import { createClient as createServerClient } from "@/utils/supabase/server-props";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";

import { GetServerSidePropsContext } from "next";
import { ReactElement, useState } from "react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/component";
import { useMediaQuery } from "@/hooks/use-media-query";

interface CategoriesPageProps {
    categories: Category[];
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const supabase = createServerClient(context);
    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("is_editable", true)
        .order("order");

    return {
        props: {
            categories: categories || [],
        },
    };
};

export default function CategoriesPage({ categories: initialCategories }: CategoriesPageProps) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const { toast } = useToast();

    const isMobile = useMediaQuery("(max-width: 767px)");

    const supabase = createClient();

    const updateOrder = async (reorderedItems: Category[]) => {
        const updates = reorderedItems.map((item, index) => ({
            id: item.id,
            name: item.name,
            order: index,
        }));

        const { error } = await supabase.from("categories").upsert(updates);

        if (error) {
            toast({
                title: "Errore",
                description: "Errore durante il riordinamento",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;

        const supabase = createClient();

        try {
            if (editingCategory) {
                const { data, error } = await supabase
                    .from("categories")
                    .update({ name, description })
                    .eq("id", editingCategory.id)
                    .select()
                    .single();

                if (error) throw error;

                setCategories((prev) =>
                    prev.map((cat) => (cat.id === editingCategory.id ? data : cat))
                );
                toast({ title: "Categoria aggiornata con successo" });
            } else {
                const { data, error } = await supabase
                    .from("categories")
                    .insert({ name })
                    .select()
                    .single();

                if (error) throw error;

                setCategories((prev) => [...prev, data]);
                toast({ title: "Categoria creata con successo" });
            }

            setIsOpen(false);
            setEditingCategory(null);
        } catch (error) {
            toast({
                title: "Errore",
                description: "Si è verificato un errore durante il salvataggio",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (category: Category) => {
        const supabase = createClient();

        try {
            const { error } = await supabase.from("categories").delete().eq("id", category.id);

            if (error) throw error;

            setCategories((prev) => prev.filter((cat) => cat.id !== category.id));
            toast({ title: "Categoria eliminata con successo" });
        } catch (error) {
            toast({
                title: "Errore",
                description: "Si è verificato un errore durante l'eliminazione",
                variant: "destructive",
            });
        } finally {
            setCategoryToDelete(null);
        }
    };

    return (
        <div className="container md:py-8 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className={title({ size: "sm" })}>Gestione Categorie</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="flex-none"
                            onClick={() => setEditingCategory(null)}
                            size={isMobile ? "icon" : "default"}>
                            <PlusIcon className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Aggiungi categoria</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? "Modifica Categoria" : "Nuova Categoria"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={editingCategory?.name}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                {editingCategory ? "Aggiorna" : "Crea"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Reorder.Group
                axis="y"
                values={categories}
                onReorder={(newOrder) => {
                    setCategories(newOrder);
                    updateOrder(newOrder);
                }}
                className="space-y-3">
                {categories.map((category) => (
                    <Reorder.Item
                        key={category.id}
                        value={category}
                        className="flex items-center p-4 rounded-2xl border bg-card shadow-sm">
                        <GripVertical className="w-5 h-5 mr-4 cursor-grab active:cursor-grabbing text-muted-foreground" />
                        <div className="flex-1">
                            <h3 className="font-medium">{category.name}</h3>
                        </div>
                        <div className="flex space-x-2 ml-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setEditingCategory(category);
                                    setIsOpen(true);
                                }}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCategoryToDelete(category)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {categoryToDelete && (
                <ConfirmDeleteDialog
                    open={!!categoryToDelete}
                    onOpenChange={(open) => !open && setCategoryToDelete(null)}
                    onConfirm={() => categoryToDelete && handleDelete(categoryToDelete)}
                    title="Sei sicuro di voler eliminare questa categoria?"
                    description={`Questa azione non può essere annullata. La categoria "${categoryToDelete.name}" verrà eliminata permanentemente.`}
                />
            )}
        </div>
    );
}

CategoriesPage.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
};
