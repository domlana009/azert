"use client";
interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const navItems = [
    { id: "daily-report", label: "Rapport Journalier", icon: "fas fa-file-alt" },
    { id: "activity-report", label: "Activité TNB", icon: "fas fa-chart-line" },
    { id: "truck-tracking", label: "Pointage Camions", icon: "fas fa-truck" },
    { id: "another-page", label: "Another Page", icon: "fas fa-file" },
  ];

  return (
    <div className="flex border-b mb-6">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-tab px-4 py-2 font-medium ${
            activeTab === item.id ? "active" : ""
          }`}
          onClick={() => setActiveTab(item.id)}
        >
          <i className={`${item.icon} mr-2`}></i>
          {item.label}
        </button>
      ))}
    </div>
  );
}

