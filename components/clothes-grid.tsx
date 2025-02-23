import { ClothingItem } from "@/types";
import { ShirtIcon } from "lucide-react";
import EmptyList from "./empty-list";
import { ClothingCard } from "@/components/clothing-card";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { ClothingDetailsDialog } from "./clothing-details-dialog";
import { useState } from "react";

interface ClothesGridProps {
    items: ClothingItem[];
    onEdit: (item: ClothingItem) => void;
    onDelete: (item: ClothingItem) => void;
    onToggleFavorite: (item: ClothingItem) => void;
    isSelectionMode: boolean;
    selectedItems: Set<string>;
    onToggleSelect: (itemId: string) => void;
    onItemClick: (item: ClothingItem, element: HTMLElement) => void;
}

export function ClothesGrid({
    items,
    onEdit,
    onDelete,
    onToggleFavorite,
    isSelectionMode,
    selectedItems,
    onToggleSelect,
    onItemClick,
}: ClothesGridProps) {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedItem = items.find((item) => item.id === selectedId);

    if (items.length === 0) {
        return (
            <EmptyList
                primaryMessage="Nessun capo in questa categoria"
                secondaryMessage="Aggiungi il tuo primo capo cliccando sul pulsante appropriato"
                IconComponent={ShirtIcon}
                className="min-h-[200px]"
            />
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                    <ClothingCard
                        key={item.id}
                        item={item}
                        onClick={
                            isSelectionMode
                                ? (element) => onToggleSelect(item.id)
                                : (element) => {
                                      if (isSelectionMode) {
                                          onToggleSelect(item.id);
                                      } else {
                                          setSelectedId(item.id);
                                          onItemClick(item, element);
                                      }
                                  }
                        }
                        onEdit={() => onEdit?.(item)}
                        onDelete={() => onDelete?.(item)}
                        onToggleFavorite={() => onToggleFavorite?.(item)}
                        disableActions={isSelectionMode}
                        isSelected={isSelectionMode && selectedItems?.has(item.id)}
                    />
                ))}
            </div>
            <AnimatePresence>
                {selectedId && (
                    <ClothingDetailsDialog
                        item={selectedItem || null}
                        onClose={() => setSelectedId(null)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleFavorite={onToggleFavorite}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
