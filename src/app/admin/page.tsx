
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardDescription
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { listUsersAction } from '@/actions/list-users';
import { setUserRoleAction } from '@/actions/set-user-role'; // Import new action
import { toggleUserStatusAction } from '@/actions/toggle-user-status'; // Import new action
import { deleteUserAction } from '@/actions/delete-user'; // Import new action
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge'; // For displaying role/status
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ShieldCheck, ShieldOff, UserCog, Trash2, Ban, CheckCircle, Plus } from 'lucide-react'; // Icons
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; // Dropdown for actions


// Define a type for the user data we expect from the action
interface DisplayUser {
  uid: string;
  email: string | undefined;
  creationTime: string;
  lastSignInTime: string;
  disabled: boolean;
  isAdmin: boolean;
}

export default function AdminPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Redirect non-admins or unauthenticated users
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/'); // Redirect to home if not admin
    }
  }, [currentUser, authLoading, router]);

  // Function to fetch users
  const fetchUsers = async () => {
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
        console.error("Failed to fetch users:", result.message);
      }
      setListLoading(false);
  };


  // Fetch users when the component mounts and user is confirmed as admin
  useEffect(() => {
    // Ensure auth loading is complete and user is admin before fetching
    if (!authLoading && currentUser?.role === 'admin') {
        fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, authLoading, toast]);


  // --- Action Handlers ---

  const handleSetAdmin = (uid: string, isAdmin: boolean) => {
    startTransition(async () => {
        const result = await setUserRoleAction(uid, isAdmin);
        toast({
            title: result.success ? "Succès" : "Erreur",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
        if (result.success) {
            fetchUsers(); // Refresh user list
        }
    });
  };

  const handleToggleStatus = (uid: string, isDisabled: boolean) => {
     startTransition(async () => {
        const result = await toggleUserStatusAction(uid, isDisabled);
        toast({
            title: result.success ? "Succès" : "Erreur",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
         if (result.success) {
            fetchUsers(); // Refresh user list
        }
     });
  };

  const handleDeleteUser = (uid: string) => {
     startTransition(async () => {
        const result = await deleteUserAction(uid);
        toast({
            title: result.success ? "Succès" : "Erreur",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
         if (result.success) {
            fetchUsers(); // Refresh user list
        }
     });
  };


  // --- Rendering Logic ---

  if (authLoading || !currentUser || currentUser.role !== 'admin') {
    return <div className="flex justify-center items-center min-h-screen">Chargement ou redirection...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
             <h1 className="text-3xl font-bold">Panneau d'administration</h1>
            <Link href="/admin/create-user" passHref>
                <Button><Plus className="mr-2 h-4 w-4"/>Créer Utilisateur</Button>
            </Link>
        </div>

        {/* User List Section */}
        <Card>
            <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>Gérer les utilisateurs, leurs rôles et leur statut.</CardDescription>
            </CardHeader>
            <CardContent>
                {listLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>UID</TableHead>
                                    <TableHead>Créé le</TableHead>
                                    <TableHead>Dernière connexion</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? (
                                    users.map((usr) => (
                                    <TableRow key={usr.uid} className={usr.disabled ? 'opacity-60' : ''}>
                                        <TableCell className="font-medium">{usr.email || 'N/A'}</TableCell>
                                        <TableCell>
                                            {/* Display Admin badge if user is admin, User otherwise */}
                                            {usr.isAdmin || (process.env.NEXT_PUBLIC_ADMIN_UID && usr.uid === process.env.NEXT_PUBLIC_ADMIN_UID) ? (
                                                <Badge variant="secondary"><ShieldCheck className="mr-1 h-3 w-3" /> Admin</Badge>
                                            ) : (
                                                <Badge variant="outline">Utilisateur</Badge>
                                            )}
                                        </TableCell>
                                         <TableCell>
                                            {usr.disabled ? (
                                                <Badge variant="destructive"><Ban className="mr-1 h-3 w-3" />Désactivé</Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-3 w-3" />Activé</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{usr.uid}</TableCell>
                                        <TableCell>{new Date(usr.creationTime).toLocaleDateString()}</TableCell>
                                        <TableCell>{usr.lastSignInTime ? new Date(usr.lastSignInTime).toLocaleDateString() : 'Jamais'}</TableCell>
                                        <TableCell className="text-right">
                                            {/* Prevent modifying the primary admin defined by UID */}
                                            {(process.env.NEXT_PUBLIC_ADMIN_UID && usr.uid === process.env.NEXT_PUBLIC_ADMIN_UID) ? (
                                                 <Badge variant="outline">Principal</Badge>
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" disabled={isPending}>
                                                            <UserCog className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {/* --- Role Management --- */}
                                                         {usr.isAdmin ? (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isPending}>
                                                                        <ShieldOff className="mr-2 h-4 w-4"/> Retirer Admin
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Retirer le Rôle Admin?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Confirmez-vous la révocation des privilèges admin pour {usr.email || usr.uid}?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleSetAdmin(usr.uid, false)} disabled={isPending}>
                                                                            Confirmer
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        ) : (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                     <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isPending}>
                                                                        <ShieldCheck className="mr-2 h-4 w-4"/> Définir Admin
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                 <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Définir comme Admin?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Confirmez-vous l'attribution des privilèges admin à {usr.email || usr.uid}?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleSetAdmin(usr.uid, true)} disabled={isPending}>
                                                                            Confirmer
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}

                                                        {/* --- Status Management --- */}
                                                         {usr.disabled ? (
                                                             <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isPending}>
                                                                        <CheckCircle className="mr-2 h-4 w-4"/> Activer
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Activer l'Utilisateur?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Confirmez-vous l'activation du compte pour {usr.email || usr.uid}?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleToggleStatus(usr.uid, false)} disabled={isPending}>
                                                                            Confirmer
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        ) : (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                     <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isPending} className="text-destructive focus:text-destructive">
                                                                        <Ban className="mr-2 h-4 w-4"/> Désactiver
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                 <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Désactiver l'Utilisateur?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                             Confirmez-vous la désactivation du compte pour {usr.email || usr.uid}? L'utilisateur ne pourra plus se connecter.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleToggleStatus(usr.uid, true)} disabled={isPending} className={buttonVariants({ variant: "destructive" })}>
                                                                            Désactiver
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}

                                                        {/* --- Delete User --- */}
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isPending} className="text-destructive focus:text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4"/> Supprimer
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Supprimer l'Utilisateur?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Cette action est irréversible. Confirmez-vous la suppression définitive de {usr.email || usr.uid}?
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteUser(usr.uid)} disabled={isPending} className={buttonVariants({ variant: "destructive" })}>
                                                                        Supprimer
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            Aucun utilisateur trouvé.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

