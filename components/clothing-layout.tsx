import { AnimatePresence } from "framer-motion";
import { ClothingItem } from "@/types";
import { ClothingCard } from "./clothing-card";
import { ClothingDetailsDialog } from "./clothing-details-dialog";

interface ClothingLayoutProps {
    items: ClothingItem[];
    selectedId: string | null;
    onItemSelect: (id: string | null) => void;
    onEdit?: (item: ClothingItem) => void;
    onDelete?: (item: ClothingItem) => void;
    onToggleFavorite?: (itemId: string) => void;
}

export function ClothingLayout({
    items,
    selectedId,
    onItemSelect,
    onEdit,
    onDelete,
    onToggleFavorite,
}: ClothingLayoutProps) {
    const selectedItem = items.find((item) => item.id === selectedId);

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {items.map((item) => (
                    <div key={item.id} onClick={() => onItemSelect(item.id)}>
                        <ClothingCard
                            item={item}
                            isSelected={item.id === selectedId}
                            onEdit={() => onEdit?.(item)}
                            onDelete={() => onDelete?.(item)}
                            onToggleFavorite={onToggleFavorite}
                        />
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {selectedId && (
                    <ClothingDetailsDialog
                        item={selectedItem || null}
                        onClose={() => onItemSelect(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
