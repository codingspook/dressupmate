import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function login() {
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError("Login fallito. Controlla le tue credenziali.");
            return;
        }
        router.push("/");
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            login();
                        }}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Button type="submit">Log in</Button>
                            <Link href="/sign-up" className="text-sm text-white hover:underline">
                                Registrati
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
