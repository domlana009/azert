"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // Import Select components

interface DailyReportProps {
  selectedDate: Date;
}

interface ModuleStop {
  id: string;
  duration: string;
  nature: string;
}

// Keep Poste constants for potential context or future use
type Poste = "1er" | "2ème" | "3ème";

// Updated Poste times and order
const POSTE_TIMES: Record<Poste, string> = {
  "3ème": "22:30 - 06:30",
  "1er": "06:30 - 14:30",
  "2ème": "14:30 - 22:30",
};
const POSTE_ORDER: Poste[] = ["3ème", "1er", "2ème"];


// Helper function to parse duration strings into minutes
function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0;
  const cleaned = duration.replace(/[^0-9Hh:·\s]/g, '').trim();
  let hours = 0;
  let minutes = 0;
  let match = cleaned.match(/^(?:(\d{1,2})\s?[Hh:·]\s?)?(\d{1,2})$/);
  if (match) {
    hours = match[1] ? parseInt(match[1], 10) : 0;
    minutes = parseInt(match[2], 10);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return (hours * 60) + minutes;
  }
  match = cleaned.match(/^(\d{1,2})\s?[Hh]$/);
  if (match) {
    hours = parseInt(match[1], 10);
    if (isNaN(hours)) return 0;
    return hours * 60;
  }
  match = cleaned.match(/^(\d+)$/);
  if (match) {
    minutes = parseInt(match[1], 10);
    if (isNaN(minutes)) return 0;
    return minutes;
  }
  console.warn(`Could not parse duration: "${duration}"`);
  return 0;
}


// Helper function to format minutes into HHh MMm string
function formatMinutesToHoursMinutes(totalMinutes: number): string {
    if (isNaN(totalMinutes) || totalMinutes <= 0) return "0h 0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
}


export function DailyReport({ selectedDate }: DailyReportProps) {
  const TOTAL_PERIOD_MINUTES = 24 * 60;


  const [module1Stops, setModule1Stops] = useState<ModuleStop[]>([
    {
      id: crypto.randomUUID(),
      duration: "",
      nature: "",
    },
  ]);
  const [module2Stops, setModule2Stops] = useState<ModuleStop[]>([
    { id: crypto.randomUUID(), duration: "", nature: "" },
  ]);

  const [module1TotalDowntime, setModule1TotalDowntime] = useState(0);
  const [module2TotalDowntime, setModule2TotalDowntime] = useState(0);
  const [module1OperatingTime, setModule1OperatingTime] = useState(TOTAL_PERIOD_MINUTES);
  const [module2OperatingTime, setModule2OperatingTime] = useState(TOTAL_PERIOD_MINUTES);

   const formattedDate = selectedDate.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });


   useEffect(() => {
    const calculateTotals = (stops: ModuleStop[]) => {
      const totalDowntime = stops.reduce((acc, stop) => {
          const minutes = parseDurationToMinutes(stop.duration);
          if (isNaN(minutes)) {
              console.warn(`Invalid duration format for stop ${stop.id}: "${stop.duration}"`);
              return acc;
          }
          return acc + minutes;
      }, 0);
      const operatingTime = TOTAL_PERIOD_MINUTES - totalDowntime;
      return { totalDowntime, operatingTime };
    };

    const { totalDowntime: m1Downtime, operatingTime: m1Operating } = calculateTotals(module1Stops);
    setModule1TotalDowntime(m1Downtime);
    setModule1OperatingTime(m1Operating >= 0 ? m1Operating : 0);

    const { totalDowntime: m2Downtime, operatingTime: m2Operating } = calculateTotals(module2Stops);
    setModule2TotalDowntime(m2Downtime);
    setModule2OperatingTime(m2Operating >= 0 ? m2Operating : 0);

  }, [module1Stops, module2Stops, TOTAL_PERIOD_MINUTES]);


  const addStop = (module: number) => {
    const newStop: ModuleStop = { id: crypto.randomUUID(), duration: "", nature: "" };
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
    <Card className="bg-card text-card-foreground rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-lg sm:text-xl font-bold">
          RAPPORT JOURNALIER (Activité TSUD)
        </CardTitle>
        <span className="text-xs sm:text-sm text-muted-foreground">{formattedDate}</span>
      </CardHeader>

      <CardContent className="p-0 space-y-6">

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
                  <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[120px]">
                    Durée (ex: 1h 30)
                  </TableHead>
                  <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[150px]">
                    Nature
                  </TableHead>
                  <TableHead className="p-2 text-right text-xs sm:text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {module1Stops.map((stop) => (
                  <TableRow key={stop.id} className="hover:bg-muted/50">
                    <TableCell className="p-1 sm:p-2">
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
                    <TableCell className="p-1 sm:p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.nature}
                        onChange={(e) =>
                          updateStop(1, stop.id, "nature", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-1 sm:p-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStop(1, stop.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {module1Stops.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground p-4 text-xs sm:text-sm">
                            Aucun arrêt ajouté pour le Module 1.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
           <div className="mt-2 text-right text-xs sm:text-sm text-muted-foreground">
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
                   <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[120px]">
                    Durée (ex: 1h 30)
                  </TableHead>
                  <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[150px]">
                    Nature
                  </TableHead>
                  <TableHead className="p-2 text-right text-xs sm:text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {module2Stops.map((stop) => (
                  <TableRow key={stop.id} className="hover:bg-muted/50">
                    <TableCell className="p-1 sm:p-2">
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
                    <TableCell className="p-1 sm:p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.nature}
                        onChange={(e) =>
                          updateStop(2, stop.id, "nature", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-1 sm:p-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStop(2, stop.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
                      >
                        <Trash className="h-4 w-4" />
                         <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {module2Stops.length === 0 && (
                    <TableRow>
                         <TableCell colSpan={3} className="text-center text-muted-foreground p-4 text-xs sm:text-sm">
                            Aucun arrêt ajouté pour le Module 2.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
           <div className="mt-2 text-right text-xs sm:text-sm text-muted-foreground">
              Total Arrêts Module 2: <strong>{formatMinutesToHoursMinutes(module2TotalDowntime)}</strong>
           </div>
        </div>

        {/* Totaux Section */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold text-lg text-foreground mb-4">Totaux Temps de Fonctionnement (24h - Arrêts)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="total-m1-operating" className="text-xs sm:text-sm text-muted-foreground">
                Module 1 Fonctionnement
              </Label>
              <Input id="total-m1-operating" type="text" value={formatMinutesToHoursMinutes(module1OperatingTime)} className="h-8 sm:h-9 bg-input font-medium text-sm" readOnly tabIndex={-1} />
            </div>
             <div className="space-y-1">
              <Label htmlFor="total-m2-operating" className="text-xs sm:text-sm text-muted-foreground">
                Module 2 Fonctionnement
              </Label>
              <Input id="total-m2-operating" type="text" value={formatMinutesToHoursMinutes(module2OperatingTime)} className="h-8 sm:h-9 bg-input font-medium text-sm" readOnly tabIndex={-1} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-2 sm:space-x-3">
          <Button type="button" variant="outline" size="sm">Enregistrer Brouillon</Button>
          <Button type="submit" size="sm">Soumettre Rapport</Button>
        </div>
      </CardContent>
    </Card>
  );
}
