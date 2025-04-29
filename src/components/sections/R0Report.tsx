"use client";

interface R0ReportProps {
  currentDate: string;
}

export function R0Report({ currentDate }: R0ReportProps) {
  return (
    <div>
      <h2>R0 Report</h2>
      <p>Date: {currentDate}</p>
      {/* Add your R0 Report content here */}
    </div>
  );
}
