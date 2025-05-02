
"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Ensure Card is imported
import { Button } from "@/components/ui/button";
import { Trash, Plus, AlertCircle } from "lucide-react"; // Added Plus icon and AlertCircle
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast"; // Import useToast

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
  selectedDate: Date; // Changed prop name and kept type as Date
  previousDayThirdShiftEnd?: string | null; // Add prop for previous day's 3rd shift end counter
}

// Keep Poste constants for potential context or future use, even if UI element is removed
type Poste = "1er" | "2ème" | "3ème";
type Park = 'PARK 1' | 'PARK 2' | 'PARK 3';
type StockType = 'NORMAL' | 'OCEANE' | 'PB30';
type StockTime = 'HEURE DEBUT STOCK';

// Updated Poste times and order - Order must match validation logic: 3, 1, 2
const POSTE_TIMES: Record<Poste, string> = {
  "3ème": "22:30 - 06:30", // Previous day to current day
  "1er": "06:30 - 14:30",  // Current day
  "2ème": "14:30 - 22:30", // Current day
};
const POSTE_ORDER: Poste[] = ["3ème", "1er", "2ème"]; // Consistent order for UI and logic
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
    poste: Poste | ''; // Changed to mandatory with empty string default
    start: string;
    end: string;
    error?: string; // Optional error message for this entry
}

// Interface for Liaison Counters (same structure as Counter) - Added poste
interface LiaisonCounter {
    id: string;
    poste: Poste | ''; // Changed to mandatory with empty string default
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
  // Error is now calculated dynamically during render
}

const MAX_HOURS_PER_POSTE = 8; // Max hours for a standard shift

