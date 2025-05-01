
"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

import {
  Navigation,
  DailyReport,
  ActivityReport,
  TruckTracking,
  R0Report,
  AnotherPageReport,
} from "@/components/sections"; // Adjusted import path
import Link from "next/link";

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
  const [currentDate, setCurrentDate] = useState<Date | null>(null); // Initialize with null
  const [selectedPoste, setSelectedPoste] = useState<Poste>("1er"); // Default Poste

   // Use useEffect to set the date only on the client side
  useEffect(() => {
    setCurrentDate(new Date());
  }, []); // Empty dependency array ensures this runs once on mount


  // Helper function to get formatted date string, handles null case
  const getFormattedDate = (date: Date | null, options: Intl.DateTimeFormatOptions): string => {
    if (!date) return "Loading..."; // Or some placeholder
    return date.toLocaleDateString("fr-FR", options);
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-7xl"> {/* Increased max-width */}
        {/* Header */}
        <header className="mb-8 border-b pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">ReportZen</h1>
              <p className="text-muted-foreground">Application de rapport quotidien</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="rounded-full" variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Avatar className="w-10 h-10">
                 <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                   {userName}
                </AvatarFallback>
              </Avatar>
              {/* Link to admin page - Adjust route as needed */}
              <Link href="/admin" passHref>
                  <Button variant="outline">Admin Panel</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <main id="tab-content" className="mt-6">
           {/* Render content only when currentDate is available */}
           {currentDate && (
               <>
                  {activeTab === "daily-report" && (
                    <DailyReport currentDate={currentDate} />
                  )}
                  {activeTab === "activity-report" && (
                    <ActivityReport currentDate={getFormattedDate(currentDate, dateOptions)} />
                  )}
                   {activeTab === "r0-report" && ( // Changed ID to match navigation
                    <R0Report currentDate={getFormattedDate(currentDate, dateOptions)} />
                  )}
                  {activeTab === "truck-tracking" && (
                    <TruckTracking currentDate={getFormattedDate(currentDate, dateOptions)} />
                  )}
                  {activeTab === "another-page" && ( // Check for 'another-page' ID
                    <AnotherPageReport currentDate={getFormattedDate(currentDate, dateOptions)} />
                  )}
               </>
           )}
            {!currentDate && (
                 <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">Chargement des données...</p>
                 </div>
            )}
        </main>

        <Toaster />
      </div>
    </div>
  );
}
