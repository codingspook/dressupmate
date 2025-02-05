import React from "react";
import { Shirt as ShirtIcon } from "lucide-react"; // import aggiunto

interface EmptyListProps {
    primaryMessage?: string;
    secondaryMessage?: React.ReactNode;
    IconComponent?: React.ElementType;
    className?: string;
}

const EmptyList = ({
    primaryMessage = "Nessun elemento presente",
    secondaryMessage = "Aggiungi il tuo primo elemento cliccando sul pulsante appropriato",
    IconComponent = ShirtIcon,
    className = "",
}: EmptyListProps) => {
    return (
        <div
            className={`flex flex-col items-center justify-center p-8 text-center border rounded-xl border-dashed min-h-[200px] ${className}`}>
            <IconComponent className="w-12 h-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">{primaryMessage}</p>
            <p className="text-sm text-muted-foreground">{secondaryMessage}</p>
        </div>
    );
};

export default EmptyList;
