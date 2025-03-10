import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<"input"> & { icon?: React.ReactNode; wrapperClassName?: string }
>(({ className, type, icon, wrapperClassName, ...props }, ref) => {
    return (
        <div className={cn("relative", wrapperClassName)}>
            {icon && <div className="absolute -translate-y-1/2 left-3 top-1/2">{icon}</div>}
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    icon && "pl-10",
                    className
                )}
                ref={ref}
                {...props}
            />
        </div>
    );
});
Input.displayName = "Input";

export { Input };
