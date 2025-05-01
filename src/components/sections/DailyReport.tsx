"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DailyReportProps {
  currentDate: string;
}

interface ModuleStop {
  id: string; // Add unique id for key prop
  duration: string;
  nature: string;
  hm: string;
  ha: string;
}

// Helper function to parse duration strings into minutes
function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0;

  // Clean the string: remove anything not a digit, H, h, :, ·
  // Allow spaces for flexibility e.g., "1 H 20"
  const cleaned = duration.replace(/[^0-9Hh:·\s]/g, '').trim();

  let hours = 0;
  let minutes = 0;

  // Match formats like HH:MM, HH·MM, HH H MM, H:MM, H·MM, H H MM
   let match = cleaned.match(/^(?:(\d{1,2})\s?[Hh:·]\s?)?(\d{1,2})$/);
   if (match) {
     hours = match[1] ? parseInt(match[1], 10) : 0;
     minutes = parseInt(match[2], 10);
     return (hours * 60) + minutes;
   }


   // Match formats like HH H, H H
   match = cleaned.match(/^(\d{1,2})\s?[Hh]$/);
    if (match) {
      hours = parseInt(match[1], 10);
      return hours * 60;
    }

  // Match only numbers (assume minutes)
  match = cleaned.match(/^(\d+)$/);
  if (match) {
    minutes = parseInt(match[1], 10);
    return minutes;
  }

  console.warn(`Could not parse duration: "${duration}"`);
  return 0; // Return 0 if parsing fails
}


