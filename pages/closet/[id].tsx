import { EditClothingDialog } from "@/components/edit-clothing-dialog";
import Layout from "@/components/layout";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Category, ClothingItem } from "@/types";
import { createClient } from "@/utils/supabase/component";
import { createClient as createServerClient } from "@/utils/supabase/server-props";
import { GetServerSideProps } from "next";
import { ReactElement, useState } from "react";
import { useRouter } from "next/router";
import { Pencil, Trash2, Heart, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Props {
    item: ClothingItem;
    categories: Category[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
    const supabase = createServerClient(context);
    const id = context.params?.id as string;

    const [{ data: item }, { data: categories }] = await Promise.all([
        supabase.from("clothes").select("*").eq("id", id).single(),
        supabase.from("categories").select("*").order("order"),
    ]);

    if (!item) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            item,
            categories: categories || [],
        },
    };
};

export default function ClothingDetailPage({ item: initialItem, categories }: Props) {
    const [item, setItem] = useState<ClothingItem>(initialItem);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClient();

    const handleUpdate = (updatedItem: ClothingItem) => {
        setItem(updatedItem);
        setIsEditDialogOpen(false);
        toast({
            title: "Capo aggiornato",
            description: "Il capo è stato aggiornato con successo",
        });
    };

    const handleDelete = async () => {
        setIsLoading(true);
        const { error } = await supabase.from("clothes").delete().eq("id", item.id);

        if (error) {
            toast({
                variant: "destructive",
                title: "Errore",
                description: "Errore durante l'eliminazione del capo",
            });
            setIsLoading(false);
            return;
        }

        toast({
            title: "Capo eliminato",
            description: "Il capo è stato eliminato con successo",
        });
        router.push("/closet");
    };

    const handleToggleFavorite = async () => {
        const newFavoriteState = !item.is_favorite;
        const { error } = await supabase
            .from("clothes")
            .update({ is_favorite: newFavoriteState })
            .eq("id", item.id);

        if (error) {
            toast({
                variant: "destructive",
                title: "Errore",
                description: "Impossibile aggiornare i preferiti",
            });
            return;
        }

        setItem({ ...item, is_favorite: newFavoriteState });
        toast({
            title: newFavoriteState ? "Aggiunto ai preferiti" : "Rimosso dai preferiti",
            description: `${item.name} è stato ${
                newFavoriteState ? "aggiunto ai" : "rimosso dai"
            } preferiti`,
        });
    };

    const category = categories.find((c) => c.id === item.category_id);

    return (
        <>
            <Head>
                <title>{item.name} - DressUpMate</title>
            </Head>

            <div className="container mx-auto space-y-6 md:py-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/closet">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{item.name}</h1>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="overflow-hidden md:sticky md:top-20">
                        <div className="relative aspect-[2/3] w-full">
                            <Image
                                src={item.image_url || ""}
                                alt={item.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsEditDialogOpen(true)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleToggleFavorite}
                                className={item.is_favorite ? "text-red-500" : ""}>
                                <Heart
                                    className={`h-4 w-4 ${item.is_favorite ? "fill-current" : ""}`}
                                />
                            </Button>
                        </div>

                        <Card>
                            <CardContent className="grid gap-4 p-6">
                                {category && (
                                    <div>
                                        <h3 className="text-sm text-muted-foreground">Categoria</h3>
                                        <p className="text-lg">{category.name}</p>
                                    </div>
                                )}

                                {item.brand && (
                                    <div>
                                        <h3 className="text-sm text-muted-foreground">Marca</h3>
                                        <p className="text-lg">{item.brand}</p>
                                    </div>
                                )}

                                {item.size && (
                                    <div>
                                        <h3 className="text-sm text-muted-foreground">Taglia</h3>
                                        <p className="text-lg">{item.size}</p>
                                    </div>
                                )}

                                {item.color && (
                                    <div>
                                        <h3 className="text-sm text-muted-foreground">Colore</h3>
                                        <p className="text-lg capitalize">{item.color}</p>
                                    </div>
                                )}

                                {item.price && (
                                    <div>
                                        <h3 className="text-sm text-muted-foreground">Prezzo</h3>
                                        <p className="text-lg">€{item.price}</p>
                                    </div>
                                )}

                                {item.purchase_date && (
                                    <div>
                                        <h3 className="text-sm text-muted-foreground">
                                            Data acquisto
                                        </h3>
                                        <p className="text-lg">
                                            {format(new Date(item.purchase_date), "d MMMM yyyy", {
                                                locale: it,
                                            })}
                                        </p>
                                    </div>
                                )}

                                {item.season && (
                                    <div>
                                        <h3 className="text-sm text-muted-foreground">Stagione</h3>
                                        <p className="text-lg capitalize">{item.season}</p>
                                    </div>
                                )}

                                {item.notes && (
                                    <div>
                                        <h3 className="text-sm text-muted-foreground">Note</h3>
                                        <p className="text-lg">{item.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <EditClothingDialog
                item={item}
                categories={categories}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onComplete={handleUpdate}
            />

            <ConfirmDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                title="Sei sicuro di voler eliminare questo capo?"
                description={`Questa azione non può essere annullata. Il capo "${item.name}" verrà eliminato permanentemente.`}
            />
        </>
    );
}

ClothingDetailPage.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
};
