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

interface ClothesGridProps {
    items: ClothingItem[];
    onEdit: (item: ClothingItem) => void;
    onDelete: (item: ClothingItem) => void;
}

export function ClothesGrid({ items, onEdit, onDelete }: ClothesGridProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed min-h-[200px]">
                <ShirtIcon className="w-12 h-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                    Nessun capo presente in questa categoria
                </p>
                <p className="text-sm text-muted-foreground">
                    Aggiungi il tuo primo capo cliccando sul pulsante "Aggiungi capo"
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((item) => (
                <Card key={item.id}>
                    <CardHeader className="relative">
                        {item.image_url && (
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-48 object-cover rounded-t-lg"
                            />
                        )}
                        <div className="absolute top-2 right-2">
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(item)}>
                                        Modifica
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => onDelete(item)}>
                                        Elimina
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p>{item.brand}</p>
                            <p>Size: {item.size}</p>
                            <p>Color: {item.color}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
