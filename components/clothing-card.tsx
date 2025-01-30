import Image from "next/image";
import { Heart, MoreVertical } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClothingItem } from "@/types";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { BASIC_COLORS } from "@/config/constants";
import { useCallback } from "react";

interface ClothingCardProps {
    item?: ClothingItem;
    onEdit: (item: ClothingItem) => void;
    onDelete: (item: ClothingItem) => void;
}

export function ClothingCard({ item, onEdit, onDelete }: ClothingCardProps) {
    if (!item) {
        return <div>No item data available</div>;
    }

    const getColor = useCallback((color: string) => {
        return BASIC_COLORS.find((c) => c.name === color);
    }, []);

    return (
        <Card className="w-full max-w-sm overflow-hidden">
            <CardHeader className="p-0">
                <div className="relative aspect-square">
                    <div className="absolute top-2 left-2">
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
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
                    {item.image_url ? (
                        <Image
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            layout="fill"
                            objectFit="cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200">
                            <span className="text-gray-400">No image</span>
                        </div>
                    )}

                    <div className="absolute top-2 right-2">
                        <Button variant="ghost" size="icon">
                            <Heart
                                className={cn(
                                    "size-4",
                                    item.is_favorite && "text-red-500 fill-current"
                                )}
                            />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                {item.brand && <p className="text-sm text-gray-600 mb-2">{item.brand}</p>}
                <div className="flex flex-wrap gap-2 mb-2">
                    {item.color && (
                        <Badge className="gap-1.5">
                            {" "}
                            <span
                                className="size-2 rounded-full rotate-45"
                                style={{
                                    background:
                                        item.color === "Multicolor"
                                            ? "linear-gradient(violet, indigo, blue, green, yellow, orange, red)"
                                            : getColor(item.color)?.value,
                                }}
                                aria-hidden="true"></span>
                            {item.color}
                        </Badge>
                    )}
                    {item.size && <Badge variant="outline">{item.size}</Badge>}
                    {item.season && <Badge variant="secondary">{item.season}</Badge>}
                </div>
                {item.price !== null && (
                    <p className="text-lg font-bold text-green-600">${item.price.toFixed(2)}</p>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0">
                {item.purchase_date && (
                    <p className="text-sm text-gray-500">
                        Purchased: {new Date(item.purchase_date).toLocaleDateString()}
                    </p>
                )}
            </CardFooter>
        </Card>
    );
}
