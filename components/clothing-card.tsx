import { Heart, MoreVertical } from "lucide-react";
import { default as NextImage } from "next/image";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BASIC_COLORS } from "@/config/constants";
import { cn } from "@/lib/utils";
import { ClothingItem } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ProgressiveBlur } from "./ui/progressive-blur";
import { colord } from "colord";
import { useTheme } from "next-themes";

interface ClothingCardProps {
    item: ClothingItem;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleFavorite?: (itemId: string) => void;
    disableActions?: boolean;
    isSelected?: boolean;
}

export function ClothingCard({
    item,
    onEdit,
    onDelete,
    onToggleFavorite,
    disableActions,
    isSelected,
}: ClothingCardProps) {
    const getColor = useCallback((color: string) => {
        return BASIC_COLORS.find((c) => c.name === color);
    }, []);

    // Calcola la luminosità dell'immagine
    const [isBright, setIsBright] = useState(false);

    const { resolvedTheme } = useTheme();

    useEffect(() => {
        if (!item.image_url) return;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = item.image_url;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let colorSum = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    colorSum += avg;
                }
                const brightness = colorSum / (data.length / 4);
                setIsBright(brightness > 200);
            }
        };
    }, [item.image_url]);

    if (!item) {
        return <div>No item data available</div>;
    }

    return (
        <motion.div
            className={cn(
                "w-full max-w-sm relative aspect-[2/3] rounded-xl bg-card cursor-pointer",
                isSelected && "scale-95 ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}>
            {/* Indicatore di selezione */}
            {isSelected && (
                <div className="absolute top-2 right-2 z-30 size-6 bg-primary rounded-full flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="size-4 text-primary-foreground">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            )}

            {/* Immagine di sfondo */}
            <motion.div className="absolute inset-0" layoutId={`card-image-container-${item.id}`}>
                <NextImage
                    src={item.image_url || `/${resolvedTheme}-placeholder.png`}
                    alt={item.name}
                    fill
                    className="object-cover rounded-3xl"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
            </motion.div>

            <motion.div
                className="absolute inset-0 bg-background/20"
                layoutId={`card-gradient-${item.id}`}
            />

            {/* Controlli superiori */}
            <div className="absolute inset-x-0 top-0 h-24 z-10" />

            {/* Menu e preferiti */}
            {!disableActions && (
                <div className="absolute top-2 left-2 z-20">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghostBlurred"
                                size="icon"
                                className="text-white hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => onEdit && onEdit()}>
                                Modifica
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => onDelete && onDelete()}>
                                Elimina
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {!disableActions && (
                <div className="absolute top-2 right-2 z-20">
                    <Button
                        variant="ghostBlurred"
                        size="icon"
                        className="text-white hover:text-white"
                        onClick={() => onToggleFavorite && onToggleFavorite(item.id)}>
                        <Heart
                            className={cn(
                                "size-4",
                                item.is_favorite && "text-red-500 fill-current"
                            )}
                        />
                    </Button>
                </div>
            )}

            {/* Progressive blur layer */}
            {/* <ProgressiveBlur
                className={cn(
                    "pointer-events-none absolute bottom-0 left-0 w-full rounded-3xl transition-all",
                    isSelected ? "top-0" : "top-60"
                )}
                blurIntensity={1}
            /> */}

            {/* Contenuto testuale */}
            <motion.div
                className="absolute inset-x-0 bottom-0 p-4 z-10"
                layoutId={`card-content-${item.id}`}>
                <div className="text-white">
                    <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                    {item.brand && <p className="text-sm text-gray-200 mb-2">{item.brand}</p>}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {item.color && (
                            <Badge className="gap-1.5" variant="white">
                                <span
                                    className="size-2 rounded-full rotate-45 border border-default-300"
                                    style={{
                                        background:
                                            item.color === "Multicolor"
                                                ? "linear-gradient(violet, indigo, blue, green, yellow, orange, red)"
                                                : getColor(item.color)?.value,
                                        borderColor: colord(
                                            getColor(item.color)?.value || "#000"
                                        ).isDark()
                                            ? "white"
                                            : "black",
                                    }}
                                    aria-hidden="true"></span>
                                {item.color}
                            </Badge>
                        )}
                        {item.size && <Badge variant="white">{item.size}</Badge>}
                        {item.season && <Badge variant="white">{item.season}</Badge>}
                    </div>
                    {item.price !== null && (
                        <p className="text-lg font-bold text-green-400">${item.price.toFixed(2)}</p>
                    )}
                    {item.purchase_date && (
                        <p className="text-sm text-gray-300">
                            Purchased: {new Date(item.purchase_date).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
