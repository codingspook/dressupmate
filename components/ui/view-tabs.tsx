import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const ViewTabs = TabsPrimitive.Root;

const ViewTabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-2xl bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
));
ViewTabsList.displayName = TabsPrimitive.List.displayName;

const ViewTabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3 py-1 h-full text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
            className
        )}
        {...props}
    />
));
ViewTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export { ViewTabs, ViewTabsList, ViewTabsTrigger };
