import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignUpConfirmPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-3xl text-center">Controlla la tua email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">
                        Ti abbiamo inviato un link di conferma. Clicca sul link per completare la
                        registrazione.
                    </p>
                    <Button variant="link" asChild>
                        <Link href="/login">Torna al login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
