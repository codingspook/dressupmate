import { ImageIcon } from "lucide-react";
import { useCallback } from "react";
import { DropEvent, FileRejection, useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

export function ImageDropzone({ onFileSelect }: { onFileSelect: (file: File) => void }) {
    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".webp"],
        },
        maxFiles: 1,
        multiple: false,
        maxSize: 10 * 1024 * 1024, // 10MB,
        noDragEventsBubbling: true, // Previene il bubbling degli eventi di drag
    });

    // Rimuoviamo la gestione del click personalizzata che stava interferendo
    return (
        <div {...getRootProps()} className="relative w-full cursor-pointer">
            <input {...getInputProps()} />
            <div
                className={cn(
                    "w-full border-2 border-dashed rounded-2xl p-4 transition-all duration-200 ease-in-out hover:bg-muted/50",
                    {
                        "border-muted-foreground/25 hover:border-muted-foreground/50":
                            !isDragActive,
                        "border-primary bg-primary/5 ring-2 ring-primary/20": isDragAccept,
                        "border-destructive bg-destructive/5 ring-2 ring-destructive/20":
                            isDragReject,
                    }
                )}>
                <div className="flex flex-col items-center gap-2 text-center">
                    <ImageIcon
                        className={cn("h-8 w-8 transition-colors", {
                            "text-muted-foreground/50": !isDragActive,
                            "text-primary": isDragAccept,
                            "text-destructive": isDragReject,
                        })}
                    />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            {isDragReject ? (
                                <span className="text-destructive">File non supportato</span>
                            ) : isDragAccept ? (
                                <span className="text-primary">Rilascia per caricare</span>
                            ) : (
                                <>
                                    <span className="hidden md:inline">
                                        Trascina qui un'immagine o{" "}
                                    </span>
                                    <span className="text-primary">seleziona un file</span>
                                </>
                            )}
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG o WEBP (max 10MB)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
