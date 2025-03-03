"use client";

import * as React from "react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

interface NeonColorsProps {
    firstColor: string;
    secondColor: string;
    thirdColor?: string;
}

const buttonAuroraVariants = cva(
    `relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none
     focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
      [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
    {
        variants: {
            variant: {
                default: "text-primary-foreground",
                destructive: "text-destructive-foreground",
                outline: "bg-transparent text-foreground",
                secondary: "text-secondary-foreground",
                ghost: "text-foreground",
                link: "text-primary underline-offset-4 [@media(hover:hover)]:hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3",
                lg: "h-11 px-8",
                xl: "h-12 px-10",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonAuroraProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonAuroraVariants> {
    asChild?: boolean;
    borderSize?: number;
    borderRadius?: number;
    neonColors?: NeonColorsProps;
    contentClassName?: string;
}

const ButtonAurora = React.forwardRef<HTMLButtonElement, ButtonAuroraProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            children,
            borderSize = 2,
            borderRadius = 20,
            neonColors = {
                firstColor: "#ff00aa",
                secondColor: "#00FFF1",
                thirdColor: undefined,
            },
            contentClassName,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        const containerRef = useRef<HTMLDivElement>(null);
        const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

        useEffect(() => {
            if (!containerRef.current) return;

            const resizeObserver = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry) {
                    const { width, height } = entry.contentRect;
                    setDimensions({ width, height });
                }
            });

            resizeObserver.observe(containerRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }, []);

        // Creo il gradient in base alla presenza o meno del terzo colore
        const gradientColors = neonColors.thirdColor
            ? `var(--neon-first-color), var(--neon-third-color), var(--neon-second-color)`
            : `var(--neon-first-color), var(--neon-second-color)`;

        return (
            <div
                ref={containerRef}
                style={
                    {
                        "--border-size": `${borderSize}px`,
                        "--border-radius": `${borderRadius}px`,
                        "--neon-first-color": neonColors.firstColor,
                        "--neon-second-color": neonColors.secondColor,
                        "--neon-third-color": neonColors.thirdColor || "transparent",
                        "--card-width": `${dimensions.width}px`,
                        "--card-height": `${dimensions.height}px`,
                        "--card-content-radius": `${borderRadius - borderSize}px`,
                        "--pseudo-element-width": `${dimensions.width + borderSize * 2}px`,
                        "--pseudo-element-height": `${dimensions.height + borderSize * 2}px`,
                        "--after-blur": `${dimensions.width / 3}px`,
                        "--gradient-colors": gradientColors,
                    } as CSSProperties
                }
                className={cn(
                    "relative z-10 inline-block",
                    size === "icon" && "w-10 h-10 aspect-square"
                )}>
                <Comp
                    className={cn(
                        buttonAuroraVariants({ variant, size, className }),
                        "relative rounded-[var(--card-content-radius)]",
                        "before:absolute before:-left-[var(--border-size)] before:-top-[var(--border-size)] before:-z-10 before:block",
                        "before:h-[var(--pseudo-element-height)] before:w-[var(--pseudo-element-width)] before:rounded-[var(--border-radius)] before:content-['']",
                        "before:bg-[linear-gradient(0deg,var(--gradient-colors))] before:bg-[length:100%_200%]",
                        "before:animate-background-position-spin",
                        "after:absolute after:-left-[var(--border-size)] after:-top-[var(--border-size)] after:-z-10 after:block",
                        "after:h-[var(--pseudo-element-height)] after:w-[var(--pseudo-element-width)] after:rounded-[var(--border-radius)] after:blur-[var(--after-blur)] after:content-['']",
                        "after:bg-[linear-gradient(0deg,var(--gradient-colors))] after:bg-[length:100%_200%] after:opacity-80",
                        "after:animate-background-position-spin",
                        contentClassName
                    )}
                    ref={ref}
                    {...props}>
                    {children}
                </Comp>
            </div>
        );
    }
);
ButtonAurora.displayName = "ButtonAurora";

export { ButtonAurora, buttonAuroraVariants };
