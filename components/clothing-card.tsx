import { Heart, MoreVertical, RulerIcon, Snowflake, ThermometerSnowflake } from "lucide-react";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ProgressiveBlur } from "./ui/progressive-blur";
import { colord } from "colord";
import { useTheme } from "next-themes";
import { useI18n } from "@/locales";

interface ClothingCardProps {
    item: ClothingItem;
    onClick?: (element: HTMLElement) => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleFavorite?: (itemId: string) => void;
    disableActions?: boolean;
    isSelected?: boolean;
}

export function ClothingCard({
    item,
    onClick,
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

    const t = useI18n();

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

    const editButtonRef = useRef<HTMLDivElement>(null);
    const favoriteButtonRef = useRef<HTMLDivElement>(null);

    const seasonIcon = () => {
        switch (item.season) {
            case "spring":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="size-4 text-green-400">
                        <polyline points="22 17 16 17 13 22 11 14 8 14 10 8 13 8 16 3 22 3" />
                    </svg>
                );
            case "summer":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="size-4 text-yellow-400">
                        <path d="M12 2L12 12 22 12 22 2 12 2z" />
                        <path d="M2 12L12 12 12 22 2 22 2 12z" />
                    </svg>
                );
            case "fall":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="size-4 text-yellow-600">
                        <polyline points="20 4 20 10 14 10" />
                        <polyline points="4 4 4 10 10 10" />
                        <polyline points="14 20 20 20 20 14" />
                        <polyline points="10 4 10 10 4 10" />
                    </svg>
                );
            case "winter":
                return <ThermometerSnowflake className="size-4" />;
            default:
                return null;
        }
    };

    if (!item) {
        return <div>No item data available</div>;
    }

    return (
        <motion.div
            layoutId={`card-container-${item.id}`}
            className={cn(
                "w-full max-w-sm relative bg-card cursor-pointer",
                isSelected && "scale-95 ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            onClick={(e) => {
                if (
                    e.target === e.currentTarget ||
                    e.target instanceof HTMLDivElement ||
                    e.target instanceof HTMLImageElement
                ) {
                    onClick?.(e.currentTarget);
                }
            }}>
            {/* Contenitore immagine */}
            <div className="relative aspect-[2/3] border rounded-3xl overflow-hidden">
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

                <div className="absolute top-0 h-28 w-full bg-gradient-to-b from-black/40 to-transparent z-10" />

                <motion.div
                    className="absolute inset-0"
                    layoutId={`card-image-container-${item.id}`}>
                    <NextImage
                        src={item.image_url || `/${resolvedTheme}-placeholder.png`}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                </motion.div>

                {/* Menu e preferiti */}
                {!disableActions && (
                    <div className="absolute top-2 left-2 z-20">
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghostBlurred"
                                    size="icon"
                                    onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    ref={editButtonRef}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit && onEdit();
                                    }}>
                                    Modifica
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    ref={favoriteButtonRef}
                                    className="text-red-600"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete && onDelete();
                                    }}>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite && onToggleFavorite(item.id);
                            }}>
                            <Heart
                                className={cn(
                                    "size-4",
                                    item.is_favorite && "text-red-500 fill-current"
                                )}
                            />
                        </Button>
                    </div>
                )}
            </div>

            {/* Contenuto testuale */}
            <motion.div className="p-4" layoutId={`card-content-${item.id}`}>
                <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                {item.brand && <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>}
                <div className="flex flex-wrap gap-2">
                    {item.color && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span
                                className="size-4 rounded-full rotate-45 border"
                                style={{
                                    background:
                                        item.color === "Multicolor"
                                            ? "linear-gradient(violet, indigo, blue, green, yellow, orange, red)"
                                            : getColor(item.color)?.value,
                                    borderColor: colord(
                                        getColor(item.color)?.value || "#000"
                                    ).isDark()
                                        ? "#e5e7eb"
                                        : "#4b5563",
                                }}
                                aria-hidden="true"
                            />
                            {item.color}
                        </div>
                    )}
                    {item.size && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <RulerIcon size={16} />
                            {item.size}
                        </div>
                    )}
                    {item.season && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {seasonIcon()}
                            {t(`seasons.${item.season}`)}
                        </div>
                    )}
                </div>
                {item.price !== null && (
                    <p className="text-lg font-bold text-green-500 mt-2">
                        ${item.price.toFixed(2)}
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
}
