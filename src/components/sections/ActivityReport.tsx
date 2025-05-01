
"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Ensure Card is imported
import { Button } from "@/components/ui/button";
import { Trash, Plus, AlertCircle } from "lucide-react"; // Added Plus icon and AlertCircle
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Removed RadioGroup import
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
  return 0; // Return 0 if parsing fails
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

// Define total minutes for a 24-hour period
const TOTAL_PERIOD_MINUTES = 24 * 60; // Changed from 8 * 60

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

// Keep Poste constants for potential context or future use, even if UI element is removed
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

// Updated Counter interface: added poste, removed total, added optional error field
interface Counter {
    id: string;
    poste?: Poste | ''; // Added optional Poste field
    start: string;
    end: string;
    error?: string; // Optional error message for this entry
}

// Interface for Liaison Counters (same structure as Counter) - Added poste
interface LiaisonCounter {
    id: string;
    poste?: Poste | ''; // Added optional Poste field
    start: string;
    end: string;
    error?: string; // Optional error message for this entry
}

// Simplified Stock Entry interface - Added poste field
interface StockEntry {
  id: string;
  poste: Poste | ''; // Added Poste selection
  park: Park | '';
  type: StockType | ''; // Only product types
  quantity: string; // For NORMAL, OCEANE, PB30
  startTime: string; // For HEURE DEBUT STOCK - kept separate for clarity
  error?: string; // Optional error for poste selection
}


