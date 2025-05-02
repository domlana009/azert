
"use client";

import React, { useState, useTransition, useRef } from 'react'; // Added useRef
import { useAuth } from '@/hooks/useAuth.tsx'; // Correct extension
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { useToast } from '@/hooks/use-toast';
import { createUserAction } from '@/actions/create-user'; // Import the Server Action

export default function CreateUserPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null); // Create a ref for the form

  // Redirect non-admins or unauthenticated users
  React.useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/'); // Redirect to home if not admin
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createUserAction(formData);

      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        });
        // Optionally reset form or redirect
        // Reset form using the ref
        formRef.current?.reset();
      } else {
        setError(result.message);
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };


  if (authLoading || !user || user.role !== 'admin') {
    // Show loading or nothing while redirecting
    return <div className="flex justify-center items-center min-h-screen">Chargement ou redirection...</div>;
  }

  // Render create user form if user is admin
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Créer un Nouvel Utilisateur</CardTitle>
          <CardDescription>Entrez les informations pour le nouvel utilisateur.</CardDescription>
        </CardHeader>
        {/* Attach the ref to the form */}
        <form onSubmit={handleSubmit} ref={formRef}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="utilisateur@example.com"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
                disabled={isPending}
              />
            </div>
            {/* Optional: Checkbox to make the user an admin */}
            {/* Ensure your useAuth logic correctly checks for the 'admin' custom claim if using this */}
             {/* <div className="flex items-center space-x-2">
               <Checkbox id="isAdmin" name="isAdmin" disabled={isPending} />
               <Label htmlFor="isAdmin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                 Définir comme Admin
               </Label>
             </div> */}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Création en cours...' : 'Créer Utilisateur'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
