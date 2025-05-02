
"use client";

import React, { useState, useEffect } from 'react'; // Added useState and useEffect
import { useAuth } from '@/hooks/useAuth.tsx'; // Correct extension
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { listUsersAction } from '@/actions/list-users'; // Import the list users action
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Import Table components
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state
import { useToast } from '@/hooks/use-toast'; // Import useToast for error feedback

// Define a type for the user data we expect from the action
interface DisplayUser {
  uid: string;
  email: string | undefined;
  creationTime: string;
  lastSignInTime: string;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [listLoading, setListLoading] = useState(true); // State for loading user list

  // Redirect non-admins or unauthenticated users
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/'); // Redirect to home if not admin
    }
  }, [user, authLoading, router]);

  // Fetch users when the component mounts and user is confirmed as admin
  useEffect(() => {
    const fetchUsers = async () => {
      if (user && user.role === 'admin') { // Only fetch if admin
        setListLoading(true);
        const result = await listUsersAction();
        if (result.success && result.users) {
          setUsers(result.users);
        } else {
          toast({
            title: "Erreur",
            description: result.message,
            variant: "destructive",
          });
          // Handle error state, maybe show an error message
          console.error("Failed to fetch users:", result.message);
        }
        setListLoading(false);
      }
    };

    // Ensure auth loading is complete before fetching
    if (!authLoading) {
        fetchUsers();
    }

  }, [user, authLoading, toast]); // Depend on user and authLoading

  if (authLoading || !user || user.role !== 'admin') {
    // Show loading or nothing while redirecting or confirming auth
    return <div className="flex justify-center items-center min-h-screen">Chargement ou redirection...</div>;
  }

  // Render admin content if user is admin
  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Panneau d'administration</h1>
        <div className="mb-6 flex justify-start">
            <Link href="/admin/create-user" passHref>
                <Button>Créer un Nouvel Utilisateur</Button>
            </Link>
        </div>

        {/* User List Section */}
        <Card>
            <CardHeader>
                <CardTitle>Liste des Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
                {listLoading ? (
                    // Display skeleton loaders while fetching users
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    // Display the user table once loaded
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>UID</TableHead>
                                <TableHead>Créé le</TableHead>
                                <TableHead>Dernière connexion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map((usr) => (
                                <TableRow key={usr.uid}>
                                    <TableCell>{usr.email || 'N/A'}</TableCell>
                                    <TableCell>{usr.uid}</TableCell>
                                    <TableCell>{new Date(usr.creationTime).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(usr.lastSignInTime).toLocaleDateString()}</TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        Aucun utilisateur trouvé.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
        {/* Add more admin functionalities here */}

    </div>
  );
}
