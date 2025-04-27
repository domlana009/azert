"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnotherPage() {
  return (
    <div className="min-h-screen bg-f5f7fa">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Card className="bg-white rounded-lg p-6 mb-6">
          <CardHeader className="flex flex-col items-center pb-4 space-y-0">
            <CardTitle className="text-xl font-bold text-gray-800">
              Job Reporting - Another Page
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <p>This is another page.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
