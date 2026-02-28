import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const resolvedParams = await searchParams;
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <form>
                    <CardHeader>
                        <CardTitle className="text-2xl">TradeET Login</CardTitle>
                        <CardDescription>
                            Enter your email and password to access your trading journal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>
                        {resolvedParams?.message && (
                            <p className="text-sm font-medium text-destructive">
                                {resolvedParams.message}
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button className="w-full" formAction={login}>
                            Log in
                        </Button>
                        <Button variant="outline" className="w-full" formAction={signup}>
                            Sign up
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
