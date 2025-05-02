
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Adjust path as necessary
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // Import useToast

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast(); // Initialize useToast

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ // Show success toast
        title: "Connexion réussie",
        description: "Vous allez être redirigé.",
      });
      router.push('/'); // Redirect to home page on successful login
    } catch (err: any) {
      console.error("Login failed:", err);
      let errorMessage = "Échec de la connexion. Veuillez vérifier vos identifiants.";
      // Provide more specific messages based on Firebase error codes
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = "Utilisateur ou mot de passe invalide."; // Updated message
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Format d'utilisateur invalide (doit être un email)."; // Updated message
      } else if (err.code === 'auth/invalid-api-key') {
         errorMessage = "Erreur de configuration : Clé API Firebase invalide.";
      }
      setError(errorMessage);
       toast({ // Show error toast
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
    // No need to set loading false here if redirecting on success
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
          <CardDescription className="text-center">Connectez-vous à votre compte ReportZen</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User</Label> {/* Changed label from Utilisateur to User */}
              <Input
                id="email"
                type="email" // Keep type as email for Firebase Auth compatibility
                placeholder="utilisateur@example.com" // Keep placeholder example format
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}


