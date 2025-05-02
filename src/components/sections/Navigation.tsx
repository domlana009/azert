
"use client";

interface NavItem {
    id: string;
    label: string;
}

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  allowedSections: NavItem[]; // Receive allowed sections dynamically
}

export function Navigation({ activeTab, setActiveTab, allowedSections }: NavigationProps) {

  return (
    <nav className="border-b overflow-x-auto whitespace-nowrap mb-6">
      <div className="flex space-x-1">
        {allowedSections.map((item) => ( // Map over allowedSections
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
        {/* Optional: Add a message if no sections are allowed */}
         {allowedSections.length === 0 && (
            <div className="px-4 py-2 text-sm text-muted-foreground">Aucune section disponible.</div>
         )}
      </div>
    </nav>
  );
}
