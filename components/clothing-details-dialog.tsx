import { ClothingItem } from "@/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { X, Pencil, Trash2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { BASIC_COLORS } from "@/config/constants";
import { colord } from "colord";
import { useState } from "react";
import { useI18n } from "@/locales";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ClothingDetailsDialogProps {
    item: ClothingItem | null;
    onClose: () => void;
    onEdit?: (item: ClothingItem) => void;
    onDelete?: (item: ClothingItem) => void;
    onToggleFavorite?: (item: ClothingItem) => void;
}

export function ClothingDetailsDialog({
    item,
    onClose,
    onEdit,
    onDelete,
    onToggleFavorite,
}: ClothingDetailsDialogProps) {
    const { resolvedTheme } = useTheme();

    const t = useI18n();

    if (!item) return null;

    const getColor = (color: string) => {
        return BASIC_COLORS.find((c) => c.name === color);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.div
                className="z-50 w-full max-w-4xl bg-background/70 backdrop-blur-sm rounded-3xl overflow-hidden border"
                layoutId={`card-container-${item.id}`}>
                <div className="flex flex-col md:flex-row">
                    <motion.div
                        className="relative aspect-[2/3] md:w-1/2 border-r"
                        layoutId={`card-image-container-${item.id}`}>
                        <Image
                            src={item.image_url || `/${resolvedTheme}-placeholder.png`}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 90vw, 48rem"
                            priority
                        />
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0"
                            layoutId={`card-gradient-${item.id}`}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative flex flex-col p-6 md:w-1/2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        onClick={onClose}
                                        className="absolute right-2 top-2 z-10 size-9 min-h-0 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <X className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Chiudi</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <ScrollArea
                            hideScrollbar
                            className="flex-1 h-[calc(100vh-14rem)] md:h-[540px] pr-6">
                            <motion.div className="space-y-6" layoutId={`card-content-${item.id}`}>
                                <div>
                                    <h2 className="text-2xl font-bold">{item.name}</h2>
                                    {item.brand && (
                                        <p className="text-muted-foreground">{item.brand}</p>
                                    )}
                                </div>

                                {item.color && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Colore</h3>
                                        <p className="text-muted-foreground flex items-center gap-2">
                                            <span
                                                className="size-6 inline-block rounded-full rotate-45 border"
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
                                        </p>
                                    </div>
                                )}

                                {item.size && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Misura</h3>
                                        <p className="text-muted-foreground">{item.size}</p>
                                    </div>
                                )}
                                {item.season && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Stagione</h3>
                                        <p className="text-muted-foreground">
                                            {t(`seasons.${item.season}`)}
                                        </p>
                                    </div>
                                )}

                                {item.price !== null && (
                                    <p className="text-xl font-bold text-green-500">
                                        ${item.price.toFixed(2)}
                                    </p>
                                )}

                                {item.notes && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Note</h3>
                                        <p className="text-muted-foreground">{item.notes}</p>
                                    </div>
                                )}

                                {item.purchase_date && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            Data di acquisto
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {new Date(item.purchase_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </ScrollArea>

                        {/* Sezione pulsanti fissa in basso */}
                        <div className="pt-4 mt-4 border-t bg-background/80 backdrop-blur-sm">
                            <div className="flex gap-2">
                                {onToggleFavorite && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => onToggleFavorite(item)}>
                                        <Heart
                                            className={cn(
                                                "size-4",
                                                item.is_favorite && "text-red-500 fill-current"
                                            )}
                                        />
                                    </Button>
                                )}
                                {onEdit && (
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => onEdit(item)}>
                                        <Pencil className="size-4 mr-2" />
                                        Modifica
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => onDelete(item)}>
                                        <Trash2 className="size-4 mr-2" />
                                        Elimina
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}
