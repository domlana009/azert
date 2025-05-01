"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

import {
  Navigation,
  DailyReport,
  ActivityReport,
  TruckTracking,
  R0Report,
  AnotherPageReport, // Added AnotherPageReport import
} from "@/components/sections";
import Link from "next/link";

const userName = "JD"; // Replace with actual user data if available
const currentDate = new Date(); // Use Date object

export default function Home() {
  const [activeTab, setActiveTab] = useState("daily-report");

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">ReportZen</h1>
              <p className="text-gray-600 dark:text-gray-400">Application de rapport quotidien</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="rounded-full" variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Avatar className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {/* Placeholder for user initials or image */}
                {/* <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /> */}
                <span className="text-sm">{userName}</span>
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
          {activeTab === "daily-report" && (
            <DailyReport currentDate={currentDate} />
          )}
          {activeTab === "activity-report" && (
            <ActivityReport currentDate={currentDate.toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })} />
          )}
           {activeTab === "R0-report" && ( // Changed ID to match navigation
            <R0Report currentDate={currentDate.toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })} />
          )}
          {activeTab === "truck-tracking" && (
            <TruckTracking currentDate={currentDate.toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })} />
          )}
          {activeTab === "another-page" && ( // Added condition for another-page
            <AnotherPageReport currentDate={currentDate.toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })} />
          )}
        </main>

        <Toaster />
      </div>
    </div>
  );
}
