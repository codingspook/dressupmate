import {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import ReactCrop, { centerCrop, Crop, makeAspectCrop } from "react-image-crop";

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: "%",
                width: 80,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export function CropDialog({
    open,
    onOpenChange,
    image,
    onCropComplete: onCropCompleteCallback,
    onCancel,
    fileName, // Aggiungi questo nuovo prop
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    image: string;
    onCropComplete: (file: File) => void;
    onCancel: () => void;
    fileName: string;
}) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>({
        unit: "%",
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setCrop(centerAspectCrop(naturalWidth, naturalHeight, 2 / 3));
    }

    const onCropComplete = async () => {
        if (!completedCrop || !imgRef.current) return;

        const canvas = document.createElement("canvas");
        const image = imgRef.current;

        // Ottieni le dimensioni effettive dell'immagine visualizzata
        const { width: displayWidth, height: displayHeight, naturalWidth, naturalHeight } = image;

        // Calcola i rapporti di scala
        const scaleX = naturalWidth / displayWidth;
        const scaleY = naturalHeight / displayHeight;

        // Calcola le dimensioni del crop in pixel reali
        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;
        const cropWidth = completedCrop.width * scaleX;
        const cropHeight = completedCrop.height * scaleY;

        // Imposta le dimensioni del canvas
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("No 2d context");

        // Applica smoothing per una migliore qualità
        ctx.imageSmoothingQuality = "high";
        ctx.imageSmoothingEnabled = true;

        // Disegna l'immagine ritagliata
        ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Genera il nome del file mantenendo il nome originale ma con estensione jpg
        const newFileName = fileName.replace(/\.[^/.]+$/, "") + "_cropped.jpg";

        // Converti il canvas in un file
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const file = new File([blob], newFileName, {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                    });
                    onCropCompleteCallback(file);
                }
            },
            "image/jpeg",
            0.95 // Alta qualità JPEG
        );

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogPortal>
                <DialogOverlay className="backdrop-blur-md bg-background/5 z-[100]" />
                <DialogContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="sm:max-w-lg z-[101] rounded-3xl sm:rounded-3xl"
                    style={{ width: "calc(100% - 32px)", margin: "16px auto" }}>
                    <DialogHeader>
                        <DialogTitle>Ritaglia l&apos;immagine</DialogTitle>
                    </DialogHeader>
                    <div className="relative flex justify-center w-full overflow-hidden rounded-3xl border">
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={2 / 3}
                            ruleOfThirds
                            className="max-h-[60vh]">
                            <div className="relative">
                                <img
                                    ref={imgRef}
                                    src={image}
                                    onLoad={onImageLoad}
                                    className="max-h-[60vh] w-auto"
                                />
                            </div>
                        </ReactCrop>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Annulla
                        </Button>
                        <Button type="button" onClick={onCropComplete}>
                            Conferma
                        </Button>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
