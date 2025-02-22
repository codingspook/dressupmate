import { ClothingItem } from "@/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BASIC_COLORS } from "@/config/constants";
import { colord } from "colord";
import { useState } from "react";

interface ClothingDetailsDialogProps {
    item: ClothingItem | null;
    onClose: () => void;
}

export function ClothingDetailsDialog({ item, onClose }: ClothingDetailsDialogProps) {
    const { resolvedTheme } = useTheme();

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
                className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.div
                className="z-50 w-full max-w-4xl bg-background rounded-3xl overflow-hidden"
                layoutId={`card-container-${item.id}`}>
                <div className="flex flex-col md:flex-row">
                    <motion.div
                        className="relative aspect-[2/3] md:w-1/2"
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
                            className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/20"
                            layoutId={`card-gradient-${item.id}`}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative p-6 md:w-1/2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 z-10"
                            onClick={onClose}>
                            <X className="size-4" />
                        </Button>

                        <ScrollArea className="h-[calc(100vh-10rem)] md:h-[600px] pr-6">
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
                                                className="size-6 inline-block rounded-full rotate-45 border border-default-300"
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
                                        <p className="text-muted-foreground">{item.season}</p>
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
                            <ScrollBar data-state="hidden" />
                        </ScrollArea>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}
