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
import { ClothingCard } from "./clothing-card";

interface ClothesGridProps {
    items: ClothingItem[];
    onEdit: (item: ClothingItem) => void;
    onDelete: (item: ClothingItem) => void;
}

export function ClothesGrid({ items, onEdit, onDelete }: ClothesGridProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-xl border-dashed min-h-[200px]">
                <ShirtIcon className="w-12 h-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                    Nessun capo presente in questa categoria
                </p>
                <p className="text-sm text-muted-foreground">
                    Aggiungi il tuo primo capo cliccando sul pulsante &quot;Aggiungi capo&quot;
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((item) => (
                <ClothingCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    );
}
