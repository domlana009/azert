
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Correctly import Inter
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth.tsx'; // Import AuthProvider with .tsx extension

// Initialize Inter font with subsets
const inter = Inter({
  variable: '--font-inter', // Define CSS variable name
  subsets: ['latin'],
});


export const metadata: Metadata = {
  title: 'ReportZen', // Updated App Name
  description: 'Application de rapport quotidien OCP', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased`}>
         {/* Wrap the application with AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
