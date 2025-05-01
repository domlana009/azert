"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Ensure Card is imported
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react"; // Added Plus icon
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Helper function to parse duration strings into minutes (copied from DailyReport)
function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0;
  const cleaned = duration.replace(/[^0-9Hh:·\s]/g, '').trim();
  let hours = 0;
  let minutes = 0;
  let match = cleaned.match(/^(?:(\d{1,2})\s?[Hh:·]\s?)?(\d{1,2})$/);
  if (match) {
    hours = match[1] ? parseInt(match[1], 10) : 0;
    minutes = parseInt(match[2], 10);
    return (hours * 60) + minutes;
  }
  match = cleaned.match(/^(\d{1,2})\s?[Hh]$/);
  if (match) {
    hours = parseInt(match[1], 10);
    return hours * 60;
  }
  match = cleaned.match(/^(\d+)$/);
  if (match) {
    minutes = parseInt(match[1], 10);
    return minutes;
  }
  console.warn(`Could not parse duration: "${duration}"`);
  return 0;
}

// Helper function to format minutes into HHh MMm string (copied from DailyReport)
function formatMinutesToHoursMinutes(totalMinutes: number): string {
  if (isNaN(totalMinutes) || totalMinutes < 0) return "0h 0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}


interface ActivityReportProps {
  currentDate: string;
}

type Poste = "1er" | "2ème" | "3ème";

// Updated Poste times and order
const POSTE_TIMES: Record<Poste, string> = {
  "3ème": "22:30 - 06:30",
  "1er": "06:30 - 14:30",
  "2ème": "14:30 - 22:30",
};
const POSTE_ORDER: Poste[] = ["3ème", "1er", "2ème"];

interface Stop {
  id: string;
  duration: string;
  nature: string;
}

// Updated Counter interface: removed post and total
interface Counter {
    id: string;
    start: string;
    end: string;
}

// Interface for Liaison Counters (same structure as Counter)
interface LiaisonCounter {
    id: string;
    start: string;
    end: string;
}

export function ActivityReport({ currentDate }: ActivityReportProps) {
  const TOTAL_SHIFT_MINUTES = 8 * 60; // 8-hour shift

  const [selectedPoste, setSelectedPoste] = useState<Poste>("1er"); // Default to 1er Poste
  const [stops, setStops] = useState<Stop[]>([
    { id: crypto.randomUUID(), duration: "4h 10", nature: "Manque Produit" },
    {
      id: crypto.randomUUID(),
      duration: "1h 15", // Changed format for testing
      nature: "Attent Saturation SiCo",
    },
  ]);
  // Updated initial state for vibrator counters
  const [vibratorCounters, setVibratorCounters] = useState<Counter[]>([
    { id: crypto.randomUUID(), start: "93h41r", end: "9395,30" },
  ]);
  // State for liaison counters
  const [liaisonCounters, setLiaisonCounters] = useState<LiaisonCounter[]>([
    { id: crypto.randomUUID(), start: "", end: "" }, // Initial empty liaison counter
  ]);

  const [totalDowntime, setTotalDowntime] = useState(0);
  const [operatingTime, setOperatingTime] = useState(TOTAL_SHIFT_MINUTES);


  // Calculate total downtime and operating time whenever stops change
  useEffect(() => {
    const calculatedDowntime = stops.reduce((acc, stop) => acc + parseDurationToMinutes(stop.duration), 0);
    setTotalDowntime(calculatedDowntime);

    const calculatedOperatingTime = TOTAL_SHIFT_MINUTES - calculatedDowntime;
    setOperatingTime(calculatedOperatingTime >= 0 ? calculatedOperatingTime : 0); // Ensure non-negative

  }, [stops, TOTAL_SHIFT_MINUTES]);


  const addStop = () => {
    setStops([...stops, { id: crypto.randomUUID(), duration: "", nature: "" }]);
  };

  // Updated addVibratorCounter to match new interface
  const addVibratorCounter = () => {
    setVibratorCounters([...vibratorCounters, { id: crypto.randomUUID(), start: "", end: "" }]);
  };

  // Function to add liaison counter
  const addLiaisonCounter = () => {
    setLiaisonCounters([...liaisonCounters, { id: crypto.randomUUID(), start: "", end: "" }]);
  };


  const deleteStop = (id: string) => {
    setStops(stops.filter(stop => stop.id !== id));
  };

  const deleteVibratorCounter = (id: string) => {
    setVibratorCounters(vibratorCounters.filter(counter => counter.id !== id));
  };

   // Function to delete liaison counter
  const deleteLiaisonCounter = (id: string) => {
    setLiaisonCounters(liaisonCounters.filter(counter => counter.id !== id));
  };

 // Update field type to exclude hm and ha
 const updateStop = (id: string, field: keyof Omit<Stop, 'id'>, value: string) => {
    setStops(stops.map(stop => stop.id === id ? { ...stop, [field]: value } : stop));
 };

 // Updated updateVibratorCounter signature
 const updateVibratorCounter = (id: string, field: keyof Omit<Counter, 'id'>, value: string) => {
    setVibratorCounters(vibratorCounters.map(counter => counter.id === id ? { ...counter, [field]: value } : counter));
 };

 // Function to update liaison counter
 const updateLiaisonCounter = (id: string, field: keyof Omit<LiaisonCounter, 'id'>, value: string) => {
    setLiaisonCounters(liaisonCounters.map(counter => counter.id === id ? { ...counter, [field]: value } : counter));
 };


  return (
    <Card className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-xl font-bold">
          RAPPORT D'ACTIVITÉ TNR
        </CardTitle>
        <span className="text-sm text-muted-foreground">{currentDate}</span>
      </CardHeader>

      <CardContent className="p-0 space-y-6"> {/* Added space-y-6 */}
         {/* Poste Selection */}
         <div className="space-y-2"> {/* Replaced mb-6 */}
            <Label className="text-foreground">Poste</Label>
            <RadioGroup
              value={selectedPoste} // Controlled component
              onValueChange={(value: Poste) => setSelectedPoste(value)}
              className="flex flex-wrap space-x-4 pt-2"
            >
              {POSTE_ORDER.map((poste) => ( // Use defined order
                <div key={poste} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={poste} id={`activity-poste-${poste}`} />
                  <Label htmlFor={`activity-poste-${poste}`} className="font-normal text-foreground">
                    {poste} Poste <span className="text-muted-foreground text-xs">({POSTE_TIMES[poste]})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

        {/* Arrêts Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-card"> {/* Replaced mb-6 and added styling */}
           <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-foreground">Arrêts</h3>
              <Button variant="link" onClick={addStop} className="text-primary text-sm p-0 h-auto">
                <Plus className="h-4 w-4 mr-1" /> Ajouter Arrêt
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
                  <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stops.map((stop) => (
                  <TableRow key={stop.id} className="hover:bg-muted/50">
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm" // w-24 removed -> w-full
                        placeholder="ex: 1h 30"
                        value={stop.duration}
                        onChange={(e) =>
                          updateStop(stop.id, "duration", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.nature}
                        onChange={(e) =>
                          updateStop(stop.id, "nature", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2 text-right">
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStop(stop.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash className="h-4 w-4" />
                         <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {stops.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground p-4">
                            Aucun arrêt ajouté.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
           <div className="mt-2 text-right text-sm text-muted-foreground">
              Total Arrêts: <strong>{formatMinutesToHoursMinutes(totalDowntime)}</strong>
           </div>
        </div>

         {/* Operating Time Display */}
         <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold text-lg text-foreground mb-2">Temps de Fonctionnement (8h - Arrêts)</h3>
            <div className="space-y-1">
                <Label htmlFor="total-operating-tnr" className="text-sm text-muted-foreground">
                    Temps de Fonctionnement Estimé
                </Label>
                <Input id="total-operating-tnr" type="text" value={formatMinutesToHoursMinutes(operatingTime)} className="h-9 bg-input font-medium" readOnly />
            </div>
        </div>


        {/* Compteurs Vibreurs Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-card"> {/* Replaced mb-6 and added styling */}
           <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-foreground">Compteurs Vibreurs</h3>
               <Button variant="link" className="text-primary text-sm p-0 h-auto" onClick={addVibratorCounter}>
                 <Plus className="h-4 w-4 mr-1" /> Ajouter Vibreur
              </Button>
            </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {/* Removed Poste Header */}
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                    Début
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                    Fin
                  </TableHead>
                  {/* Removed Total Header */}
                  <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vibratorCounters.map((counter) => (
                  <TableRow key={counter.id} className="hover:bg-muted/50">
                    {/* Removed Poste Cell */}
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={counter.start}
                        onChange={(e) =>
                          updateVibratorCounter(counter.id, "start", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                         className="w-full h-8 text-sm"
                        value={counter.end}
                        onChange={(e) =>
                          updateVibratorCounter(counter.id, "end", e.target.value)
                        }
                      />
                    </TableCell>
                    {/* Removed Total Cell */}
                    <TableCell className="p-2 text-right">
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteVibratorCounter(counter.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {vibratorCounters.length === 0 && (
                    <TableRow>
                        {/* Adjusted colSpan */}
                        <TableCell colSpan={3} className="text-center text-muted-foreground p-4">
                            Aucun compteur vibreur ajouté.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
          {/* Removed Total Vibreurs input */}
        </div>

         {/* Compteurs LIAISON Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-card">
           <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-foreground">Compteurs LIAISON</h3>
               <Button variant="link" className="text-primary text-sm p-0 h-auto" onClick={addLiaisonCounter}>
                 <Plus className="h-4 w-4 mr-1" /> Ajouter Liaison
              </Button>
            </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                    Début
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                    Fin
                  </TableHead>
                  <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liaisonCounters.map((counter) => (
                  <TableRow key={counter.id} className="hover:bg-muted/50">
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={counter.start}
                        onChange={(e) =>
                          updateLiaisonCounter(counter.id, "start", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                         className="w-full h-8 text-sm"
                        value={counter.end}
                        onChange={(e) =>
                          updateLiaisonCounter(counter.id, "end", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2 text-right">
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLiaisonCounter(counter.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {liaisonCounters.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground p-4">
                            Aucun compteur liaison ajouté.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
        </div>


        {/* Stock Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-card"> {/* Replaced mb-6 and added styling */}
          <h3 className="font-semibold text-lg text-foreground">Stock</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-3 rounded-lg border"> {/* Adjusted background */}
              <h4 className="font-medium text-foreground mb-2">PARK 1</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="block text-muted-foreground text-xs mb-1">
                    NORMAL
                  </Label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
                <div>
                  <Label className="block text-muted-foreground text-xs mb-1">
                    OCEANE
                  </Label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
                <div>
                  <Label className="block text-muted-foreground text-xs mb-1">
                    PB30
                  </Label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border"> {/* Adjusted background */}
              <h4 className="font-medium text-foreground mb-2">PARK 2</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="block text-muted-foreground text-xs mb-1">
                    NORMAL
                  </Label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
                <div>
                  <Label className="block text-muted-foreground text-xs mb-1">
                    OCEANE
                  </Label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
                <div>
                  <Label className="block text-muted-foreground text-xs mb-1">
                    PB30
                  </Label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
              </div>
              <div className="mt-2">
                <Label className="block text-muted-foreground text-xs mb-1">
                  Poste
                </Label>
                <Input type="text" className="h-8 text-sm" defaultValue="3+1+2" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3"> {/* Added margin-top */}
          <Button variant="outline">Enregistrer Brouillon</Button>
          <Button>Soumettre Rapport</Button>
        </div>
      </CardContent>
    </Card>
  );
}

