import { AddClothingDialog } from "@/components/add-clothing-dialog";
import { ClothesGrid } from "@/components/clothes-grid";
import { EditClothingDialog } from "@/components/edit-clothing-dialog";
import Layout from "@/components/layout";
import { title } from "@/components/primitives";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Category, ClothingItem } from "@/types";
import { createClient as createServerClient } from "@/utils/supabase/server-props";
import { createClient } from "@/utils/supabase/component";
import { GetServerSidePropsContext } from "next";
import { ReactElement, useState, useEffect, useRef } from "react";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

interface ClosetPageProps {
    categories: Category[];
    clothes: Record<string, ClothingItem[]>;
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const supabase = createServerClient(context);

    const { data: categories } = await supabase.from("categories").select("*").order("order");
    const { data: clothes } = await supabase.from("clothes").select("*");

    // Inizializza l'oggetto clothesByCategory con array vuoti per ogni categoria
    const clothesByCategory = categories?.reduce((acc, category) => {
        acc[category.id] = [];
        return acc;
    }, {});

    // Popola le categorie con i vestiti corrispondenti
    clothes?.forEach((item) => {
        if (clothesByCategory[item.category_id]) {
            clothesByCategory[item.category_id].push(item);
        }
    });

    return {
        props: {
            categories: categories || [],
            clothes: clothesByCategory || {},
        },
    };
};

export default function ClosetPage({ categories, clothes: initialClothes }: ClosetPageProps) {
    const [clothes, setClothes] = useState<ClosetPageProps["clothes"]>(initialClothes);
    const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
    const supabase = createClient();
    const { toast } = useToast();
    const [showLeftShadow, setShowLeftShadow] = useState(false);
    const [showRightShadow, setShowRightShadow] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            const container = e.target as HTMLDivElement;
            const isStart = container.scrollLeft <= 0;
            const isEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;

            setShowLeftShadow(!isStart);
            setShowRightShadow(!isEnd);
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            // Trigger initial check
            handleScroll({ target: container } as any);
        }

        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    const handleClothingAdded = (newClothing: ClothingItem) => {
        setClothes((prev) => {
            const newClothes = { ...prev };
            const categoryId = newClothing.category_id;
            if (categoryId && !newClothes[categoryId]) {
                newClothes[categoryId] = [];
            }
            if (categoryId) {
                newClothes[categoryId] = [...newClothes[categoryId], newClothing];
            }
            return newClothes;
        });
    };

    const handleEdit = (item: ClothingItem) => {
        setEditingItem(item);
    };

    const handleDelete = async (item: ClothingItem) => {
        const { error } = await supabase.from("clothes").delete().eq("id", item.id);

        if (error) {
            toast({
                variant: "destructive",
                title: "Errore",
                description: "Errore durante l'eliminazione del capo",
            });
            return;
        }

        setClothes((prev) => {
            const newClothes = { ...prev };
            if (item.category_id) {
                newClothes[item.category_id] = newClothes[item.category_id].filter(
                    (i) => i.id !== item.id
                );
            }
            return newClothes;
        });

        toast({
            title: "Capo eliminato",
            description: "Il capo è stato eliminato con successo",
        });
        setItemToDelete(null);
    };

    const handleEditComplete = (updatedItem: ClothingItem) => {
        setClothes((prev) => {
            const newClothes = { ...prev };
            const categoryId = updatedItem.category_id;

            // Se la categoria è cambiata, rimuovi dall'vecchia categoria
            if (editingItem && editingItem.category_id && editingItem.category_id !== categoryId) {
                newClothes[editingItem.category_id] = newClothes[editingItem.category_id].filter(
                    (i) => i.id !== updatedItem.id
                );
            }

            // Aggiorna o aggiungi alla nuova categoria
            if (categoryId && !newClothes[categoryId]) {
                newClothes[categoryId] = [];
            }

            if (categoryId) {
                const index = newClothes[categoryId].findIndex((i) => i.id === updatedItem.id);
                if (index !== -1) {
                    newClothes[categoryId][index] = updatedItem;
                } else {
                    newClothes[categoryId].push(updatedItem);
                }
            }

            return newClothes;
        });

        setEditingItem(null);
    };

    const handleTabClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        button.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    };

    return (
        <div className="container md:py-8 mx-auto">
            <div className="flex items-center justify-between">
                <h1 className={title({ size: "sm" })}>Il mio guardaroba</h1>
                <AddClothingDialog categories={categories} onClothingAdded={handleClothingAdded} />
            </div>

            <Tabs defaultValue={categories[0]?.id} className="mt-6">
                <div className="relative">
                    <div
                        className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
                            showLeftShadow ? "opacity-100" : "opacity-0"
                        }`}
                    />
                    <div
                        className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
                            showRightShadow ? "opacity-100" : "opacity-0"
                        }`}
                    />
                    <div ref={scrollContainerRef} className="flex gap-4 overflow-auto no-scrollbar">
                        <TabsList className="gap-1 bg-transparent">
                            {categories.map((category) => (
                                <TabsTrigger
                                    key={category.id}
                                    value={category.id}
                                    onClick={handleTabClick}
                                    className="group flex-1 p-3 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-2xl gap-2">
                                    {category.name}
                                    {clothes[category.id]?.length > 0 && (
                                        <Badge className="min-w-[1.375rem] px-1 transition-opacity group-data-[state=inactive]:opacity-50 flex-none text-center flex justify-center">
                                            {clothes[category.id]?.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </div>

                {categories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="mt-8">
                        <ClothesGrid
                            items={clothes[category.id] || []}
                            onEdit={handleEdit}
                            onDelete={setItemToDelete}
                        />
                    </TabsContent>
                ))}
            </Tabs>
            <EditClothingDialog
                item={editingItem}
                categories={categories}
                open={!!editingItem}
                onOpenChange={(open) => !open && setEditingItem(null)}
                onComplete={handleEditComplete}
            />
            {itemToDelete && (
                <ConfirmDeleteDialog
                    open={!!itemToDelete}
                    onOpenChange={(open) => !open && setItemToDelete(null)}
                    onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
                    title="Sei sicuro di voler eliminare questo capo?"
                    description={`Questa azione non può essere annullata. Il capo "${itemToDelete.name}" verrà eliminato permanentemente.`}
                />
            )}
        </div>
    );
}

ClosetPage.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
};
