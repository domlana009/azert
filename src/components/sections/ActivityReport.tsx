"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Ensure Card is imported
import { Button } from "@/components/ui/button";
import { Trash, Plus, AlertCircle } from "lucide-react"; // Added Plus icon and AlertCircle
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert for displaying errors
import { cn } from "@/lib/utils"; // Import cn for conditional classes

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
  if (isNaN(totalMinutes) || totalMinutes <= 0) return "0h 0m"; // Return 0 if non-positive
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60); // Round minutes
  return `${hours}h ${minutes}m`;
}

// Helper function to validate and parse counter values
function validateAndParseCounterValue(value: string): number | null {
    if (!value) return 0; // Treat empty as 0 for calculation, but might be invalid based on context
    const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    // Allow empty or just "." or "," as intermediate states, but they parse to NaN
    if (cleaned === '' || cleaned === '.' || cleaned === ',') return null; // Indicate parsing failure/incompleteness
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed; // Return null if parsing failed
}


// Helper function to calculate total duration in minutes from counters, considering validation
function calculateTotalCounterMinutes(counters: Array<{ start: string; end: string; error?: string }>): number {
  const totalHours = counters.reduce((acc, counter) => {
    // Only include valid entries in the sum
    if (counter.error) return acc; // Skip entries with errors

    const startHours = validateAndParseCounterValue(counter.start);
    const endHours = validateAndParseCounterValue(counter.end);

    // Check if parsing was successful and end >= start
    if (startHours !== null && endHours !== null && endHours >= startHours) {
      return acc + (endHours - startHours);
    }
    // Ignore invalid or incomplete entries for the total calculation
    return acc;
  }, 0);
  return Math.round(totalHours * 60); // Convert total hours to minutes and round
}


interface ActivityReportProps {
  currentDate: string;
}

type Poste = "1er" | "2ème" | "3ème";
type Park = 'PARK 1' | 'PARK 2' | 'PARK 3';
type StockType = 'NORMAL' | 'OCEANE' | 'PB30';
type StockTime = 'HEURE DEBUT STOCK';

// Updated Poste times and order
const POSTE_TIMES: Record<Poste, string> = {
  "3ème": "22:30 - 06:30",
  "1er": "06:30 - 14:30",
  "2ème": "14:30 - 22:30",
};
const POSTE_ORDER: Poste[] = ["3ème", "1er", "2ème"];
const PARKS: Park[] = ['PARK 1', 'PARK 2', 'PARK 3'];
const STOCK_TYPES: StockType[] = ['NORMAL', 'OCEANE', 'PB30'];
const STOCK_TIME_LABEL: StockTime = 'HEURE DEBUT STOCK';


interface Stop {
  id: string;
  duration: string;
  nature: string;
}

// Updated Counter interface: removed post and total, added optional error field
interface Counter {
    id: string;
    start: string;
    end: string;
    error?: string; // Optional error message for this entry
}

// Interface for Liaison Counters (same structure as Counter)
interface LiaisonCounter {
    id: string;
    start: string;
    end: string;
    error?: string; // Optional error message for this entry
}

