import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatFileName(fileName: string): string {
    // Rimuovi l'estensione
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

    // Se il nome è più lungo di 30 caratteri, troncalo e aggiungi ...
    if (nameWithoutExt.length > 30) {
        return nameWithoutExt.substring(0, 30) + "...";
    }

    return nameWithoutExt;
}

export function ImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
    const formattedSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    const displayName = formatFileName(file.name);

    return (
        <div className="flex items-center gap-4 p-4 border rounded-2xl w-full">
            <div className="relative aspect-[2/3] w-24 flex-shrink-0 overflow-hidden rounded-xl border">
                <img
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-cover"
                    alt="Preview"
                />
            </div>
            <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight mb-1">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{formattedSize}</p>
                </div>
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={onRemove}>
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
