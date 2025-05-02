
"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth.tsx'; // Correct extension
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect non-admins or unauthenticated users
  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/'); // Redirect to home if not admin
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    // Show loading or nothing while redirecting
    return <div className="flex justify-center items-center min-h-screen">Chargement ou redirection...</div>;
  }

  // Render admin content if user is admin
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Welcome, Admin!</p>
          <Link href="/admin/create-user" passHref>
            <Button>Create New User</Button>
          </Link>
          {/* Add more admin functionalities here */}
        </CardContent>
      </Card>
    </div>
  );
}
