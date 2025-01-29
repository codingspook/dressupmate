import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/utils/supabase/component";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SignUpFormData {
    email: string;
    password: string;
    confirmPassword: string;
}

export default function SignUpPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const form = useForm<SignUpFormData>();

    const onSubmit = async (data: SignUpFormData) => {
        try {
            setIsLoading(true);
            setError(null);

            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            // Reindirizza alla pagina di conferma
            router.push("/sign-up/confirm");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container flex h-screen flex-col items-center justify-center mx-auto">
            <Card className="w-[400px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Crea un account</CardTitle>
                    <CardDescription className="text-center">
                        Oppure{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            accedi al tuo account
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                rules={{
                                    required: "Email richiesta",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Email non valida",
                                    },
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="nome@esempio.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                rules={{
                                    required: "Password richiesta",
                                    minLength: {
                                        value: 6,
                                        message: "La password deve essere di almeno 6 caratteri",
                                    },
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                rules={{
                                    required: "Conferma password richiesta",
                                    validate: (val: string) => {
                                        if (form.watch("password") !== val) {
                                            return "Le password non coincidono";
                                        }
                                    },
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Conferma Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Registrazione in corso..." : "Registrati"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
