import { ClothingItem } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ShirtIcon, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ClothingCard } from "@/components/clothing-card";
import EmptyList from "./empty-list";

interface ClothesGridProps {
    items: ClothingItem[];
    onEdit?: (item: ClothingItem) => void;
    onDelete?: (item: ClothingItem) => void;
    isSelectionMode?: boolean;
    selectedItems?: Set<string>;
    onToggleSelect?: (itemId: string) => void;
    onToggleFavorite?: (item: ClothingItem) => void;
}

export function ClothesGrid({
    items,
    onEdit,
    onDelete,
    isSelectionMode,
    selectedItems,
    onToggleSelect,
    onToggleFavorite,
}: ClothesGridProps) {
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
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="relative group"
                    onClick={() => isSelectionMode && onToggleSelect?.(item.id)}>
                    <ClothingCard
                        item={item}
                        onEdit={() => onEdit?.(item)}
                        onDelete={() => onDelete?.(item)}
                        onToggleFavorite={() => onToggleFavorite?.(item)}
                        disableActions={isSelectionMode}
                        isSelected={isSelectionMode && selectedItems?.has(item.id)}
                    />
                </div>
            ))}
        </div>
    );
}