export function ActivityReport({ currentDate }: ActivityReportProps) {


  // const [selectedPoste, setSelectedPoste] = useState<Poste>("1er"); // Removed Poste selection state
  const [stops, setStops] = useState<Stop[]>([
    { id: crypto.randomUUID(), duration: "4h 10", nature: "Manque Produit" },
    {
      id: crypto.randomUUID(),
      duration: "1h 15", // Changed format for testing
      nature: "Attent Saturation SiCo",
    },
  ]);
  // Updated initial state for vibrator counters to include poste
  const [vibratorCounters, setVibratorCounters] = useState<Counter[]>([
    { id: crypto.randomUUID(), poste: "1er", start: "9341.0", end: "9395.30" }, // Example values with poste
  ]);
  // State for liaison counters - Updated initial state to include poste
  const [liaisonCounters, setLiaisonCounters] = useState<LiaisonCounter[]>([
    { id: crypto.randomUUID(), poste: "2ème", start: "100.5", end: "105.75" }, // Example values with poste
  ]);
  // Updated state for stock entries - Added poste
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([
      { id: crypto.randomUUID(), poste: '', park: '', type: '', quantity: '', startTime: '' } // Start with one empty entry including poste
  ]);
  // State for the single "Heure Debut Stock" time
  const [stockStartTime, setStockStartTime] = useState('');


  const [totalDowntime, setTotalDowntime] = useState(0);
  const [operatingTime, setOperatingTime] = useState(TOTAL_PERIOD_MINUTES); // Use 24h base
  // State for total counter durations
  const [totalVibratorMinutes, setTotalVibratorMinutes] = useState(0);
  const [totalLiaisonMinutes, setTotalLiaisonMinutes] = useState(0);
  // State to track if there are any counter errors
  const [hasVibratorErrors, setHasVibratorErrors] = useState(false);
  const [hasLiaisonErrors, setHasLiaisonErrors] = useState(false);
  // State to track stock entry errors (specifically for poste selection)
  const [hasStockErrors, setHasStockErrors] = useState(false);


  // Calculate total downtime and operating time whenever stops change
  useEffect(() => {
    const calculatedDowntime = stops.reduce((acc, stop) => acc + parseDurationToMinutes(stop.duration), 0);
    setTotalDowntime(calculatedDowntime);

    const calculatedOperatingTime = TOTAL_PERIOD_MINUTES - calculatedDowntime; // Use 24h base
    setOperatingTime(calculatedOperatingTime >= 0 ? calculatedOperatingTime : 0); // Ensure non-negative

  }, [stops]); // Removed TOTAL_PERIOD_MINUTES dependency as it's constant

  // Calculate total counter durations and check for errors whenever counters change
  useEffect(() => {
    // Calculate total duration based on valid entries
    const validVibratorCounters = vibratorCounters.filter(c => !c.error);
    const vibratorTotal = calculateTotalCounterMinutes(validVibratorCounters);
    setTotalVibratorMinutes(vibratorTotal);

    // Check if ANY counter has an error
    setHasVibratorErrors(vibratorCounters.some(c => !!c.error));

    // Basic check: Total counter duration should not exceed total possible operating time (24 hours)
    if (vibratorTotal > TOTAL_PERIOD_MINUTES) {
        console.warn("Total vibreur duration exceeds 24h period.");
        // Potentially set a general error flag or specific counter errors
        // setHasVibratorErrors(true); // Ensure general error is shown if not already set
    }

  }, [vibratorCounters]); // Removed TOTAL_PERIOD_MINUTES dependency

  useEffect(() => {
      // Calculate total duration based on valid entries
    const validLiaisonCounters = liaisonCounters.filter(c => !c.error);
    const liaisonTotal = calculateTotalCounterMinutes(validLiaisonCounters);
    setTotalLiaisonMinutes(liaisonTotal);

    // Check if ANY counter has an error
    setHasLiaisonErrors(liaisonCounters.some(c => !!c.error));

    // Basic check: Total counter duration should not exceed total possible operating time (24 hours)
    if (liaisonTotal > TOTAL_PERIOD_MINUTES) {
        console.warn("Total liaison duration exceeds 24h period.");
        // setHasLiaisonErrors(true); // Ensure general error is shown if not already set
    }
  }, [liaisonCounters]); // Removed TOTAL_PERIOD_MINUTES dependency

   // Check for stock entry errors (poste selection)
  useEffect(() => {
    setHasStockErrors(stockEntries.some(entry => !!entry.error));
  }, [stockEntries]);


  const addStop = () => {
    setStops([...stops, { id: crypto.randomUUID(), duration: "", nature: "" }]);
  };

  // Updated addVibratorCounter to include poste
  const addVibratorCounter = () => {
    setVibratorCounters([...vibratorCounters, { id: crypto.randomUUID(), poste: "", start: "", end: "" }]);
  };

  // Function to add liaison counter - Updated to include poste
  const addLiaisonCounter = () => {
    setLiaisonCounters([...liaisonCounters, { id: crypto.randomUUID(), poste: "", start: "", end: "" }]);
  };

   // Function to add stock entry - includes poste
   const addStockEntry = () => {
        setStockEntries([...stockEntries, { id: crypto.randomUUID(), poste: '', park: '', type: '', quantity: '', startTime: '' }]);
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

 // Function to validate a single counter entry - Updated for 24h
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

    // Check duration against total possible period time (24 hours)
    if (startVal !== null && endVal !== null) {
        const durationHours = endVal - startVal;
        if (durationHours * 60 > TOTAL_PERIOD_MINUTES) { // Compare against 24h in minutes
            return `Durée > ${formatMinutesToHoursMinutes(TOTAL_PERIOD_MINUTES)}.`; // Update error message
        }
    }


    return undefined; // No error
 };


 // Updated updateVibratorCounter with validation and poste handling
 const updateVibratorCounter = (id: string, field: keyof Omit<Counter, 'id' | 'error'>, value: string) => {
    setVibratorCounters(vibratorCounters.map(counter => {
        if (counter.id === id) {
            const updatedCounter = { ...counter, [field]: value };
            // Validate start/end after update
            const error = validateCounterEntry(
                field === 'start' ? value : updatedCounter.start,
                field === 'end' ? value : updatedCounter.end
            );
            // Add poste validation check - ensure poste is selected
            let finalError = error;
             // Check poste only if start or end has a value (or if poste itself is being cleared)
             if ((updatedCounter.start || updatedCounter.end) && !updatedCounter.poste && field !== 'poste') {
                 finalError = "Veuillez sélectionner un poste.";
             } else if (field === 'poste' && !value && (updatedCounter.start || updatedCounter.end)) {
                  finalError = "Veuillez sélectionner un poste.";
             }

            return { ...updatedCounter, error: finalError };
        }
        return counter;
    }));
 };

 // Function to update liaison counter with validation and poste handling - Similar to updateVibratorCounter
 const updateLiaisonCounter = (id: string, field: keyof Omit<LiaisonCounter, 'id' | 'error'>, value: string) => {
    setLiaisonCounters(liaisonCounters.map(counter => {
         if (counter.id === id) {
            const updatedCounter = { ...counter, [field]: value };
            // Validate after update
            const error = validateCounterEntry(
                field === 'start' ? value : updatedCounter.start,
                field === 'end' ? value : updatedCounter.end
            );
             // Add poste validation check - ensure poste is selected
             let finalError = error;
              // Check poste only if start or end has a value (or if poste itself is being cleared)
             if ((updatedCounter.start || updatedCounter.end) && !updatedCounter.poste && field !== 'poste') {
                 finalError = "Veuillez sélectionner un poste.";
             } else if (field === 'poste' && !value && (updatedCounter.start || updatedCounter.end)) {
                  finalError = "Veuillez sélectionner un poste.";
             }

             return { ...updatedCounter, error: finalError };
        }
        return counter;
    }));
 };


 // Function to update stock entry - simplified, includes poste
 const updateStockEntry = (id: string, field: keyof Omit<StockEntry, 'id' | 'error'>, value: string | boolean, parkOrType?: Park | StockType) => {
    setStockEntries(stockEntries.map(entry => {
      if (entry.id === id) {
         const updatedEntry = { ...entry, [field]: value };
         let error = undefined;

         // Reset dependent fields or validate poste
         if (field === 'poste') {
             updatedEntry.park = ''; // Reset park, type, quantity when poste changes
             updatedEntry.type = '';
             updatedEntry.quantity = '';
             // Validate if poste is empty but other fields are not (only if clearing poste)
             if (!value && (updatedEntry.park || updatedEntry.type || updatedEntry.quantity)) {
                  error = "Veuillez sélectionner un poste.";
             }
         } else if (field === 'park') {
             updatedEntry.type = ''; // Reset type/quantity when park changes
             updatedEntry.quantity = '';
             // Validate if poste is empty when park is selected
             if (value && !updatedEntry.poste) {
                  error = "Veuillez sélectionner un poste d'abord.";
             }
         } else if (field === 'type') {
            updatedEntry.quantity = ''; // Reset quantity when type changes
            // Validate if poste is empty when type is selected
             if (value && !updatedEntry.poste) {
                  error = "Veuillez sélectionner un poste d'abord.";
             }
         } else if (field === 'quantity') {
             // Validate if poste is empty when quantity is entered
             if (value && !updatedEntry.poste) {
                  error = "Veuillez sélectionner un poste d'abord.";
             }
         }

         // Assign the determined error
         updatedEntry.error = error;

         return updatedEntry;
      }
      return entry;
    }));
  };

  // Handle form submission - Prevent if counter or stock errors exist
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Re-validate all counters on submit just in case
    let vibratorValidationFailed = false;
    const finalVibratorCounters = vibratorCounters.map(c => {
        // Ensure poste is selected if start or end is filled
        let error = validateCounterEntry(c.start, c.end);
        if (!error && (c.start || c.end) && !c.poste) {
            error = "Veuillez sélectionner un poste.";
        }
        if (error) vibratorValidationFailed = true;
        return { ...c, error };
    });
    setVibratorCounters(finalVibratorCounters);

    let liaisonValidationFailed = false;
    const finalLiaisonCounters = liaisonCounters.map(c => {
         // Ensure poste is selected for liaison counters too if start or end is filled
         let error = validateCounterEntry(c.start, c.end);
         if (!error && (c.start || c.end) && !c.poste) {
             error = "Veuillez sélectionner un poste.";
         }
         if (error) liaisonValidationFailed = true;
        return { ...c, error };
    });
    setLiaisonCounters(finalLiaisonCounters);

    // Re-validate stock entries for poste selection
    let stockValidationFailed = false;
    const finalStockEntries = stockEntries.map(entry => {
         let error = undefined;
         // Check if poste is missing when other dependent fields are filled
         if (!entry.poste && (entry.park || entry.type || entry.quantity)) {
             error = "Veuillez sélectionner un poste.";
             stockValidationFailed = true;
         }
         return { ...entry, error };
    });
    setStockEntries(finalStockEntries);


    // Recalculate totals based on potentially updated error states
    const finalVibratorTotal = calculateTotalCounterMinutes(finalVibratorCounters.filter(c => !c.error));
    const finalLiaisonTotal = calculateTotalCounterMinutes(finalLiaisonCounters.filter(c => !c.error));

    // Final check against total period time (24h)
    if (finalVibratorTotal > TOTAL_PERIOD_MINUTES) {
        console.error("Validation failed: Total vibreur duration exceeds 24h period.");
        vibratorValidationFailed = true;
    }
     if (finalLiaisonTotal > TOTAL_PERIOD_MINUTES) {
        console.error("Validation failed: Total liaison duration exceeds 24h period.");
        liaisonValidationFailed = true;
    }


    if (vibratorValidationFailed || liaisonValidationFailed || stockValidationFailed) {
        console.error("Validation failed: Invalid inputs detected in counters or stock.");
        // Optionally, provide user feedback (e.g., using a toast)
        // toast({ title: "Erreur de Validation", description: "Veuillez corriger les erreurs dans les formulaires.", variant: "destructive" });
        return; // Stop submission
    }

    // If validation passes, proceed with submission logic
    console.log("Submitting Activity Report:", {
        // selectedPoste, // Removed selectedPoste
        stops,
        vibratorCounters: finalVibratorCounters, // Submit validated counters
        liaisonCounters: finalLiaisonCounters, // Submit validated counters
        stockEntries: finalStockEntries, // Submit validated stock entries
        stockStartTime,
        totalDowntime,
        operatingTime,
        totalVibratorMinutes: finalVibratorTotal, // Submit calculated totals
        totalLiaisonMinutes: finalLiaisonTotal, // Submit calculated totals
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

                {/* Removed Poste Selection Section */}
                {/* <div className="space-y-2"> ... </div> */}


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
                    {/* Updated Label */}
                    <h3 className="font-semibold text-lg text-foreground mb-2">Temps de Fonctionnement (24h - Arrêts)</h3>
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
                                Erreur(s) dans les compteurs vibreurs. Vérifiez les postes et les valeurs (Fin ≥ Début, Durée totale ≤ 24h). {/* Updated error message */}
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[150px]"> {/* Added width */}
                                    Poste
                                </TableHead>
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
                                     <TableCell className="p-2"> {/* Cell for Poste Select */}
                                        <Select
                                            value={counter.poste}
                                            onValueChange={(value: Poste) => updateVibratorCounter(counter.id, "poste", value)}
                                            >
                                            <SelectTrigger className={cn("h-8 text-sm", counter.error?.includes("poste") && "border-destructive focus-visible:ring-destructive")}>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {POSTE_ORDER.map(p => (
                                                    <SelectItem key={p} value={p}>
                                                        {p} Poste ({POSTE_TIMES[p]})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                         {counter.error?.includes("poste") && <p className="text-xs text-destructive pt-1">{counter.error}</p>}
                                    </TableCell>
                                    <TableCell className="p-2">
                                    <Input
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal" // Hint for mobile keyboards
                                        className={cn("w-full h-8 text-sm", counter.error && !counter.error.includes("poste") && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.start}
                                        placeholder="Index début"
                                        onChange={(e) =>
                                        updateVibratorCounter(counter.id, "start", e.target.value)
                                        }
                                        aria-invalid={!!counter.error}
                                        aria-describedby={counter.error ? `error-vibrator-${counter.id}` : undefined}
                                    />
                                     {counter.error && !counter.error.includes("poste") && <p id={`error-vibrator-${counter.id}`} className="text-xs text-destructive pt-1">{counter.error}</p>}
                                    </TableCell>
                                    <TableCell className="p-2">
                                    <Input
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-sm", counter.error && !counter.error.includes("poste") && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.end}
                                        placeholder="Index fin"
                                        onChange={(e) =>
                                        updateVibratorCounter(counter.id, "end", e.target.value)
                                        }
                                         aria-invalid={!!counter.error}
                                         aria-describedby={counter.error ? `error-vibrator-${counter.id}` : undefined}
                                    />
                                    {/* Display error inline only if error exists and is on the 'end' field logic */}
                                    {counter.error?.includes("Fin") || counter.error?.includes("Durée") ? <p id={`error-vibrator-${counter.id}`} className="text-xs text-destructive pt-1">{counter.error}</p> : null}
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
                                        <TableCell colSpan={4} className="text-center text-muted-foreground p-4"> {/* Updated colSpan */}
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
                                Erreur(s) dans les compteurs liaison. Vérifiez les postes et les valeurs (Fin ≥ Début, Durée totale ≤ 24h). {/* Updated error message */}
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                 <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[150px]"> {/* Added width */}
                                    Poste
                                </TableHead>
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
                                     <TableCell className="p-2"> {/* Cell for Poste Select */}
                                        <Select
                                            value={counter.poste}
                                            onValueChange={(value: Poste) => updateLiaisonCounter(counter.id, "poste", value)}
                                            >
                                            <SelectTrigger className={cn("h-8 text-sm", counter.error?.includes("poste") && "border-destructive focus-visible:ring-destructive")}>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {POSTE_ORDER.map(p => (
                                                    <SelectItem key={p} value={p}>
                                                        {p} Poste ({POSTE_TIMES[p]})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                         {counter.error?.includes("poste") && <p className="text-xs text-destructive pt-1">{counter.error}</p>}
                                    </TableCell>
                                    <TableCell className="p-2">
                                    <Input
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-sm", counter.error && !counter.error.includes("poste") && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.start}
                                        placeholder="Index début"
                                        onChange={(e) =>
                                        updateLiaisonCounter(counter.id, "start", e.target.value)
                                        }
                                        aria-invalid={!!counter.error}
                                        aria-describedby={counter.error ? `error-liaison-${counter.id}` : undefined}
                                    />
                                    {counter.error && !counter.error.includes("poste") && <p id={`error-liaison-${counter.id}`} className="text-xs text-destructive pt-1">{counter.error}</p>}
                                    </TableCell>
                                    <TableCell className="p-2">
                                    <Input
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-sm", counter.error && !counter.error.includes("poste") && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.end}
                                        placeholder="Index fin"
                                        onChange={(e) =>
                                        updateLiaisonCounter(counter.id, "end", e.target.value)
                                        }
                                        aria-invalid={!!counter.error}
                                        aria-describedby={counter.error ? `error-liaison-${counter.id}` : undefined}
                                    />
                                     {/* Display error inline only if error exists and relates to Fin or Durée */}
                                     {counter.error?.includes("Fin") || counter.error?.includes("Durée") ? <p id={`error-liaison-${counter.id}`} className="text-xs text-destructive pt-1">{counter.error}</p> : null }
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
                                        <TableCell colSpan={4} className="text-center text-muted-foreground p-4"> {/* Updated colSpan */}
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
                     {/* General Error Alert for Stock */}
                    {hasStockErrors && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Erreur(s) dans les entrées de stock. Veuillez sélectionner un poste pour chaque entrée active.
                            </AlertDescription>
                        </Alert>
                    )}


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
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[150px]">Poste</TableHead> {/* Added Poste Head */}
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[150px]">PARK</TableHead>
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[250px]">Type Produit</TableHead>
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">Quantité</TableHead>
                            <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockEntries.map((entry) => (
                            <TableRow key={entry.id} className="hover:bg-muted/50">
                                {/* Poste Selection Cell */}
                                <TableCell className="p-2 align-top">
                                    <Select
                                        value={entry.poste}
                                        onValueChange={(value: Poste) => updateStockEntry(entry.id, "poste", value)}
                                        >
                                        <SelectTrigger className={cn("h-8 text-sm w-[130px]", entry.error && "border-destructive focus-visible:ring-destructive")}>
                                            <SelectValue placeholder="Poste" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {POSTE_ORDER.map(p => (
                                                <SelectItem key={p} value={p}>
                                                    {p} Poste
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {entry.error && <p className="text-xs text-destructive pt-1">{entry.error}</p>}
                                </TableCell>
                                {/* Park Checkboxes */}
                                <TableCell className="p-2 align-top">
                                <div className="space-y-2">
                                    {PARKS.map(park => (
                                    <div key={park} className="flex items-center space-x-2">
                                        <Checkbox
                                        id={`${entry.id}-${park}`}
                                        checked={entry.park === park}
                                        disabled={!entry.poste} // Disable if no poste selected
                                        onCheckedChange={(checked) => updateStockEntry(entry.id, 'park', checked ? park : '', park)}
                                        />
                                        <Label htmlFor={`${entry.id}-${park}`} className={`font-normal text-sm ${!entry.poste ? 'text-muted-foreground' : ''}`}>{park}</Label>
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
                                        disabled={!entry.poste || !entry.park} // Disable if no poste or park selected
                                        onCheckedChange={(checked) => updateStockEntry(entry.id, 'type', checked ? type : '', type)}
                                        />
                                        <Label htmlFor={`${entry.id}-${type}`} className={`font-normal text-sm ${!entry.poste || !entry.park ? 'text-muted-foreground' : ''}`}>{type}</Label>
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
                                    disabled={!entry.poste || !entry.type} // Disable if no poste or type selected
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
                                    <TableCell colSpan={5} className="text-center text-muted-foreground p-4"> {/* Updated colSpan */}
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
                    <Button type="submit" disabled={hasVibratorErrors || hasLiaisonErrors || hasStockErrors}> {/* Disable submit if errors */}
                        Soumettre Rapport
                    </Button> {/* Disable submit if errors */}
                </div>
            </CardContent>
        </form>
    </Card>
  );
}

    