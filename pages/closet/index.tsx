import { AddClothingDialog } from "@/components/add-clothing-dialog";
import { ClothesGrid } from "@/components/clothes-grid";
import { EditClothingDialog } from "@/components/edit-clothing-dialog";
import Layout from "@/components/layout";
import { title } from "@/components/primitives";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Category, ClothingItem } from "@/types";
import { createClient } from "@/utils/supabase/component";
import { ReactElement, useState, useEffect, useRef } from "react";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, HeartIcon, ChevronUp } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmptyList from "@/components/empty-list";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton"; // Add this import
import Head from "next/head";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function ClosetPage() {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const [clothes, setClothes] = useState<Record<string, ClothingItem[]>>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
    const supabase = createClient();
    const { toast } = useToast();
    const [showLeftShadow, setShowLeftShadow] = useState(false);
    const [showRightShadow, setShowRightShadow] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [favorites, setFavorites] = useState<ClothingItem[]>([]);
    const [currentView, setCurrentView] = useState<"wardrobe" | "favorites">("wardrobe");
    const [isLoading, setIsLoading] = useState(true);
    const [isTabsExpanded, setIsTabsExpanded] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

    const toggleTabsView = () => {
        setIsTabsExpanded((prev) => !prev);
    };

    // Recupera i capi dal database
    useEffect(() => {
        const fetchClothes = async () => {
            setIsLoading(true);
            try {
                const { data: clothes } = await supabase
                    .from("clothes")
                    .select("*")
                    .order("created_at", { ascending: false });

                const { data: categories } = await supabase
                    .from("categories")
                    .select("*")
                    .order("order");

                const clothesByCategory =
                    categories?.reduce<Record<string, ClothingItem[]>>((acc, category) => {
                        acc[category.id] = [];
                        return acc;
                    }, {}) || {};

                clothes?.forEach((item) => {
                    if (item.category_id && clothesByCategory[item.category_id]) {
                        clothesByCategory[item.category_id].push(item);
                    }
                });

                setClothes(clothesByCategory);
                setCategories(categories || []);
                setSelectedCategory(categories?.[0]?.id);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Errore",
                    description: "Impossibile caricare i dati",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchClothes();
    }, []);

    useEffect(() => {
        // Inizializza i preferiti dal clothes iniziale
        const allClothes = Object.values(clothes).flat();
        const initialFavorites = allClothes.filter((item) => item.is_favorite);
        setFavorites(initialFavorites);
    }, [clothes]);

    const handleTabChange = (value: string) => {
        setSelectedCategory(value);

        // Scroll the selected tab into view
        if (!isTabsExpanded) {
            const selectedTab = document.querySelector(`[data-value="${value}"]`);
            if (selectedTab && scrollContainerRef.current) {
                const container = scrollContainerRef.current;
                const tabRect = selectedTab.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Calculate the scroll position to center the tab
                const scrollLeft =
                    container.scrollLeft +
                    (tabRect.left - containerRect.left) -
                    containerRect.width / 2 +
                    tabRect.width / 2;

                container.scrollTo({
                    left: scrollLeft,
                    behavior: "smooth",
                });
            }
        }
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

    const handleItemClick = (item: ClothingItem) => {
        if (!isSelectionMode) {
            setSelectedItem(item);
        }
    };

    // Effettua lo scroll iniziale quando viene selezionata una categoria al caricamento
    useEffect(() => {
        if (selectedCategory && !isTabsExpanded) {
            const selectedTab = document.querySelector(`[data-value="${selectedCategory}"]`);
            if (selectedTab && scrollContainerRef.current) {
                const container = scrollContainerRef.current;
                const tabRect = selectedTab.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const scrollLeft =
                    container.scrollLeft +
                    (tabRect.left - containerRect.left) -
                    containerRect.width / 2 +
                    tabRect.width / 2;

                container.scrollTo({
                    left: scrollLeft,
                    behavior: "smooth",
                });
            }
        }
    }, [selectedCategory, isTabsExpanded]);

    return (
        <>
            <Head>
                <title>Guardaroba - DressUpMate</title>
            </Head>
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

                {isLoading ? (
                    <div className="mt-6 space-y-6">
                        <div className="flex gap-2 overflow-hidden">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-[2.875rem] w-32 rounded-2xl" />
                            ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
                            ))}
                        </div>
                    </div>
                ) : currentView === "favorites" ? (
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
                                onItemClick={handleItemClick}
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
                        <div className="relative pr-11">
                            {!isDesktop && (
                                <Button
                                    onClick={toggleTabsView}
                                    variant="secondary"
                                    size="sm"
                                    className="absolute right-0 top-1 z-20 flex items-center gap-2">
                                    <ChevronDown
                                        className={cn(
                                            "size-4 transition-all will-change-transform",
                                            {
                                                "rotate-180": isTabsExpanded,
                                            }
                                        )}
                                    />
                                </Button>
                            )}
                            <div
                                className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
                                    showLeftShadow && !isTabsExpanded ? "opacity-100" : "opacity-0"
                                }`}
                            />
                            <div
                                className={`absolute right-11 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
                                    showRightShadow && !isTabsExpanded ? "opacity-100" : "opacity-0"
                                }`}
                            />
                            <div
                                ref={scrollContainerRef}
                                onScroll={(e) =>
                                    !isTabsExpanded && handleScroll(e.currentTarget.scrollLeft)
                                }
                                className={cn(
                                    "relative",
                                    isTabsExpanded
                                        ? "flex flex-wrap gap-2 justify-start"
                                        : "flex overflow-auto no-scrollbar rounded-2xl"
                                )}>
                                <TabsList
                                    className={cn(
                                        "gap-1 bg-transparent select-none",
                                        isTabsExpanded ? "flex flex-wrap justify-start" : "flex"
                                    )}>
                                    {categories.map((category) => (
                                        <TabsTrigger
                                            key={category.id}
                                            value={category.id}
                                            data-value={category.id}
                                            className="group p-3 data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-2xl gap-2">
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
                                    onItemClick={handleItemClick}
                                />
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
                <EditClothingDialog
                    open={!!editingItem}
                    onOpenChange={(open) => !open && setEditingItem(null)}
                    categories={categories}
                    item={editingItem}
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
        </>
    );
}

ClosetPage.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
};
