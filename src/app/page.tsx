"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

import { Navigation } from "@/components/sections/Navigation";
import { DailyReport } from "@/components/sections/DailyReport";
import { ActivityReport } from "@/components/sections/ActivityReport";
import { TruckTracking } from "@/components/sections/TruckTracking";

const userName = "JD";
const currentDate = new Date().toLocaleDateString("fr-FR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default function Home() {
  const [activeTab, setActiveTab] = useState("daily-report");

  return (
    <div className="min-h-screen bg-f5f7fa">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ReportZen</h1>
              <p className="text-gray-600">Application de rapport quotidien</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="rounded-full" variant="ghost">
                <Bell className="h-5 w-5 text-gray-700" />
              </Button>
              <Avatar className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {userName}
              </Avatar>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div id="tab-content">
          {activeTab === "daily-report" && (
            <DailyReport currentDate={currentDate} />
          )}
          {activeTab === "activity-report" && (
            <ActivityReport currentDate={currentDate} />
          )}
          {activeTab === "truck-tracking" && (
            <TruckTracking currentDate={currentDate} />
          )}
        </div>
        <Toaster />
      </div>
    </div>
  );
}

