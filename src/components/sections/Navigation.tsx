
"use client";
interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  // Removed 'another-page' from navItems
  const navItems = [
    { id: "daily-report", label: "Activité TSUD", icon: "fas fa-file-alt" },
    { id: "activity-report", label: "Activité TNR", icon: "fas fa-chart-line" },
    { id: "r0-report", label: "Rapport R0", icon: "fas fa-file" }, // Changed ID
    { id: "truck-tracking", label: "Pointage Camions", icon: "fas fa-truck" },
   ];

  return (
    <nav className="border-b overflow-x-auto whitespace-nowrap mb-6">
      <div className="flex space-x-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeTab === item.id}
            className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${
              activeTab === item.id
                ? "border-b-2 border-primary text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            {/* If you have icons, you can add them here, e.g., using lucide-react */}
            {/* <i className={`${item.icon} mr-2`}></i> */}
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
