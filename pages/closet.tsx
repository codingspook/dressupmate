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
import { Button } from "@/components/ui/button";
import { ChevronDown, HeartIcon } from "lucide-react"; // Aggiungi questo import
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmptyList from "@/components/empty-list";
import { cn } from "@/lib/utils";

interface ClosetPageProps {
    categories: Category[];
    clothes: Record<string, ClothingItem[]>;
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const supabase = createServerClient(context);

    const { data: categories } = await supabase.from("categories").select("*").order("order");
    const { data: clothes } = await supabase
        .from("clothes")
        .select("*")
        .order("created_at", { ascending: false });

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
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categories[0]?.id);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [shouldPreventClick, setShouldPreventClick] = useState(false);
    const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [favorites, setFavorites] = useState<ClothingItem[]>([]);
    const [currentView, setCurrentView] = useState<"wardrobe" | "favorites">("wardrobe");

    useEffect(() => {
        // Inizializza i preferiti dal clothes iniziale
        const allClothes = Object.values(initialClothes).flat();
        const initialFavorites = allClothes.filter((item) => item.is_favorite);
        setFavorites(initialFavorites);
    }, [initialClothes]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
        setIsDragging(true);
        setShouldPreventClick(false);
        setStartX(e.clientX - container.offsetLeft);
        setScrollLeft(container.scrollLeft);
        container.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || !dragStartPosRef.current) return;

        const deltaX = Math.abs(e.clientX - dragStartPosRef.current.x);
        const deltaY = Math.abs(e.clientY - dragStartPosRef.current.y);

        // Se il movimento è significativo, previeni il click
        if (deltaX > 5 || deltaY > 5) {
            setShouldPreventClick(true);
        }

        const container = scrollContainerRef.current;
        if (!container) return;

        e.preventDefault();
        const x = e.clientX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(false);
        dragStartPosRef.current = null;
        if (scrollContainerRef.current) {
            scrollContainerRef.current.releasePointerCapture(e.pointerId);
        }
    };

    const handleTabChange = (value: string) => {
        if (shouldPreventClick) {
            setShouldPreventClick(false);
            return;
        }
        setSelectedCategory(value);
    };

    const handleScroll = (scrollLeft: number) => {
        const container = scrollContainerRef.current;
        if (container) {
            const isStart = scrollLeft <= 0;
            const isEnd = scrollLeft + container.clientWidth >= container.scrollWidth - 1;
            setShowLeftShadow(!isStart);
            setShowRightShadow(!isEnd);
        }
    };

    const handleClothingAdded = (newClothing: ClothingItem) => {
        setClothes((prev) => {
            const clothes = { ...prev };
            const categoryId = newClothing.category_id;
            if (categoryId && !clothes[categoryId]) {
                clothes[categoryId] = [];
            }
            if (categoryId) {
                clothes[categoryId] = [newClothing, ...clothes[categoryId]];
            }
            return clothes;
        });
        if (newClothing.category_id) {
            setSelectedCategory(newClothing.category_id);
        }
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

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedItems(new Set());
    };

    const handleToggleSelect = (itemId: string) => {
        setSelectedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleBatchDelete = async () => {
        const { error } = await supabase
            .from("clothes")
            .delete()
            .in("id", Array.from(selectedItems));

        if (error) {
            toast({
                variant: "destructive",
                title: "Errore",
                description: "Errore durante l'eliminazione dei capi",
            });
            return;
        }

        setClothes((prev) => {
            const newClothes = { ...prev };
            Object.keys(newClothes).forEach((categoryId) => {
                newClothes[categoryId] = newClothes[categoryId].filter(
                    (item) => !selectedItems.has(item.id)
                );
            });
            return newClothes;
        });

        toast({
            title: "Capi eliminati",
            description: `${selectedItems.size} capi sono stati eliminati con successo`,
        });

        setSelectedItems(new Set());
        setIsSelectionMode(false);
    };

    const handleToggleFavorite = async (item: ClothingItem) => {
        const newFavoriteState = !item.is_favorite;

        const { error } = await supabase
            .from("clothes")
            .update({ is_favorite: newFavoriteState })
            .eq("id", item.id);

        if (error) {
            toast({
                variant: "destructive",
                title: "Errore",
                description: "Impossibile aggiornare i preferiti",
            });
            return;
        }

        setClothes((prev) => {
            const newClothes = { ...prev };
            if (item.category_id) {
                newClothes[item.category_id] = newClothes[item.category_id].map((clothingItem) =>
                    clothingItem.id === item.id
                        ? { ...clothingItem, is_favorite: newFavoriteState }
                        : clothingItem
                );
            }
            return newClothes;
        });

        toast({
            title: newFavoriteState ? "Aggiunto ai preferiti" : "Rimosso dai preferiti",
            description: `${item.name} è stato ${
                newFavoriteState ? "aggiunto ai" : "rimosso dai"
            } preferiti`,
        });

        if (newFavoriteState) {
            setFavorites([...favorites, item]);
        } else {
            setFavorites(favorites.filter((fav) => fav.id !== item.id));
        }
    };

    return (
        <div className="container md:py-4 mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2">
                            <h1 className={title({ size: "sm" })}>
                                {currentView === "wardrobe" ? "Tutti i capi" : "Preferiti"}
                            </h1>
                            <ChevronDown className="size-5 mt-1" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-48"
                            align="start"
                            onCloseAutoFocus={(e) => e.preventDefault()}>
                            <DropdownMenuItem
                                className={cn(currentView === "wardrobe" && "font-medium")}
                                onClick={() => setCurrentView("wardrobe")}>
                                {currentView === "wardrobe" && (
                                    <span className="text-primary">•</span>
                                )}
                                Tutti i capi
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className={cn(currentView === "favorites" && "font-medium")}
                                onClick={() => setCurrentView("favorites")}>
                                {currentView === "favorites" && (
                                    <span className="text-primary">•</span>
                                )}
                                Preferiti
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                    {isSelectionMode && selectedItems.size > 0 && (
                        <Button onClick={handleBatchDelete} variant="destructive">
                            Elimina ({selectedItems.size})
                        </Button>
                    )}
                    <Button onClick={toggleSelectionMode} variant="secondary">
                        {isSelectionMode ? "Annulla" : "Seleziona"}
                    </Button>
                    {!isSelectionMode && (
                        <AddClothingDialog
                            categories={categories}
                            onClothingAdded={handleClothingAdded}
                        />
                    )}
                </div>
            </div>

            {currentView === "favorites" ? (
                <div className="mt-8">
                    {favorites.length > 0 ? (
                        <ClothesGrid
                            items={favorites}
                            onEdit={handleEdit}
                            onDelete={setItemToDelete}
                            onToggleFavorite={handleToggleFavorite}
                            isSelectionMode={isSelectionMode}
                            selectedItems={selectedItems}
                            onToggleSelect={handleToggleSelect}
                        />
                    ) : (
                        <EmptyList
                            primaryMessage="Nessun preferito"
                            IconComponent={HeartIcon}
                            secondaryMessage={
                                <>
                                    Aggiungi i tuoi capi preferiti cliccando su{" "}
                                    <HeartIcon className="inline-block size-4" /> nella card del
                                    capo.
                                </>
                            }
                        />
                    )}
                </div>
            ) : (
                <Tabs value={selectedCategory} onValueChange={handleTabChange} className="mt-6">
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
                        <div
                            ref={scrollContainerRef}
                            className={`flex gap-4 overflow-auto no-scrollbar cursor-grab active:cursor-grabbing touch-none ${
                                isDragging ? "[&_*]:pointer-events-none" : ""
                            }`}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}>
                            <TabsList className="gap-1 bg-transparent select-none">
                                {categories.map((category) => (
                                    <TabsTrigger
                                        key={category.id}
                                        value={category.id}
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
                                onToggleFavorite={handleToggleFavorite}
                                isSelectionMode={isSelectionMode}
                                selectedItems={selectedItems}
                                onToggleSelect={handleToggleSelect}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            )}
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