// Simplified Stock Entry interface
interface StockEntry {
  id: string;
  park: Park | '';
  type: StockType | ''; // Only product types
  quantity: string; // For NORMAL, OCEANE, PB30
  startTime: string; // For HEURE DEBUT STOCK
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
    { id: crypto.randomUUID(), start: "9341.0", end: "9395.30" }, // Example values
  ]);
  // State for liaison counters
  const [liaisonCounters, setLiaisonCounters] = useState<LiaisonCounter[]>([
    { id: crypto.randomUUID(), start: "100.5", end: "105.75" }, // Example values
  ]);
  // Updated state for stock entries
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([
      { id: crypto.randomUUID(), park: '', type: '', quantity: '', startTime: '' } // Start with one empty entry
  ]);
  // State for the single "Heure Debut Stock" time
  const [stockStartTime, setStockStartTime] = useState('');


  const [totalDowntime, setTotalDowntime] = useState(0);
  const [operatingTime, setOperatingTime] = useState(TOTAL_SHIFT_MINUTES);
  // State for total counter durations
  const [totalVibratorMinutes, setTotalVibratorMinutes] = useState(0);
  const [totalLiaisonMinutes, setTotalLiaisonMinutes] = useState(0);
  // State to track if there are any counter errors
  const [hasVibratorErrors, setHasVibratorErrors] = useState(false);
  const [hasLiaisonErrors, setHasLiaisonErrors] = useState(false);


  // Calculate total downtime and operating time whenever stops change
  useEffect(() => {
    const calculatedDowntime = stops.reduce((acc, stop) => acc + parseDurationToMinutes(stop.duration), 0);
    setTotalDowntime(calculatedDowntime);

    const calculatedOperatingTime = TOTAL_SHIFT_MINUTES - calculatedDowntime;
    setOperatingTime(calculatedOperatingTime >= 0 ? calculatedOperatingTime : 0); // Ensure non-negative

  }, [stops, TOTAL_SHIFT_MINUTES]);

  // Calculate total counter durations and check for errors whenever counters change
  useEffect(() => {
    setTotalVibratorMinutes(calculateTotalCounterMinutes(vibratorCounters));
    setHasVibratorErrors(vibratorCounters.some(c => !!c.error));
  }, [vibratorCounters]);

  useEffect(() => {
    setTotalLiaisonMinutes(calculateTotalCounterMinutes(liaisonCounters));
    setHasLiaisonErrors(liaisonCounters.some(c => !!c.error));
  }, [liaisonCounters]);


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

   // Function to add stock entry
   const addStockEntry = () => {
        setStockEntries([...stockEntries, { id: crypto.randomUUID(), park: '', type: '', quantity: '', startTime: '' }]);
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

  // Function to delete stock entry
  const deleteStockEntry = (id: string) => {
    setStockEntries(stockEntries.filter(entry => entry.id !== id));
  };

 // Update field type to exclude hm and ha
 const updateStop = (id: string, field: keyof Omit<Stop, 'id'>, value: string) => {
    setStops(stops.map(stop => stop.id === id ? { ...stop, [field]: value } : stop));
 };

 // Function to validate a single counter entry
 const validateCounterEntry = (startStr: string, endStr: string): string | undefined => {
    const startVal = validateAndParseCounterValue(startStr);
    const endVal = validateAndParseCounterValue(endStr);

    // Check if both are valid numbers
    if (startVal === null && startStr !== '' && startStr !== '.' && startStr !== ',') return "Début invalide.";
    if (endVal === null && endStr !== '' && endStr !== '.' && endStr !== ',') return "Fin invalide.";

    // Check if end is >= start (only if both are valid numbers)
    if (startVal !== null && endVal !== null && endVal < startVal) {
        return "Fin < Début.";
    }

    // Check against operating time (optional, requires careful consideration)
    // const duration = (startVal !== null && endVal !== null) ? endVal - startVal : 0;
    // if (duration * 60 > operatingTime) {
    //     return "Durée > Temps Op.";
    // }

    return undefined; // No error
 };


 // Updated updateVibratorCounter with validation
 const updateVibratorCounter = (id: string, field: keyof Omit<Counter, 'id' | 'error'>, value: string) => {
    setVibratorCounters(vibratorCounters.map(counter => {
        if (counter.id === id) {
            const updatedCounter = { ...counter, [field]: value };
            // Validate after update
            const error = validateCounterEntry(
                field === 'start' ? value : updatedCounter.start,
                field === 'end' ? value : updatedCounter.end
            );
            return { ...updatedCounter, error };
        }
        return counter;
    }));
 };

 // Function to update liaison counter with validation
 const updateLiaisonCounter = (id: string, field: keyof Omit<LiaisonCounter, 'id' | 'error'>, value: string) => {
    setLiaisonCounters(liaisonCounters.map(counter => {
         if (counter.id === id) {
            const updatedCounter = { ...counter, [field]: value };
            // Validate after update
            const error = validateCounterEntry(
                field === 'start' ? value : updatedCounter.start,
                field === 'end' ? value : updatedCounter.end
            );
             return { ...updatedCounter, error };
        }
        return counter;
    }));
 };


 // Function to update stock entry - simplified
 const updateStockEntry = (id: string, field: keyof Omit<StockEntry, 'id'>, value: string | boolean, parkOrType?: Park | StockType) => {
    setStockEntries(stockEntries.map(entry => {
      if (entry.id === id) {
        if (field === 'park') {
           // Only allow one park selection per entry
          return { ...entry, park: value as Park, type: '', quantity: '' }; // Reset type/quantity when park changes
        } else if (field === 'type') {
          // Only allow one type selection per entry
          return { ...entry, type: value as StockType, quantity: '' }; // Reset quantity when type changes
        } else if (field === 'quantity') {
          return { ...entry, quantity: value as string };
        }
      }
      return entry;
    }));
  };

  // Handle form submission - Prevent if counter errors exist
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Re-validate all counters on submit just in case
    let vibratorValidationFailed = false;
    setVibratorCounters(currentCounters => currentCounters.map(c => {
        const error = validateCounterEntry(c.start, c.end);
        if (error) vibratorValidationFailed = true;
        return { ...c, error };
    }));

    let liaisonValidationFailed = false;
    setLiaisonCounters(currentCounters => currentCounters.map(c => {
        const error = validateCounterEntry(c.start, c.end);
        if (error) liaisonValidationFailed = true;
        return { ...c, error };
    }));


    if (vibratorValidationFailed || liaisonValidationFailed) {
        console.error("Validation failed: Invalid counter inputs detected.");
        // Optionally, provide user feedback (e.g., using a toast)
        // toast({ title: "Erreur de Validation", description: "Veuillez corriger les erreurs dans les compteurs.", variant: "destructive" });
        return; // Stop submission
    }

    // If validation passes, proceed with submission logic
    console.log("Submitting Activity Report:", {
        selectedPoste,
        stops,
        vibratorCounters,
        liaisonCounters,
        stockEntries,
        stockStartTime,
        totalDowntime,
        operatingTime,
        totalVibratorMinutes,
        totalLiaisonMinutes,
    });
    // TODO: Replace console.log with actual API call or state management update
    // e.g., await submitActivityReport({ ... });
  };


  return (
    <Card className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-xl font-bold">
          RAPPORT D'ACTIVITÉ TNR
        </CardTitle>
        <span className="text-sm text-muted-foreground">{currentDate}</span>
      </CardHeader>

      {/* Wrap content in a form */}
       <form onSubmit={handleSubmit}>
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
                        <Button variant="link" type="button" onClick={addStop} className="text-primary text-sm p-0 h-auto">
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
                                        type="button" // Prevent form submission
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
                        <Input id="total-operating-tnr" type="text" value={formatMinutesToHoursMinutes(operatingTime)} className="h-9 bg-input font-medium" readOnly tabIndex={-1}/>
                    </div>
                </div>


                {/* Compteurs Vibreurs Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-card"> {/* Replaced mb-6 and added styling */}
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-foreground">Compteurs Vibreurs</h3>
                        <Button variant="link" type="button" className="text-primary text-sm p-0 h-auto" onClick={addVibratorCounter}>
                            <Plus className="h-4 w-4 mr-1" /> Ajouter Vibreur
                        </Button>
                    </div>
                    {/* General Error Alert for Vibrator Counters */}
                    {hasVibratorErrors && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Erreur(s) dans les compteurs vibreurs. Vérifiez les valeurs (Fin ≥ Début).
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                                    Début (ex: 9341.0)
                                </TableHead>
                                <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                                    Fin (ex: 9395.3)
                                </TableHead>
                                <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vibratorCounters.map((counter) => (
                                <TableRow key={counter.id} className="hover:bg-muted/50">
                                    <TableCell className="p-2">
                                    <Input
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal" // Hint for mobile keyboards
                                        className={cn("w-full h-8 text-sm", counter.error && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.start}
                                        placeholder="Index début"
                                        onChange={(e) =>
                                        updateVibratorCounter(counter.id, "start", e.target.value)
                                        }
                                        aria-invalid={!!counter.error}
                                        aria-describedby={counter.error ? `error-vibrator-${counter.id}` : undefined}
                                    />
                                     {counter.error && <p id={`error-vibrator-${counter.id}`} className="text-xs text-destructive pt-1">{counter.error}</p>}
                                    </TableCell>
                                    <TableCell className="p-2">
                                    <Input
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-sm", counter.error && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.end}
                                        placeholder="Index fin"
                                        onChange={(e) =>
                                        updateVibratorCounter(counter.id, "end", e.target.value)
                                        }
                                         aria-invalid={!!counter.error}
                                         aria-describedby={counter.error ? `error-vibrator-${counter.id}` : undefined}
                                    />
                                    {/* Display error inline only if error exists and is on the 'end' field logic */}
                                    {counter.error?.includes("Fin") && <p id={`error-vibrator-${counter.id}`} className="text-xs text-destructive pt-1">{counter.error}</p>}
                                    </TableCell>
                                    <TableCell className="p-2 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button" // Prevent form submission
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
                                        <TableCell colSpan={3} className="text-center text-muted-foreground p-4">
                                            Aucun compteur vibreur ajouté.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Display Total Vibreur Duration */}
                    <div className="mt-2 text-right text-sm text-muted-foreground">
                        Durée Totale Vibreurs: <strong>{formatMinutesToHoursMinutes(totalVibratorMinutes)}</strong>
                    </div>
                </div>

                {/* Compteurs LIAISON Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-foreground">Compteurs LIAISON</h3>
                        <Button variant="link" type="button" className="text-primary text-sm p-0 h-auto" onClick={addLiaisonCounter}>
                            <Plus className="h-4 w-4 mr-1" /> Ajouter Liaison
                        </Button>
                    </div>
                     {/* General Error Alert for Liaison Counters */}
                     {hasLiaisonErrors && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Erreur(s) dans les compteurs liaison. Vérifiez les valeurs (Fin ≥ Début).
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                                    Début (ex: 100.5)
                                </TableHead>
                                <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                                    Fin (ex: 105.75)
                                </TableHead>
                                <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {liaisonCounters.map((counter) => (
                                <TableRow key={counter.id} className="hover:bg-muted/50">
                                    <TableCell className="p-2">
                                    <Input
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-sm", counter.error && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.start}
                                        placeholder="Index début"
                                        onChange={(e) =>
                                        updateLiaisonCounter(counter.id, "start", e.target.value)
                                        }
                                        aria-invalid={!!counter.error}
                                        aria-describedby={counter.error ? `error-liaison-${counter.id}` : undefined}
                                    />
                                    {counter.error && <p id={`error-liaison-${counter.id}`} className="text-xs text-destructive pt-1">{counter.error}</p>}
                                    </TableCell>
                                    <TableCell className="p-2">
                                    <Input
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-sm", counter.error && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.end}
                                        placeholder="Index fin"
                                        onChange={(e) =>
                                        updateLiaisonCounter(counter.id, "end", e.target.value)
                                        }
                                        aria-invalid={!!counter.error}
                                        aria-describedby={counter.error ? `error-liaison-${counter.id}` : undefined}
                                    />
                                     {/* Display error inline only if error exists and is on the 'end' field logic */}
                                     {counter.error?.includes("Fin") && <p id={`error-liaison-${counter.id}`} className="text-xs text-destructive pt-1">{counter.error}</p>}
                                    </TableCell>
                                    <TableCell className="p-2 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button" // Prevent form submission
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
                    {/* Display Total Liaison Duration */}
                    <div className="mt-2 text-right text-sm text-muted-foreground">
                        Durée Totale Liaison: <strong>{formatMinutesToHoursMinutes(totalLiaisonMinutes)}</strong>
                    </div>
                </div>


                {/* Stock Section - Simplified */}
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg text-foreground">Stock</h3>
                        <Button variant="link" type="button" className="text-primary text-sm p-0 h-auto" onClick={addStockEntry}>
                        <Plus className="h-4 w-4 mr-1" /> Ajouter Entrée Stock
                        </Button>
                    </div>

                    {/* HEURE DEBUT STOCK Input */}
                    <div className="mb-4">
                        <Label htmlFor="stock-start-time" className="font-medium text-foreground">{STOCK_TIME_LABEL}</Label>
                        <Input
                            id="stock-start-time"
                            type="time"
                            className="w-full h-9 mt-1"
                            value={stockStartTime}
                            onChange={(e) => setStockStartTime(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[150px]">PARK</TableHead>
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[250px]">Type Produit</TableHead>
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">Quantité</TableHead>
                            <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockEntries.map((entry) => (
                            <TableRow key={entry.id} className="hover:bg-muted/50">
                                {/* Park Checkboxes */}
                                <TableCell className="p-2 align-top">
                                <div className="space-y-2">
                                    {PARKS.map(park => (
                                    <div key={park} className="flex items-center space-x-2">
                                        <Checkbox
                                        id={`${entry.id}-${park}`}
                                        checked={entry.park === park}
                                        onCheckedChange={(checked) => updateStockEntry(entry.id, 'park', checked ? park : '', park)}
                                        />
                                        <Label htmlFor={`${entry.id}-${park}`} className="font-normal text-sm">{park}</Label>
                                    </div>
                                    ))}
                                </div>
                                </TableCell>
                                {/* Type Checkboxes */}
                                <TableCell className="p-2 align-top">
                                <div className="space-y-2">
                                    {STOCK_TYPES.map(type => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <Checkbox
                                        id={`${entry.id}-${type}`}
                                        checked={entry.type === type}
                                        disabled={!entry.park} // Disable if no park selected
                                        onCheckedChange={(checked) => updateStockEntry(entry.id, 'type', checked ? type : '', type)}
                                        />
                                        <Label htmlFor={`${entry.id}-${type}`} className={`font-normal text-sm ${!entry.park ? 'text-muted-foreground' : ''}`}>{type}</Label>
                                    </div>
                                    ))}
                                </div>
                                </TableCell>
                                {/* Quantity Input */}
                                <TableCell className="p-2 align-top">
                                <Input
                                    type="number"
                                    step="0.01" // Allow decimals
                                    min="0"
                                    className="w-full h-8 text-sm mt-1" // Align with checkboxes
                                    placeholder="Quantité"
                                    value={entry.quantity}
                                    disabled={!entry.type} // Disable if no type selected
                                    onChange={(e) => updateStockEntry(entry.id, "quantity", e.target.value)}
                                />
                                </TableCell>
                                {/* Delete Button */}
                                <TableCell className="p-2 text-right align-top">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button" // Prevent form submission
                                    onClick={() => deleteStockEntry(entry.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 mt-1" // Align with checkboxes
                                >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Supprimer</span>
                                </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                            {stockEntries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground p-4">
                                        Aucune entrée de stock ajoutée.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </div>
                </div>


                {/* Action Buttons */}
                <div className="mt-8 flex justify-end space-x-3"> {/* Added margin-top */}
                    <Button type="button" variant="outline">Enregistrer Brouillon</Button> {/* Changed to type="button" */}
                    <Button type="submit" disabled={hasVibratorErrors || hasLiaisonErrors}>
                        Soumettre Rapport
                    </Button> {/* Disable submit if errors */}
                </div>
            </CardContent>
        </form>
    </Card>
  );
}
