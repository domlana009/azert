
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
  previousDayThirdShiftEnd?: string | null; // Add prop for previous day's 3rd shift end counter
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

const MAX_HOURS_PER_POSTE = 8; // Max hours for a standard shift

export function ActivityReport({ currentDate, previousDayThirdShiftEnd = null }: ActivityReportProps) {


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

  // State for counter validation errors (including sequential checks) - for ActivityReport counters
   const [vibratorCounterErrors, setVibratorCounterErrors] = useState<Record<string, string>>({}); // Use record for ID-based errors
   const [liaisonCounterErrors, setLiaisonCounterErrors] = useState<Record<string, string>>({});


  // Calculate total downtime and operating time whenever stops change
  useEffect(() => {
    const calculatedDowntime = stops.reduce((acc, stop) => acc + parseDurationToMinutes(stop.duration), 0);
    setTotalDowntime(calculatedDowntime);

    const calculatedOperatingTime = TOTAL_PERIOD_MINUTES - calculatedDowntime; // Use 24h base
    setOperatingTime(calculatedOperatingTime >= 0 ? calculatedOperatingTime : 0); // Ensure non-negative

  }, [stops]); // Removed TOTAL_PERIOD_MINUTES dependency as it's constant


  // Function to validate a single counter entry - Includes max duration and sequential checks
  const validateCounterEntry = (
        counterId: string,
        counters: Array<Counter | LiaisonCounter>,
        type: 'vibrator' | 'liaison',
        currentStartStr: string,
        currentEndStr: string,
        currentPoste?: Poste | '',
        previousDayData?: string | null // Only needed for 1er poste vibrator check
    ): string | undefined => {
        const startVal = validateAndParseCounterValue(currentStartStr);
        const endVal = validateAndParseCounterValue(currentEndStr);
        const errorSetter = type === 'vibrator' ? setVibratorCounterErrors : setLiaisonCounterErrors;

        // Basic Validation
        if (startVal === null && currentStartStr !== '' && currentStartStr !== '.' && currentStartStr !== ',') return "Début invalide.";
        if (endVal === null && currentEndStr !== '' && currentEndStr !== '.' && currentEndStr !== ',') return "Fin invalide.";
        if (startVal !== null && endVal !== null && endVal < startVal) return "Fin < Début.";

        // Max Duration Check (Per Poste Limit - 8 hours)
        if (startVal !== null && endVal !== null) {
            const durationHours = endVal - startVal;
             if (durationHours > MAX_HOURS_PER_POSTE) {
                 return `Durée max (${MAX_HOURS_PER_POSTE}h) dépassée (${durationHours.toFixed(2)}h).`;
             }
        }

        // Sequential Validation (based on Poste)
        const currentIndex = counters.findIndex(c => c.id === counterId);
        if (currentIndex === -1 || !currentPoste) return undefined; // Cannot validate sequence without index or poste

        const posteIndex = POSTE_ORDER.indexOf(currentPoste); // 0 for 1er, 1 for 2eme, 2 for 3eme

        // Find the counter for the previous logical poste (handling wrap-around for 1er)
        let previousCounter: Counter | LiaisonCounter | undefined = undefined;
        let expectedPreviousFinStr: string | undefined | null = undefined; // Can be null if prev day data is null

        if (posteIndex === 0) { // Current is 1er Poste
            // Need previous day's 3rd shift end (passed as prop for vibrators)
            if (type === 'vibrator') {
                expectedPreviousFinStr = previousDayData; // Use prop
                 // If previousDayData is null, it means no previous data, skip check
                 // If undefined, prop wasn't passed, maybe warn or skip
                 if (expectedPreviousFinStr === undefined) {
                    // console.warn("Previous day 3rd shift data missing for 1er poste validation.");
                    expectedPreviousFinStr = null; // Treat as skip
                 }
            } else {
                 // Need to find the 3rd poste *of the same day* if it exists in the liaison list
                 previousCounter = counters.find((c, idx) => idx !== currentIndex && c.poste === '3ème');
                 expectedPreviousFinStr = previousCounter?.end;
            }

        } else if (posteIndex > 0) { // Current is 2eme or 3eme Poste
             const previousPoste = POSTE_ORDER[posteIndex - 1];
             // Find a counter with the previous poste in the *same list* (vibrator or liaison)
             previousCounter = counters.find((c, idx) => idx !== currentIndex && c.poste === previousPoste);
             expectedPreviousFinStr = previousCounter?.end;
        }


        // Perform the check if an expected previous 'fin' value exists
        if (expectedPreviousFinStr !== undefined && expectedPreviousFinStr !== null && currentStartStr !== '') {
            const expectedPreviousFin = parseFloat(expectedPreviousFinStr);
            if (isNaN(expectedPreviousFin)) {
                 // This case might happen if the previous counter's 'fin' is invalid itself
                 // We might want to propagate an error or handle it gracefully
                 // For now, let's skip the sequential check if the reference is invalid
                 // console.warn(`Previous counter's 'fin' value (${expectedPreviousFinStr}) is invalid.`);
            } else if (startVal !== null && startVal !== expectedPreviousFin) {
                 const prevPosteName = posteIndex === 0 ? "3ème (veille)" : POSTE_ORDER[posteIndex - 1];
                 return `Début (${startVal}) doit correspondre à Fin (${expectedPreviousFin}) du ${prevPosteName} Poste.`;
             }
        } else if (expectedPreviousFinStr === null) {
             // Previous data explicitly not available (e.g., first day or no 3rd shift prev day)
             // No sequential validation possible/needed for this boundary.
         }
         // else: No previous counter found, or previous 'fin' is empty, or current 'start' is empty - skip sequence check.


        return undefined; // No error
   };


    // Calculate total counter durations and check for errors whenever counters change
    useEffect(() => {
        // --- Vibrator Counters ---
        let vibratorValidationPassed = true;
        const newVibratorErrors: Record<string, string> = {};
        const validVibratorCounters = vibratorCounters.filter(c => {
            const error = validateCounterEntry(c.id, vibratorCounters, 'vibrator', c.start, c.end, c.poste, previousDayThirdShiftEnd);
             if ((c.start || c.end) && !c.poste) { // Also check if poste is missing when values exist
                 newVibratorErrors[c.id] = "Veuillez sélectionner un poste.";
                 vibratorValidationPassed = false;
                 return false;
             }
            if (error) {
                newVibratorErrors[c.id] = error;
                vibratorValidationPassed = false;
                return false;
            }
            return true; // Valid entry for total calculation
        });

        setVibratorCounterErrors(newVibratorErrors); // Update error state
        setHasVibratorErrors(!vibratorValidationPassed); // Set general error flag

        const vibratorTotal = calculateTotalCounterMinutes(validVibratorCounters);
        setTotalVibratorMinutes(vibratorTotal);

        // Check if total duration exceeds 24h (might need adjustment based on how postes overlap)
        // This simple check might be too basic if postes can run concurrently.
        if (vibratorTotal > TOTAL_PERIOD_MINUTES) {
            console.warn("Total vibreur duration exceeds 24h period.");
            // Consider setting a general error or flagging relevant counters
             setHasVibratorErrors(true);
        }


        // --- Liaison Counters ---
        let liaisonValidationPassed = true;
        const newLiaisonErrors: Record<string, string> = {};
        const validLiaisonCounters = liaisonCounters.filter(c => {
            // Liaison validation doesn't need previous day data prop
             const error = validateCounterEntry(c.id, liaisonCounters, 'liaison', c.start, c.end, c.poste);
              if ((c.start || c.end) && !c.poste) { // Also check if poste is missing
                 newLiaisonErrors[c.id] = "Veuillez sélectionner un poste.";
                 liaisonValidationPassed = false;
                 return false;
             }
             if (error) {
                newLiaisonErrors[c.id] = error;
                liaisonValidationPassed = false;
                return false;
            }
            return true;
        });

        setLiaisonCounterErrors(newLiaisonErrors);
        setHasLiaisonErrors(!liaisonValidationPassed);

        const liaisonTotal = calculateTotalCounterMinutes(validLiaisonCounters);
        setTotalLiaisonMinutes(liaisonTotal);

        if (liaisonTotal > TOTAL_PERIOD_MINUTES) {
            console.warn("Total liaison duration exceeds 24h period.");
             setHasLiaisonErrors(true);
        }

         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vibratorCounters, liaisonCounters, previousDayThirdShiftEnd]); // Dependencies


   // Check for stock entry errors (poste selection)
  useEffect(() => {
    // An entry is considered 'active' if park, type, or quantity has a value.
    const activeEntryNeedsPoste = stockEntries.some(entry =>
        (entry.park || entry.type || entry.quantity) && !entry.poste
    );
    setHasStockErrors(activeEntryNeedsPoste);

    // Update individual entry errors (optional, if needed for inline display)
    setStockEntries(prevEntries => prevEntries.map(entry => ({
        ...entry,
        error: (entry.park || entry.type || entry.quantity) && !entry.poste ? "Veuillez sélectionner un poste." : undefined
    })));

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
     // Clean up errors for the deleted counter
     setVibratorCounterErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
  };

   // Function to delete liaison counter
  const deleteLiaisonCounter = (id: string) => {
    setLiaisonCounters(liaisonCounters.filter(counter => counter.id !== id));
     // Clean up errors for the deleted counter
      setLiaisonCounterErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
  };

  // Function to delete stock entry
  const deleteStockEntry = (id: string) => {
    setStockEntries(stockEntries.filter(entry => entry.id !== id));
  };

 // Update field type to exclude hm and ha
 const updateStop = (id: string, field: keyof Omit<Stop, 'id'>, value: string) => {
    setStops(stops.map(stop => stop.id === id ? { ...stop, [field]: value } : stop));
 };


 // Updated updateVibratorCounter with validation and poste handling
 const updateVibratorCounter = (id: string, field: keyof Omit<Counter, 'id' | 'error'>, value: string) => {
    setVibratorCounters(prevCounters => prevCounters.map(counter => {
        if (counter.id === id) {
            const updatedCounter = { ...counter, [field]: value };

            // Clear specific error for this counter immediately when input changes
            setVibratorCounterErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[id]; // Remove error for this counter
                return newErrors;
            });

            // The useEffect hook will handle re-validation and updating the error state
            return updatedCounter;
        }
        return counter;
    }));
 };

 // Function to update liaison counter with validation and poste handling - Similar to updateVibratorCounter
 const updateLiaisonCounter = (id: string, field: keyof Omit<LiaisonCounter, 'id' | 'error'>, value: string) => {
     setLiaisonCounters(prevCounters => prevCounters.map(counter => {
         if (counter.id === id) {
             const updatedCounter = { ...counter, [field]: value };

             // Clear specific error for this counter immediately
             setLiaisonCounterErrors(prevErrors => {
                 const newErrors = { ...prevErrors };
                 delete newErrors[id]; // Remove error for this counter
                 return newErrors;
             });

             // Re-validation happens in useEffect
             return updatedCounter;
         }
         return counter;
    }));
 };


 // Function to update stock entry - simplified, includes poste
 const updateStockEntry = (id: string, field: keyof Omit<StockEntry, 'id' | 'error'>, value: string | boolean, parkOrType?: Park | StockType) => {
    setStockEntries(stockEntries.map(entry => {
      if (entry.id === id) {
         const updatedEntry = { ...entry, [field]: value };
         // No immediate error setting here, let useEffect handle validation based on state
         updatedEntry.error = undefined; // Clear any previous inline error

         // Reset dependent fields or validate poste
         if (field === 'poste') {
             updatedEntry.park = ''; // Reset park, type, quantity when poste changes
             updatedEntry.type = '';
             updatedEntry.quantity = '';
         } else if (field === 'park') {
             updatedEntry.type = ''; // Reset type/quantity when park changes
             updatedEntry.quantity = '';
         } else if (field === 'type') {
            updatedEntry.quantity = ''; // Reset quantity when type changes
         }

         return updatedEntry;
      }
      return entry;
    }));
  };

  // Handle form submission - Prevent if counter or stock errors exist
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Explicitly check the general error flags which are updated by useEffect
     if (hasVibratorErrors || hasLiaisonErrors || hasStockErrors) {
        console.error("Validation failed: Invalid inputs detected in counters or stock.");
        // Optionally, provide user feedback (e.g., using a toast)
        // toast({ title: "Erreur de Validation", description: "Veuillez corriger les erreurs dans les formulaires.", variant: "destructive" });

        // Focus the first input with an error (example)
        const firstVibratorErrorId = Object.keys(vibratorCounterErrors).find(id => vibratorCounterErrors[id]);
        if (firstVibratorErrorId) {
            document.getElementById(`vibrator-start-${firstVibratorErrorId}`)?.focus();
            return;
        }
        const firstLiaisonErrorId = Object.keys(liaisonCounterErrors).find(id => liaisonCounterErrors[id]);
         if (firstLiaisonErrorId) {
             document.getElementById(`liaison-start-${firstLiaisonErrorId}`)?.focus();
            return;
         }
         // Add similar logic for stock errors if needed

        return; // Stop submission
    }

    // If validation passes, proceed with submission logic
    console.log("Submitting Activity Report:", {
        // selectedPoste, // Removed selectedPoste
        stops,
        vibratorCounters, // Submit validated counters
        liaisonCounters, // Submit validated counters
        stockEntries, // Submit validated stock entries
        stockStartTime,
        totalDowntime,
        operatingTime,
        totalVibratorMinutes, // Submit calculated totals
        totalLiaisonMinutes, // Submit calculated totals
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
                                Erreur(s) dans les compteurs vibreurs. Vérifiez les postes, la continuité et les valeurs (Fin ≥ Début, Durée max {MAX_HOURS_PER_POSTE}h/poste). {/* Updated error message */}
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
                                            <SelectTrigger className={cn("h-8 text-sm", vibratorCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}>
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
                                         {vibratorCounterErrors[counter.id]?.includes("poste") && <p className="text-xs text-destructive pt-1">{vibratorCounterErrors[counter.id]}</p>}
                                    </TableCell>
                                    <TableCell className="p-2">
                                    <Input
                                        id={`vibrator-start-${counter.id}`} // Add ID for focusing
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal" // Hint for mobile keyboards
                                        className={cn("w-full h-8 text-sm", vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.start}
                                        placeholder="Index début"
                                        onChange={(e) =>
                                        updateVibratorCounter(counter.id, "start", e.target.value)
                                        }
                                        aria-invalid={!!vibratorCounterErrors[counter.id]}
                                        aria-describedby={vibratorCounterErrors[counter.id] ? `error-vibrator-${counter.id}` : undefined}
                                    />
                                     {vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste") && <p id={`error-vibrator-${counter.id}`} className="text-xs text-destructive pt-1">{vibratorCounterErrors[counter.id]}</p>}
                                    </TableCell>
                                    <TableCell className="p-2">
                                    <Input
                                        id={`vibrator-end-${counter.id}`} // Add ID for focusing
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-sm", vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.end}
                                        placeholder="Index fin"
                                        onChange={(e) =>
                                        updateVibratorCounter(counter.id, "end", e.target.value)
                                        }
                                         aria-invalid={!!vibratorCounterErrors[counter.id]}
                                         aria-describedby={vibratorCounterErrors[counter.id] ? `error-vibrator-${counter.id}` : undefined}
                                    />
                                    {/* Display error inline only if error exists and is NOT related to poste selection */}
                                    {vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste") ? <p id={`error-vibrator-${counter.id}-end`} className="text-xs text-destructive pt-1">{vibratorCounterErrors[counter.id]}</p> : null}
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
                                Erreur(s) dans les compteurs liaison. Vérifiez les postes, la continuité et les valeurs (Fin ≥ Début, Durée max {MAX_HOURS_PER_POSTE}h/poste). {/* Updated error message */}
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
                                            <SelectTrigger className={cn("h-8 text-sm", liaisonCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}>
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
                                         {liaisonCounterErrors[counter.id]?.includes("poste") && <p className="text-xs text-destructive pt-1">{liaisonCounterErrors[counter.id]}</p>}
                                    </TableCell>
                                    <TableCell className="p-2">
                                    <Input
                                        id={`liaison-start-${counter.id}`} // Add ID
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-sm", liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.start}
                                        placeholder="Index début"
                                        onChange={(e) =>
                                        updateLiaisonCounter(counter.id, "start", e.target.value)
                                        }
                                        aria-invalid={!!liaisonCounterErrors[counter.id]}
                                        aria-describedby={liaisonCounterErrors[counter.id] ? `error-liaison-${counter.id}` : undefined}
                                    />
                                    {liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste") && <p id={`error-liaison-${counter.id}`} className="text-xs text-destructive pt-1">{liaisonCounterErrors[counter.id]}</p>}
                                    </TableCell>
                                    <TableCell className="p-2">
                                    <Input
                                        id={`liaison-end-${counter.id}`} // Add ID
                                        type="text" // Use text to allow different formats initially
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-sm", liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.end}
                                        placeholder="Index fin"
                                        onChange={(e) =>
                                        updateLiaisonCounter(counter.id, "end", e.target.value)
                                        }
                                        aria-invalid={!!liaisonCounterErrors[counter.id]}
                                        aria-describedby={liaisonCounterErrors[counter.id] ? `error-liaison-${counter.id}` : undefined}
                                    />
                                     {/* Display error inline only if error exists and is NOT related to poste selection */}
                                     {liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste") ? <p id={`error-liaison-${counter.id}-end`} className="text-xs text-destructive pt-1">{liaisonCounterErrors[counter.id]}</p> : null }
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
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[150px]">Poste</TableHead>{/* Added Poste Head */}
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
