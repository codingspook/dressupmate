import { ClothingItem } from "@/types";
import { motion, AnimatePresence, PanInfo, TapInfo } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { ClothingCard } from "./clothing-card";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface ClothesCarouselProps {
    items: ClothingItem[];
    onEdit?: (item: ClothingItem) => void;
    onDelete?: (item: ClothingItem) => void;
    onToggleFavorite?: (item: ClothingItem) => void;
    onItemClick?: (item: ClothingItem) => void;
}

export function ClothesCarousel({
    items,
    onEdit,
    onDelete,
    onToggleFavorite,
    onItemClick,
}: ClothesCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [isDragging, setIsDragging] = useState(false);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            y: 0,
            scale: 0.2,
            opacity: 0,
            rotateY: direction > 0 ? 45 : -45,
        }),
        center: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            rotateY: 0,
            zIndex: 1,
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -1000 : 1000,
            y: 0,
            scale: 0.2,
            opacity: 0,
            rotateY: direction > 0 ? -45 : 45,
        }),
    };

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
        console.log("Drag end:", info.offset.x);

        const swipeThreshold = 50;
        const swipeVelocityThreshold = 100;

        if (
            Math.abs(info.offset.x) > swipeThreshold ||
            Math.abs(info.velocity.x) > swipeVelocityThreshold
        ) {
            const direction = info.offset.x > 0 ? -1 : 1;
            paginate(direction);
        }

        // Reset dragging state after a short delay
        setTimeout(() => {
            setIsDragging(false);
        }, 100);
    };

    const handleClick = () => {
        if (!isDragging) {
            onItemClick?.(items[currentIndex]);
        }
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prevIndex) => {
            let nextIndex = prevIndex + newDirection;
            if (nextIndex < 0) nextIndex = items.length - 1;
            if (nextIndex >= items.length) nextIndex = 0;
            return nextIndex;
        });
    };

    if (!items.length) return null;

    // Non mostrare i controlli se c'è un solo capo
    const showControls = items.length > 1;

    return (
        <div className="relative h-[70vh] flex items-center justify-center overflow-hidden perspective">
            {/* Shadow gradients for depth */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
            </div>

            {/* Navigation buttons - mostrati solo se ci sono più capi */}
            {showControls && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-30">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full pointer-events-auto bg-background/80 backdrop-blur-sm"
                        onClick={() => paginate(-1)}>
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full pointer-events-auto bg-background/80 backdrop-blur-sm"
                        onClick={() => paginate(1)}>
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            )}

            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                        rotate: { duration: 0.5 },
                    }}
                    drag={showControls ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7} // Ridotto per un feeling più "snappy"
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onClick={handleClick}
                    whileDrag={{ cursor: "grabbing", scale: 0.95 }}
                    className={`absolute cursor-grab active:cursor-grabbing touch-none select-none ${
                        isMobile ? "w-[85%]" : "w-full max-w-xs"
                    }`}>
                    <div
                        className="pointer-events-auto"
                        onClick={(e) => {
                            console.log("Inner div click:", e);
                            e.stopPropagation();
                            onItemClick?.(items[currentIndex]);
                        }}>
                        <ClothingCard
                            item={items[currentIndex]}
                            onEdit={() => onEdit?.(items[currentIndex])}
                            onDelete={() => onDelete?.(items[currentIndex])}
                            onToggleFavorite={() => onToggleFavorite?.(items[currentIndex])}
                            disableActions={true} // Disabilitiamo le azioni durante il drag
                            onClick={() => {
                                console.log("Card click");
                                onItemClick?.(items[currentIndex]);
                            }}
                        />
                    </div>

                    {/* Overlay per i controlli */}
                    <div
                        className="absolute inset-0 z-20"
                        onClick={(e) => {
                            e.stopPropagation();
                            onItemClick?.(items[currentIndex]);
                        }}>
                        <div className="absolute top-2 right-2 z-30">
                            <Button
                                variant="ghostBlurred"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite?.(items[currentIndex]);
                                }}>
                                <Heart
                                    className={cn(
                                        "size-4",
                                        items[currentIndex].is_favorite &&
                                            "text-red-500 fill-current"
                                    )}
                                />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress dots - mostrati solo se ci sono più capi */}
            {showControls && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > currentIndex ? 1 : -1);
                                setCurrentIndex(index);
                            }}
                            className={`size-2 rounded-full transition-colors ${
                                index === currentIndex ? "bg-primary" : "bg-muted"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