// Helper function to format minutes into HHh MMm string
function formatMinutesToHoursMinutes(totalMinutes: number): string {
    if (isNaN(totalMinutes) || totalMinutes < 0) return "0h 0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}


export function DailyReport({ currentDate }: DailyReportProps) {
  const TOTAL_DAILY_MINUTES = 8 * 60; // Assuming an 8-hour workday

  const [module1Stops, setModule1Stops] = useState<ModuleStop[]>([
    {
      id: crypto.randomUUID(),
      duration: "1·20", // Changed A1 to 1 for parsing
      nature: "Marque produit d'agissant steril",
      hm: "6H·20",
      ha: "1·40", // Changed A1 to 1
    },
    { id: crypto.randomUUID(), duration: "20", nature: "", hm: "", ha: "" }, // Changed A2·20 to 20
  ]);
  const [module2Stops, setModule2Stops] = useState<ModuleStop[]>([
    { id: crypto.randomUUID(), duration: "40", nature: "Lancement Vol. G3", hm: "6·H·55", ha: "55" }, // Changed σ·40, A6·H·5.5, σ·5.5
  ]);

  const [module1TotalDowntime, setModule1TotalDowntime] = useState(0);
  const [module2TotalDowntime, setModule2TotalDowntime] = useState(0);
  const [module1OperatingTime, setModule1OperatingTime] = useState(TOTAL_DAILY_MINUTES);
  const [module2OperatingTime, setModule2OperatingTime] = useState(TOTAL_DAILY_MINUTES);


   useEffect(() => {
    const calculateTotals = (stops: ModuleStop[]) => {
      const totalDowntime = stops.reduce((acc, stop) => acc + parseDurationToMinutes(stop.duration), 0);
      const operatingTime = TOTAL_DAILY_MINUTES - totalDowntime;
      return { totalDowntime, operatingTime };
    };

    const { totalDowntime: m1Downtime, operatingTime: m1Operating } = calculateTotals(module1Stops);
    setModule1TotalDowntime(m1Downtime);
    setModule1OperatingTime(m1Operating >= 0 ? m1Operating : 0); // Ensure non-negative

    const { totalDowntime: m2Downtime, operatingTime: m2Operating } = calculateTotals(module2Stops);
    setModule2TotalDowntime(m2Downtime);
    setModule2OperatingTime(m2Operating >= 0 ? m2Operating : 0); // Ensure non-negative

  }, [module1Stops, module2Stops, TOTAL_DAILY_MINUTES]);


  const addStop = (module: number) => {
    const newStop: ModuleStop = { id: crypto.randomUUID(), duration: "", nature: "", hm: "", ha: "" };
    if (module === 1) {
      setModule1Stops([...module1Stops, newStop]);
    } else {
      setModule2Stops([...module2Stops, newStop]);
    }
  };

  const deleteStop = (module: number, id: string) => {
    if (module === 1) {
      setModule1Stops(module1Stops.filter(stop => stop.id !== id));
    } else {
       setModule2Stops(module2Stops.filter(stop => stop.id !== id));
    }
  };

  const updateStop = (module: number, id: string, field: keyof Omit<ModuleStop, 'id'>, value: string) => {
     const updater = (stops: ModuleStop[]) => {
        return stops.map(stop => {
            if (stop.id === id) {
                return { ...stop, [field]: value };
            }
            return stop;
        });
    };

    if (module === 1) {
        setModule1Stops(updater(module1Stops));
    } else {
        setModule2Stops(updater(module2Stops));
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-xl font-bold text-foreground">
          RAPPORT JOURNALIER (Activité TSUD)
        </CardTitle>
        <span className="text-sm text-muted-foreground">{currentDate}</span>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="site-select" className="text-foreground">Site</Label>
          <Select defaultValue="USINE SUD">
            <SelectTrigger id="site-select" className="w-full">
              <SelectValue placeholder="Select Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USINE SUD">USINE SUD</SelectItem>
              <SelectItem value="USINE NORD">USINE NORD</SelectItem>
              <SelectItem value="USINE CENTRALE">USINE CENTRALE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Module 1 Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-card">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-foreground">Module 1 - Arrêts</h3>
            <Button variant="link" className="text-primary text-sm p-0 h-auto" onClick={() => addStop(1)}>
              + Ajouter Arrêt
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[120px]">
                    Durée (ex: 1h 30)
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                    Nature
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[100px]">
                    HM
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[100px]">
                    HA
                  </TableHead>
                  <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {module1Stops.map((stop) => (
                  <TableRow key={stop.id} className="hover:bg-muted/50">
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.duration}
                        placeholder="ex: 1h 30"
                        onChange={(e) =>
                          updateStop(1, stop.id, "duration", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.nature}
                        onChange={(e) =>
                          updateStop(1, stop.id, "nature", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.hm}
                        onChange={(e) => updateStop(1, stop.id, "hm", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.ha}
                        onChange={(e) => updateStop(1, stop.id, "ha", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="p-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStop(1, stop.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {module1Stops.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground p-4">
                            Aucun arrêt ajouté pour le Module 1.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
           <div className="mt-2 text-right text-sm text-muted-foreground">
              Total Arrêts Module 1: <strong>{formatMinutesToHoursMinutes(module1TotalDowntime)}</strong>
           </div>
        </div>

        {/* Module 2 Section */}
         <div className="space-y-4 p-4 border rounded-lg bg-card">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-foreground">Module 2 - Arrêts</h3>
            <Button variant="link" className="text-primary text-sm p-0 h-auto" onClick={() => addStop(2)}>
              + Ajouter Arrêt
            </Button>
          </div>

          <div className="overflow-x-auto">
             <Table>
               <TableHeader className="bg-muted/50">
                <TableRow>
                   <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[120px]">
                    Durée (ex: 1h 30)
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                    Nature
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[100px]">
                    HM
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[100px]">
                    HA
                  </TableHead>
                  <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {module2Stops.map((stop) => (
                  <TableRow key={stop.id} className="hover:bg-muted/50">
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.duration}
                        placeholder="ex: 1h 30"
                        onChange={(e) =>
                          updateStop(2, stop.id, "duration", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.nature}
                        onChange={(e) =>
                          updateStop(2, stop.id, "nature", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.hm}
                        onChange={(e) => updateStop(2, stop.id, "hm", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.ha}
                        onChange={(e) => updateStop(2, stop.id, "ha", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="p-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStop(2, stop.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash className="h-4 w-4" />
                         <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {module2Stops.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground p-4">
                            Aucun arrêt ajouté pour le Module 2.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
           <div className="mt-2 text-right text-sm text-muted-foreground">
              Total Arrêts Module 2: <strong>{formatMinutesToHoursMinutes(module2TotalDowntime)}</strong>
           </div>
        </div>

        {/* Totaux Section */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold text-lg text-foreground mb-4">Totaux Temps de Fonctionnement (8h - Arrêts)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Removed md:grid-cols-4 as we only have 2 totals now */}
            <div className="space-y-1">
              <Label htmlFor="total-m1-operating" className="text-sm text-muted-foreground">
                Module 1 Fonctionnement
              </Label>
              <Input id="total-m1-operating" type="text" value={formatMinutesToHoursMinutes(module1OperatingTime)} className="h-9 bg-background/50 font-medium" readOnly />
            </div>
             <div className="space-y-1">
              <Label htmlFor="total-m2-operating" className="text-sm text-muted-foreground">
                Module 2 Fonctionnement
              </Label>
              <Input id="total-m2-operating" type="text" value={formatMinutesToHoursMinutes(module2OperatingTime)} className="h-9 bg-background/50 font-medium" readOnly />
            </div>
             {/* Removed original HM/HA inputs */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <Button variant="outline">Enregistrer Brouillon</Button>
          <Button>Soumettre Rapport</Button>
        </div>
      </CardContent>
    </Card>
  );
}