export function ActivityReport({ selectedDate, previousDayThirdShiftEnd = null }: ActivityReportProps) { // Updated prop name
  const { toast } = useToast();

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
  // State for the single "Heure Debut Stock" time - This seems redundant if startTime is in StockEntry
  // const [stockStartTime, setStockStartTime] = useState('');


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


    // Format date string once using the selectedDate prop
    const formattedDate = selectedDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });


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
        currentPoste: Poste | '', // Mandatory Poste
        previousDayData?: string | null // Only needed for 1er poste check
    ): string | undefined => {
        const startVal = validateAndParseCounterValue(currentStartStr);
        const endVal = validateAndParseCounterValue(currentEndStr);

         // 0. Poste Validation (Must be selected if start or end has value)
         if ((currentStartStr || currentEndStr) && !currentPoste) {
             return "Veuillez sélectionner un poste.";
         }
          // Skip further validation if poste is not selected yet, even if inputs are empty
         if (!currentPoste && !currentStartStr && !currentEndStr) {
             return undefined;
         }


        // Basic Validation
        if (startVal === null && currentStartStr !== '' && currentStartStr !== '.' && currentStartStr !== ',') return "Début invalide.";
        if (endVal === null && currentEndStr !== '' && currentEndStr !== '.' && currentEndStr !== ',') return "Fin invalide.";
        if (startVal === null || endVal === null) return undefined; // Skip further checks if incomplete but parsable so far

        if (endVal < startVal) return "Fin < Début.";

        // Max Duration Check (Per Poste Limit - 8 hours)
        const durationHours = endVal - startVal;
         if (durationHours > MAX_HOURS_PER_POSTE) {
             return `Durée max (${MAX_HOURS_PER_POSTE}h) dépassée (${durationHours.toFixed(2)}h).`;
         }

        // Sequential Validation (based on Poste order: 3ème -> 1er -> 2ème)
        // Find the counter for the previous logical poste
        let expectedPreviousFinStr: string | undefined | null = undefined;
        let previousPosteName: string = '';

         if (currentPoste === '1er') { // Current is 1er, check against previous day's 3ème
             expectedPreviousFinStr = previousDayData;
             previousPosteName = "3ème (veille)";
             if (expectedPreviousFinStr === undefined) expectedPreviousFinStr = null; // Treat undefined prop as skip
         } else if (currentPoste === '2ème') { // Current is 2ème, check against current day's 1er
             const previousCounter = counters.find(c => c.poste === '1er' && c.id !== counterId);
             expectedPreviousFinStr = previousCounter?.end;
             previousPosteName = "1er";
         } else if (currentPoste === '3ème') { // Current is 3ème, check against current day's 2ème
             const previousCounter = counters.find(c => c.poste === '2ème' && c.id !== counterId);
             expectedPreviousFinStr = previousCounter?.end;
             previousPosteName = "2ème";
         }


        // Perform the check if an expected previous 'fin' value exists and is valid
        if (expectedPreviousFinStr !== undefined && expectedPreviousFinStr !== null && currentStartStr !== '') {
             // Check if expectedPreviousFinStr is a valid number representation
             const expectedPreviousFinParsed = validateAndParseCounterValue(expectedPreviousFinStr);

            if (expectedPreviousFinParsed === null) {
                 // console.warn(`Previous counter's 'fin' value (${expectedPreviousFinStr}) is invalid or empty.`);
                 // Decide if this should be an error or just skip the check
                 // Option 1: Skip check (allows potentially incorrect start)
                 // Option 2: Consider it an error (stricter, requires previous value to be valid)
                 // Let's skip for now, assuming the user will fix the previous entry
            } else if (startVal !== expectedPreviousFinParsed) {
                 return `Début (${startVal}) doit correspondre à Fin (${expectedPreviousFinParsed}) du ${previousPosteName} Poste.`;
             }
        } else if (expectedPreviousFinStr === null && currentPoste === '1er') {
             // Previous day data explicitly not available - OK for 1er poste start
         } else if (expectedPreviousFinStr === undefined && currentPoste !== '1er') {
             // Previous counter in the sequence not found or its 'fin' is empty.
             // This might be okay if it's the first entry for that sequence (e.g., first 3ème or first 2ème).
             // We allow it, assuming user might fill out of order.
         }
         // else: current 'start' is empty - skip sequence check.


        return undefined; // No error
   };


    // Calculate total counter durations and check for errors whenever counters change
    useEffect(() => {
        // --- Vibrator Counters ---
        let vibratorValidationPassed = true;
        const newVibratorErrors: Record<string, string> = {};
        const validVibratorCounters = vibratorCounters.filter(c => {
            const error = validateCounterEntry(c.id, vibratorCounters, 'vibrator', c.start, c.end, c.poste, previousDayThirdShiftEnd);
            if (error) {
                newVibratorErrors[c.id] = error;
                vibratorValidationPassed = false;
                return false; // Exclude from total calculation if error
            }
            return true; // Valid entry for total calculation
        });

        setVibratorCounterErrors(newVibratorErrors); // Update error state
        setHasVibratorErrors(!vibratorValidationPassed); // Set general error flag

        const vibratorTotal = calculateTotalCounterMinutes(validVibratorCounters);
        setTotalVibratorMinutes(vibratorTotal);

        if (vibratorTotal > TOTAL_PERIOD_MINUTES) {
             setHasVibratorErrors(true); // Also set error if total exceeds 24h
             console.warn("Total vibreur duration exceeds 24h period.");
             // Add a general error message if needed
             // newVibratorErrors['general'] = 'La durée totale des vibreurs dépasse 24h.';
             // setVibratorCounterErrors(prev => ({ ...prev, ...newVibratorErrors }));
        }


        // --- Liaison Counters ---
        let liaisonValidationPassed = true;
        const newLiaisonErrors: Record<string, string> = {};
        const validLiaisonCounters = liaisonCounters.filter(c => {
             // Liaison validation doesn't need previous day data prop for its 1er poste check (uses same-day 3eme)
             const error = validateCounterEntry(c.id, liaisonCounters, 'liaison', c.start, c.end, c.poste, undefined); // Pass undefined for prev day data
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
             setHasLiaisonErrors(true); // Set error if total exceeds 24h
             console.warn("Total liaison duration exceeds 24h period.");
              // Add a general error message if needed
             // newLiaisonErrors['general'] = 'La durée totale des liaisons dépasse 24h.';
             // setLiaisonCounterErrors(prev => ({ ...prev, ...newLiaisonErrors }));
        }

         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vibratorCounters, liaisonCounters, previousDayThirdShiftEnd]); // Dependencies


   // Check for stock entry errors (poste selection)
   // Calculate hasStockErrors directly based on stockEntries state
    useEffect(() => {
      const activeEntryNeedsPoste = stockEntries.some(entry =>
          (entry.park || entry.type || entry.quantity || entry.startTime) && !entry.poste // Consider startTime as well
      );
      setHasStockErrors(activeEntryNeedsPoste);
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
 const updateStockEntry = (id: string, field: keyof Omit<StockEntry, 'id'>, value: string | boolean, parkOrType?: Park | StockType) => {
    setStockEntries(stockEntries.map(entry => {
      if (entry.id === id) {
         const updatedEntry = { ...entry, [field]: value };

         // Reset dependent fields or validate poste
         if (field === 'poste') {
             updatedEntry.park = ''; // Reset park, type, quantity when poste changes
             updatedEntry.type = '';
             updatedEntry.quantity = '';
             updatedEntry.startTime = ''; // Also reset startTime if applicable?
         } else if (field === 'park') {
             updatedEntry.type = ''; // Reset type/quantity when park changes
             updatedEntry.quantity = '';
              updatedEntry.startTime = ''; // Reset start time if park changes
              // If park is unchecked, clear park field
              if (value === false) updatedEntry.park = '';
         } else if (field === 'type') {
            updatedEntry.quantity = ''; // Reset quantity when type changes
             updatedEntry.startTime = ''; // Reset start time if type changes
              // If type is unchecked, clear type field
              if (value === false) updatedEntry.type = '';
         } else if (field === 'startTime') {
              // Maybe reset other fields if start time is the primary identifier?
              updatedEntry.park = '';
              updatedEntry.type = '';
              updatedEntry.quantity = '';
               // If startTime checkbox is unchecked (value becomes false or empty string), clear startTime
              if (!value) updatedEntry.startTime = '';
               // If startTime checkbox is checked, ensure it has a default or previous value
              else if (typeof value === 'boolean' && value === true) {
                   // This case is tricky, maybe set to '00:00' or retain previous? Let's retain for now if exists.
                  updatedEntry.startTime = entry.startTime || '00:00';
              } else if (typeof value === 'string') {
                   updatedEntry.startTime = value; // Update with the time input value
              }
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
        toast({ title: "Erreur de Validation", description: "Veuillez corriger les erreurs dans les formulaires.", variant: "destructive" });

        // Focus the first input with an error
        const firstErrorIdVibrator = Object.keys(vibratorCounterErrors).find(id => vibratorCounterErrors[id]);
        if (firstErrorIdVibrator) {
            const el = document.getElementById(`vibrator-poste-trigger-${firstErrorIdVibrator}`) ||
                       document.getElementById(`vibrator-start-${firstErrorIdVibrator}`) ||
                       document.getElementById(`vibrator-end-${firstErrorIdVibrator}`);
            el?.focus();
            return;
        }
        const firstErrorIdLiaison = Object.keys(liaisonCounterErrors).find(id => liaisonCounterErrors[id]);
         if (firstErrorIdLiaison) {
             const el = document.getElementById(`liaison-poste-trigger-${firstErrorIdLiaison}`) ||
                        document.getElementById(`liaison-start-${firstErrorIdLiaison}`) ||
                        document.getElementById(`liaison-end-${firstErrorIdLiaison}`);
             el?.focus();
            return;
         }
         const firstStockErrorEntry = stockEntries.find(entry => (entry.park || entry.type || entry.quantity || entry.startTime) && !entry.poste);
         if (firstStockErrorEntry) {
             document.getElementById(`stock-poste-trigger-${firstStockErrorEntry.id}`)?.focus();
             return;
         }
        return; // Stop submission
    }

    // If validation passes, proceed with submission logic
    console.log("Submitting Activity Report:", {
        stops,
        vibratorCounters, // Submit validated counters
        liaisonCounters, // Submit validated counters
        stockEntries, // Submit validated stock entries
        totalDowntime,
        operatingTime,
        totalVibratorMinutes, // Submit calculated totals
        totalLiaisonMinutes, // Submit calculated totals
    });
    toast({ title: "Succès", description: "Rapport soumis avec succès." });
    // TODO: Replace console.log with actual API call or state management update
    // e.g., await submitActivityReport({ ... });
  };


  return (
    <Card className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-xl font-bold">
          RAPPORT D'ACTIVITÉ TNR
        </CardTitle>
        {/* Display the formatted date from the prop */}
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </CardHeader>

      {/* Wrap content in a form */}
       <form onSubmit={handleSubmit}>
            <CardContent className="p-0 space-y-6"> {/* Added space-y-6 */}

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
                                Erreur(s) dans les compteurs vibreurs. Vérifiez les postes, la continuité et les valeurs (Fin ≥ Début, Durée max {MAX_HOURS_PER_POSTE}h/poste, Total ≤ 24h). {/* Updated error message */}
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
                                            <SelectTrigger id={`vibrator-poste-trigger-${counter.id}`} className={cn("h-8 text-sm", vibratorCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}>
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
                                        aria-invalid={!!vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste")}
                                        aria-describedby={vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste") ? `error-vibrator-${counter.id}` : undefined}
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
                                         aria-invalid={!!vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste")}
                                         aria-describedby={vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste") ? `error-vibrator-${counter.id}-end` : undefined}
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
                                Erreur(s) dans les compteurs liaison. Vérifiez les postes, la continuité et les valeurs (Fin ≥ Début, Durée max {MAX_HOURS_PER_POSTE}h/poste, Total ≤ 24h). {/* Updated error message */}
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
                                            <SelectTrigger id={`liaison-poste-trigger-${counter.id}`} className={cn("h-8 text-sm", liaisonCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}>
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
                                        aria-invalid={!!liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste")}
                                        aria-describedby={liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste") ? `error-liaison-${counter.id}` : undefined}
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
                                        aria-invalid={!!liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste")}
                                        aria-describedby={liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste") ? `error-liaison-${counter.id}-end` : undefined}
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

                    <div className="overflow-x-auto">
                        <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[150px]">Poste</TableHead>{/* Added Poste Head */}
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[150px]">PARK</TableHead>
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[250px]">Type Produit / Info</TableHead>{/* Merged Type/Time */}
                            <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">Quantité / Heure</TableHead>{/* Merged Quantity/Time */}
                            <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockEntries.map((entry) => {
                                // Calculate error dynamically for each entry
                                const entryError = (entry.park || entry.type || entry.quantity || entry.startTime) && !entry.poste ? "Veuillez sélectionner un poste." : undefined;
                                return (
                                    <TableRow key={entry.id} className="hover:bg-muted/50">
                                        {/* Poste Selection Cell */}
                                        <TableCell className="p-2 align-top">
                                            <Select
                                                value={entry.poste}
                                                onValueChange={(value: Poste) => updateStockEntry(entry.id, "poste", value)}
                                            >
                                                <SelectTrigger id={`stock-poste-trigger-${entry.id}`} className={cn("h-8 text-sm w-[130px]", entryError && "border-destructive focus-visible:ring-destructive")}>
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
                                            {entryError && <p className="text-xs text-destructive pt-1">{entryError}</p>}
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
                                                onCheckedChange={(checked) => updateStockEntry(entry.id, 'park', checked ? park : false, park)} // Pass false to clear
                                                />
                                                <Label htmlFor={`${entry.id}-${park}`} className={`font-normal text-sm ${!entry.poste ? 'text-muted-foreground' : ''}`}>{park}</Label>
                                            </div>
                                            ))}
                                        </div>
                                        </TableCell>
                                        {/* Type / Start Time Checkboxes */}
                                        <TableCell className="p-2 align-top">
                                            <div className="space-y-2">
                                                {/* Product Types */}
                                                {STOCK_TYPES.map(type => (
                                                <div key={type} className="flex items-center space-x-2">
                                                    <Checkbox
                                                    id={`${entry.id}-${type}`}
                                                    checked={entry.type === type}
                                                    disabled={!entry.poste || !entry.park || !!entry.startTime} // Disable if no poste/park or if startTime is checked
                                                    onCheckedChange={(checked) => updateStockEntry(entry.id, 'type', checked ? type : false, type)} // Pass false to clear
                                                    />
                                                    <Label htmlFor={`${entry.id}-${type}`} className={`font-normal text-sm ${!entry.poste || !entry.park || !!entry.startTime ? 'text-muted-foreground' : ''}`}>{type}</Label>
                                                </div>
                                                ))}
                                                {/* HEURE DEBUT STOCK */}
                                                 <div key={STOCK_TIME_LABEL} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${entry.id}-startTime`}
                                                        // Check if startTime has a value to determine checked state
                                                        checked={!!entry.startTime}
                                                        disabled={!entry.poste || !!entry.park || !!entry.type} // Disable if no poste or if park/type is selected
                                                        onCheckedChange={(checked) => updateStockEntry(entry.id, 'startTime', checked ? (entry.startTime || '00:00') : false, undefined)} // Pass false to clear
                                                    />
                                                    <Label htmlFor={`${entry.id}-startTime`} className={`font-normal text-sm ${!entry.poste || !!entry.park || !!entry.type ? 'text-muted-foreground' : ''}`}>{STOCK_TIME_LABEL}</Label>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {/* Quantity / Time Input */}
                                        <TableCell className="p-2 align-top">
                                            {/* Show Quantity input only if a type is selected */}
                                            {entry.type && (
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
                                            )}
                                            {/* Show Time input only if startTime checkbox is checked */}
                                            {!!entry.startTime && (
                                                 <Input
                                                    type="time"
                                                    className="w-full h-8 text-sm mt-1" // Align with checkboxes
                                                    value={entry.startTime}
                                                    disabled={!entry.poste || !!entry.park || !!entry.type} // Disable if no poste or park/type selected
                                                    onChange={(e) => updateStockEntry(entry.id, "startTime", e.target.value)}
                                                />
                                            )}
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
                                );
                            })}
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
