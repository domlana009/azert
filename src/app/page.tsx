"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Calendar as CalendarIcon } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  Navigation,
  DailyReport,
  ActivityReport,
  TruckTracking,
  R0Report,
} from "@/components/sections"; // Adjusted import path
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth.tsx"; // Import useAuth hook
import { useRouter } from "next/navigation"; // Import useRouter

const userName = "JD"; // Replace with actual user data if available

// Type for Poste
type Poste = "1er" | "2ème" | "3ème";

// Updated Poste times and order
const POSTE_TIMES: Record<Poste, string> = {
  "3ème": "22:30 - 06:30",
  "1er": "06:30 - 14:30",
  "2ème": "14:30 - 22:30",
};
const POSTE_ORDER: Poste[] = ["3ème", "1er", "2ème"];

// Define all possible sections
const ALL_SECTIONS_CONFIG = [
    { id: "daily-report", label: "Activité TSUD", component: DailyReport },
    { id: "activity-report", label: "Activité TNR", component: ActivityReport },
    { id: "r0-report", label: "Rapport R0", component: R0Report },
    { id: "truck-tracking", label: "Pointage Camions", component: TruckTracking },
];


export default function Home() {
  const { user, loading, logout } = useAuth(); // Use the auth hook
  const router = useRouter(); // Initialize router
  const [isClient, setIsClient] = useState(false); // State to track client-side mount

  // Determine allowed sections and set the initial active tab
  const allowedSections = React.useMemo(() => {
    // Default to no sections if user is null/loading or has no allowedSections
    if (!user?.allowedSections || loading) return [];
    return ALL_SECTIONS_CONFIG.filter(section => user.allowedSections!.includes(section.id));
  }, [user?.allowedSections, loading]); // Add loading dependency

  const [activeTab, setActiveTab] = useState(() => allowedSections[0]?.id || ""); // Default to first allowed tab or empty string
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Initialize with new Date()


   // Ensure client-side execution for redirection
   useEffect(() => {
     setIsClient(true);
   }, []);


   // Redirect logic moved inside useEffect to ensure it runs client-side after hydration
   useEffect(() => {
     // Only redirect if on the client, not loading, and user is not logged in
     if (isClient && !loading && !user) {
       router.push('/login');
     }
   }, [isClient, loading, user, router]);

    // Update active tab if the current one becomes disallowed or if none is set initially
    useEffect(() => {
      // Run this effect only when allowedSections are determined (i.e., not loading)
      if (!loading) {
        if (allowedSections.length > 0 && !allowedSections.find(s => s.id === activeTab)) {
           setActiveTab(allowedSections[0].id); // Set to first allowed if current is invalid
        } else if (allowedSections.length > 0 && !activeTab) {
            setActiveTab(allowedSections[0].id); // Set initial if empty
        } else if (allowedSections.length === 0) {
            setActiveTab(""); // No sections allowed
        }
      }
    }, [allowedSections, activeTab, loading]); // Add loading dependency


  // Helper function to get formatted date string, handles undefined case
  const getFormattedDate = (date: Date | undefined, options: Intl.DateTimeFormatOptions): string => {
    if (!date) return "Sélectionner une date"; // Placeholder if no date selected
    // Ensure date is a valid Date object before formatting
    if (!(date instanceof Date) || isNaN(date.getTime())) {
       console.warn("Invalid date provided to getFormattedDate:", date);
       return "Date invalide";
    }
    return date.toLocaleDateString("fr-FR", options);
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
  };

    // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect handled by the useEffect hook above
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show an error message to the user
    }
  };

    // Show loading state while authentication status is being determined or client isn't mounted
  if (loading || !isClient) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>; // Show loading state
  }

   // If useEffect determined redirection is needed, return null while it happens
   if (!user) {
     return null; // Prevent rendering the main content if not logged in
   }


  // Fetch previous day's 3rd shift end counter data based on selectedDate
  const getPreviousDayThirdShiftEnd = (currentDate: Date | undefined): string | null => {
     if (!currentDate) return null;
     // Placeholder: Replace with actual data fetching logic (e.g., Firestore)
     console.log("Fetching previous day 3rd shift end for:", currentDate.toLocaleDateString());
     // Example: Simulate fetching data for the previous day. In a real app, query your data source.
     // const prevDay = new Date(currentDate);
     // prevDay.setDate(prevDay.getDate() - 1);
     // const formattedPrevDay = prevDay.toISOString().split('T')[0]; // Format YYYY-MM-DD
     // Replace with actual logic
     if (currentDate.getDate() === 1) return "9300.0"; // Example value for the 1st of the month
     return "9341.0"; // Example default value
   };
   const previousDayThirdShiftEnd = getPreviousDayThirdShiftEnd(selectedDate);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8 border-b pb-4">
          {/* Use flex-wrap for better responsiveness */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold">R0</h1> {/* Updated Title */}
              <p className="text-muted-foreground text-sm sm:text-base">Application de rapport quotidien</p>
            </div>

            {/* Date Picker - ensure it doesn't grow too large */}
            <div className="flex-grow sm:flex-grow-0 order-3 sm:order-none w-full sm:w-auto">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full sm:w-[280px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        locale={fr} // Use French locale
                    />
                    </PopoverContent>
                </Popover>
             </div>

            {/* User actions - grouped together */}
            <div className="flex items-center space-x-2 sm:space-x-4 order-2 sm:order-none">
              <Button className="rounded-full flex-shrink-0" variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
                 <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" data-ai-hint="user profile picture" />
                 <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs sm:text-sm">
                   {user?.email ? user.email.substring(0, 2).toUpperCase() : '??'}
                </AvatarFallback>
              </Avatar>
               {user?.role === 'admin' && (
                  <Link href="/admin" passHref>
                      <Button variant="outline" size="sm" className="flex-shrink-0">Admin</Button>
                  </Link>
               )}
                <Button variant="outline" onClick={handleLogout} size="sm" className="flex-shrink-0">Déconnexion</Button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs - Ensure horizontal scrolling on small screens */}
        <Navigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            allowedSections={allowedSections.map(s => ({ id: s.id, label: s.label }))}
        />

        {/* Tab Content */}
        <main id="tab-content" className="mt-6">
           {selectedDate ? (
               <>
                  {allowedSections.map(section => {
                     if (activeTab !== section.id) return null;

                     const Component = section.component;
                     const props: any = { selectedDate };

                     if (section.id === 'activity-report' || section.id === 'r0-report') {
                          props.previousDayThirdShiftEnd = previousDayThirdShiftEnd;
                     }

                     return <Component key={section.id} {...props} />;
                  })}

                  {allowedSections.length === 0 && (
                      <div className="flex justify-center items-center h-64">
                         <p className="text-muted-foreground text-lg text-center">Vous n'avez accès à aucune section.</p>
                      </div>
                  )}
               </>
           ) : (
                 <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground text-lg text-center">Veuillez sélectionner une date pour afficher les rapports.</p>
                 </div>
            )}
        </main>

        <Toaster />
      </div>
    </div>
  );
}
