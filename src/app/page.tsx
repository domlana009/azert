
"use client";

import { useState } from "react"; // Removed useEffect
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Calendar as CalendarIcon } from "lucide-react"; // Added CalendarIcon
import { Toaster } from "@/components/ui/toaster";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Added Popover components
import { Calendar } from "@/components/ui/calendar"; // Added Calendar component
import { format } from "date-fns"; // Added date-fns format
import { fr } from "date-fns/locale"; // Added French locale for date formatting

import {
  Navigation,
  DailyReport,
  ActivityReport,
  TruckTracking,
  R0Report,
} from "@/components/sections"; // Adjusted import path
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth hook
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


export default function Home() {
  const [activeTab, setActiveTab] = useState("daily-report");
  // Renamed currentDate to selectedDate and initialized with today's date
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPoste, setSelectedPoste] = useState<Poste>("1er"); // Default Poste - This seems unused here now?
  const { user, loading, logout } = useAuth(); // Use the auth hook
  const router = useRouter(); // Initialize router

  // Helper function to get formatted date string, handles undefined case
  const getFormattedDate = (date: Date | undefined, options: Intl.DateTimeFormatOptions): string => {
    if (!date) return "Sélectionner une date"; // Placeholder if no date selected
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
      router.push('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show an error message to the user
    }
  };

    // Redirect to login if not authenticated and not loading
  // Note: This check might need adjustment depending on how you handle protected routes
  // For a simple case, we redirect from the main page if not logged in.
  if (loading) {
    return <div>Chargement...</div>; // Show loading state
  }

  if (!user) {
     router.push('/login'); // Redirect if not logged in
     return null; // Return null to prevent rendering the rest of the page during redirect
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-7xl"> {/* Increased max-width */}
        {/* Header */}
        <header className="mb-8 border-b pb-4">
          <div className="flex justify-between items-center flex-wrap gap-4"> {/* Added flex-wrap and gap */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold">ReportZen</h1>
              <p className="text-muted-foreground">Application de rapport quotidien</p>
            </div>

            {/* Date Picker */}
            <div className="flex-grow sm:flex-grow-0 order-3 sm:order-none w-full sm:w-auto">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full sm:w-[280px] justify-start text-left font-normal", // Adjusted width for full on small screens
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


            <div className="flex items-center space-x-4 order-2 sm:order-none">
              <Button className="rounded-full" variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Avatar className="w-10 h-10">
                 <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" data-ai-hint="user profile picture" />
                 <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                   {user?.email ? user.email.substring(0, 2).toUpperCase() : '??'}
                </AvatarFallback>
              </Avatar>
              {/* Link to admin page - Conditionally render based on role */}
               {user?.role === 'admin' && (
                  <Link href="/admin" passHref>
                      <Button variant="outline">Admin Panel</Button>
                  </Link>
               )}
               {/* Logout Button */}
                <Button variant="outline" onClick={handleLogout}>Déconnexion</Button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <main id="tab-content" className="mt-6">
           {/* Render content only when selectedDate is available */}
           {selectedDate ? (
               <>
                  {activeTab === "daily-report" && (
                    <DailyReport selectedDate={selectedDate} /> // Pass Date object
                  )}
                  {activeTab === "activity-report" && (
                    // Pass formatted date string or the Date object depending on component needs
                    <ActivityReport selectedDate={selectedDate} previousDayThirdShiftEnd={null}/> // Pass Date object, add previousDay prop
                  )}
                   {activeTab === "r0-report" && (
                    <R0Report selectedDate={selectedDate} previousDayThirdShiftEnd={null}/> // Pass Date object, add previousDay prop
                  )}
                  {activeTab === "truck-tracking" && (
                    <TruckTracking selectedDate={selectedDate} /> // Pass Date object
                  )}
               </>
           ) : ( // Show a message prompting date selection
                 <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground text-lg">Veuillez sélectionner une date pour afficher les rapports.</p>
                 </div>
            )}
        </main>

        <Toaster />
      </div>
    </div>
  );
}
