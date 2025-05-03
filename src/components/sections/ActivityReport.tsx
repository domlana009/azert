"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Plus, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

// Helper function to format minutes into HHh MMm string
function formatMinutesToHoursMinutes(totalMinutes: number): string {
  if (isNaN(totalMinutes) || totalMinutes <= 0) return "0h 0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours}h ${minutes}m`;
}

// Helper function to validate and parse counter values
function validateAndParseCounterValue(value: string): number | null {
    if (!value) return 0;
    const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    if (cleaned === '' || cleaned === '.' || cleaned === ',') return null;
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
}

// Define total minutes for a 24-hour period
const TOTAL_PERIOD_MINUTES = 24 * 60;

// Helper function to calculate total duration in minutes from counters
function calculateTotalCounterMinutes(counters: Array<{ start: string; end: string; error?: string }>): number {
  const totalHours = counters.reduce((acc, counter) => {
    if (counter.error) return acc;
    const startHours = validateAndParseCounterValue(counter.start);
    const endHours = validateAndParseCounterValue(counter.end);
    if (startHours !== null && endHours !== null && endHours >= startHours) {
      return acc + (endHours - startHours);
    }
    return acc;
  }, 0);
  return Math.round(totalHours * 60);
}


interface ActivityReportProps {
  selectedDate: Date;
  previousDayThirdShiftEnd?: string | null;
}

type Poste = "1er" | "2ème" | "3ème";
type Park = 'PARK 1' | 'PARK 2' | 'PARK 3';
type StockType = 'NORMAL' | 'OCEANE' | 'PB30';
type StockTime = 'HEURE DEBUT STOCK';

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

interface Counter {
    id: string;
    poste: Poste | '';
    start: string;
    end: string;
    error?: string;
}

interface LiaisonCounter {
    id: string;
    poste: Poste | '';
    start: string;
    end: string;
    error?: string;
}

interface StockEntry {
  id: string;
  poste: Poste | '';
  park: Park | '';
  type: StockType | '';
  quantity: string;
  startTime: string;
}

const MAX_HOURS_PER_POSTE = 8;

export function ActivityReport({ selectedDate, previousDayThirdShiftEnd = null }: ActivityReportProps) {
  const { toast } = useToast();

  const [stops, setStops] = useState<Stop[]>([
    { id: crypto.randomUUID(), duration: "", nature: "" },
  ]);
  const [vibratorCounters, setVibratorCounters] = useState<Counter[]>([
    { id: crypto.randomUUID(), poste: "", start: "", end: "" },
  ]);
  const [liaisonCounters, setLiaisonCounters] = useState<LiaisonCounter[]>([
    { id: crypto.randomUUID(), poste: "", start: "", end: "" },
  ]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([
      { id: crypto.randomUUID(), poste: '', park: '', type: '', quantity: '', startTime: '' }
  ]);

  const [totalDowntime, setTotalDowntime] = useState(0);
  const [operatingTime, setOperatingTime] = useState(TOTAL_PERIOD_MINUTES);
  const [totalVibratorMinutes, setTotalVibratorMinutes] = useState(0);
  const [totalLiaisonMinutes, setTotalLiaisonMinutes] = useState(0);
  const [hasVibratorErrors, setHasVibratorErrors] = useState(false);
  const [hasLiaisonErrors, setHasLiaisonErrors] = useState(false);
  const [hasStockErrors, setHasStockErrors] = useState(false);
  const [vibratorCounterErrors, setVibratorCounterErrors] = useState<Record<string, string>>({});
  const [liaisonCounterErrors, setLiaisonCounterErrors] = useState<Record<string, string>>({});

    const formattedDate = selectedDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

  useEffect(() => {
    const calculatedDowntime = stops.reduce((acc, stop) => acc + parseDurationToMinutes(stop.duration), 0);
    setTotalDowntime(calculatedDowntime);
    const calculatedOperatingTime = TOTAL_PERIOD_MINUTES - calculatedDowntime;
    setOperatingTime(calculatedOperatingTime >= 0 ? calculatedOperatingTime : 0);
  }, [stops]);

  const validateCounterEntry = (
        counterId: string,
        counters: Array<Counter | LiaisonCounter>,
        type: 'vibrator' | 'liaison',
        currentStartStr: string,
        currentEndStr: string,
        currentPoste: Poste | '',
        previousDayData?: string | null
    ): string | undefined => {
        const startVal = validateAndParseCounterValue(currentStartStr);
        const endVal = validateAndParseCounterValue(currentEndStr);

         if ((currentStartStr || currentEndStr) && !currentPoste) {
             return "Veuillez sélectionner un poste.";
         }
         if (!currentPoste && !currentStartStr && !currentEndStr) {
             return undefined;
         }

        if (startVal === null && currentStartStr !== '' && currentStartStr !== '.' && currentStartStr !== ',') return "Début invalide.";
        if (endVal === null && currentEndStr !== '' && currentEndStr !== '.' && currentEndStr !== ',') return "Fin invalide.";
        if (startVal === null || endVal === null) return undefined;

        if (endVal < startVal) return "Fin < Début.";

        const durationHours = endVal - startVal;
         if (durationHours > MAX_HOURS_PER_POSTE) {
             return `Durée max (${MAX_HOURS_PER_POSTE}h) dépassée (${durationHours.toFixed(2)}h).`;
         }

        let expectedPreviousFinStr: string | undefined | null = undefined;
        let previousPosteName: string = '';

         if (currentPoste === '1er') {
             expectedPreviousFinStr = previousDayData;
             previousPosteName = "3ème (veille)";
             if (expectedPreviousFinStr === undefined) expectedPreviousFinStr = null;
         } else if (currentPoste === '2ème') {
             const previousCounter = counters.find(c => c.poste === '1er' && c.id !== counterId);
             expectedPreviousFinStr = previousCounter?.end;
             previousPosteName = "1er";
         } else if (currentPoste === '3ème') {
             const previousCounter = counters.find(c => c.poste === '2ème' && c.id !== counterId);
             expectedPreviousFinStr = previousCounter?.end;
             previousPosteName = "2ème";
         }

        if (expectedPreviousFinStr !== undefined && expectedPreviousFinStr !== null && currentStartStr !== '') {
             const expectedPreviousFinParsed = validateAndParseCounterValue(expectedPreviousFinStr);
            if (expectedPreviousFinParsed === null) {
                 // Skip check if previous is invalid
            } else if (startVal !== expectedPreviousFinParsed) {
                 return `Début (${startVal}) doit correspondre à Fin (${expectedPreviousFinParsed}) du ${previousPosteName} Poste.`;
             }
        } else if (expectedPreviousFinStr === null && currentPoste === '1er') {
             // OK
         } else if (expectedPreviousFinStr === undefined && currentPoste !== '1er') {
             // OK if first entry
         }

        return undefined;
   };

    useEffect(() => {
        let vibratorValidationPassed = true;
        const newVibratorErrors: Record<string, string> = {};
        const validVibratorCounters = vibratorCounters.filter(c => {
            const error = validateCounterEntry(c.id, vibratorCounters, 'vibrator', c.start, c.end, c.poste, previousDayThirdShiftEnd);
            if (error) {
                newVibratorErrors[c.id] = error;
                vibratorValidationPassed = false;
                return false;
            }
            return true;
        });
        setVibratorCounterErrors(newVibratorErrors);
        setHasVibratorErrors(!vibratorValidationPassed);
        const vibratorTotal = calculateTotalCounterMinutes(validVibratorCounters);
        setTotalVibratorMinutes(vibratorTotal);
        if (vibratorTotal > TOTAL_PERIOD_MINUTES) {
             setHasVibratorErrors(true);
        }

        let liaisonValidationPassed = true;
        const newLiaisonErrors: Record<string, string> = {};
        const validLiaisonCounters = liaisonCounters.filter(c => {
             const error = validateCounterEntry(c.id, liaisonCounters, 'liaison', c.start, c.end, c.poste, undefined);
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
             setHasLiaisonErrors(true);
        }
    }, [vibratorCounters, liaisonCounters, previousDayThirdShiftEnd]);

    useEffect(() => {
      const activeEntryNeedsPoste = stockEntries.some(entry =>
          (entry.park || entry.type || entry.quantity || entry.startTime) && !entry.poste
      );
      setHasStockErrors(activeEntryNeedsPoste);
    }, [stockEntries]);

  const addStop = () => {
    setStops([...stops, { id: crypto.randomUUID(), duration: "", nature: "" }]);
  };

  const addVibratorCounter = () => {
    setVibratorCounters([...vibratorCounters, { id: crypto.randomUUID(), poste: "", start: "", end: "" }]);
  };

  const addLiaisonCounter = () => {
    setLiaisonCounters([...liaisonCounters, { id: crypto.randomUUID(), poste: "", start: "", end: "" }]);
  };

   const addStockEntry = () => {
        setStockEntries([...stockEntries, { id: crypto.randomUUID(), poste: '', park: '', type: '', quantity: '', startTime: '' }]);
   };

  const deleteStop = (id: string) => {
    setStops(stops.filter(stop => stop.id !== id));
  };

  const deleteVibratorCounter = (id: string) => {
    setVibratorCounters(vibratorCounters.filter(counter => counter.id !== id));
     setVibratorCounterErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
  };

  const deleteLiaisonCounter = (id: string) => {
    setLiaisonCounters(liaisonCounters.filter(counter => counter.id !== id));
      setLiaisonCounterErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
  };

  const deleteStockEntry = (id: string) => {
    setStockEntries(stockEntries.filter(entry => entry.id !== id));
  };

 const updateStop = (id: string, field: keyof Omit<Stop, 'id'>, value: string) => {
    setStops(stops.map(stop => stop.id === id ? { ...stop, [field]: value } : stop));
 };

 const updateVibratorCounter = (id: string, field: keyof Omit<Counter, 'id' | 'error'>, value: string) => {
    setVibratorCounters(prevCounters => prevCounters.map(counter => {
        if (counter.id === id) {
            const updatedCounter = { ...counter, [field]: value };
            setVibratorCounterErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[id];
                return newErrors;
            });
            return updatedCounter;
        }
        return counter;
    }));
 };

 const updateLiaisonCounter = (id: string, field: keyof Omit<LiaisonCounter, 'id' | 'error'>, value: string) => {
     setLiaisonCounters(prevCounters => prevCounters.map(counter => {
         if (counter.id === id) {
             const updatedCounter = { ...counter, [field]: value };
             setLiaisonCounterErrors(prevErrors => {
                 const newErrors = { ...prevErrors };
                 delete newErrors[id];
                 return newErrors;
             });
             return updatedCounter;
         }
         return counter;
    }));
 };

 const updateStockEntry = (id: string, field: keyof Omit<StockEntry, 'id'>, value: string | boolean, parkOrType?: Park | StockType) => {
    setStockEntries(stockEntries.map(entry => {
      if (entry.id === id) {
         const updatedEntry = { ...entry, [field]: value };
         if (field === 'poste') {
             updatedEntry.park = '';
             updatedEntry.type = '';
             updatedEntry.quantity = '';
             updatedEntry.startTime = '';
         } else if (field === 'park') {
             updatedEntry.type = '';
             updatedEntry.quantity = '';
              updatedEntry.startTime = '';
              if (value === false) updatedEntry.park = '';
         } else if (field === 'type') {
            updatedEntry.quantity = '';
             updatedEntry.startTime = '';
              if (value === false) updatedEntry.type = '';
         } else if (field === 'startTime') {
              updatedEntry.park = '';
              updatedEntry.type = '';
              updatedEntry.quantity = '';
              if (!value) updatedEntry.startTime = '';
              else if (typeof value === 'boolean' && value === true) {
                  updatedEntry.startTime = entry.startTime || '00:00';
              } else if (typeof value === 'string') {
                   updatedEntry.startTime = value;
              }
         }
         return updatedEntry;
      }
      return entry;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (hasVibratorErrors || hasLiaisonErrors || hasStockErrors) {
        console.error("Validation failed: Invalid inputs detected.");
        toast({ title: "Erreur de Validation", description: "Veuillez corriger les erreurs dans les formulaires.", variant: "destructive" });
        // Focus logic remains the same
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
        return;
    }
    console.log("Submitting Activity Report:", {
        stops,
        vibratorCounters,
        liaisonCounters,
        stockEntries,
        totalDowntime,
        operatingTime,
        totalVibratorMinutes,
        totalLiaisonMinutes,
    });
    toast({ title: "Succès", description: "Rapport soumis avec succès." });
  };

  return (
    <Card className="bg-card text-card-foreground rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-lg sm:text-xl font-bold">
          RAPPORT D'ACTIVITÉ TNR
        </CardTitle>
        <span className="text-xs sm:text-sm text-muted-foreground">{formattedDate}</span>
      </CardHeader>

       <form onSubmit={handleSubmit}>
            <CardContent className="p-0 space-y-6">

                {/* Arrêts Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-base sm:text-lg text-foreground">Arrêts</h3>
                        <Button variant="link" type="button" onClick={addStop} className="text-primary text-xs sm:text-sm p-0 h-auto">
                            <Plus className="h-4 w-4 mr-1" /> Ajouter Arrêt
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
                                {stops.map((stop) => (
                                <TableRow key={stop.id} className="hover:bg-muted/50">
                                    <TableCell className="p-1 sm:p-2">
                                    <Input
                                        type="text"
                                        className="w-full h-8 text-xs sm:text-sm"
                                        placeholder="ex: 1h 30"
                                        value={stop.duration}
                                        onChange={(e) =>
                                        updateStop(stop.id, "duration", e.target.value)
                                        }
                                    />
                                    </TableCell>
                                    <TableCell className="p-1 sm:p-2">
                                    <Input
                                        type="text"
                                        className="w-full h-8 text-xs sm:text-sm"
                                        value={stop.nature}
                                        onChange={(e) =>
                                        updateStop(stop.id, "nature", e.target.value)
                                        }
                                    />
                                    </TableCell>
                                    <TableCell className="p-1 sm:p-2 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        onClick={() => deleteStop(stop.id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
                                    >
                                        <Trash className="h-4 w-4" />
                                        <span className="sr-only">Supprimer</span>
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                                {stops.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground p-4 text-xs sm:text-sm">
                                            Aucun arrêt ajouté.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-2 text-right text-xs sm:text-sm text-muted-foreground">
                        Total Arrêts: <strong>{formatMinutesToHoursMinutes(totalDowntime)}</strong>
                    </div>
                </div>

                {/* Operating Time Display */}
                <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold text-base sm:text-lg text-foreground mb-2">Temps de Fonctionnement (24h - Arrêts)</h3>
                    <div className="space-y-1">
                        <Label htmlFor="total-operating-tnr" className="text-xs sm:text-sm text-muted-foreground">
                            Temps de Fonctionnement Estimé
                        </Label>
                        <Input id="total-operating-tnr" type="text" value={formatMinutesToHoursMinutes(operatingTime)} className="h-8 sm:h-9 bg-input font-medium text-sm" readOnly tabIndex={-1}/>
                    </div>
                </div>


                {/* Compteurs Vibreurs Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-base sm:text-lg text-foreground">Compteurs Vibreurs</h3>
                        <Button variant="link" type="button" className="text-primary text-xs sm:text-sm p-0 h-auto" onClick={addVibratorCounter}>
                            <Plus className="h-4 w-4 mr-1" /> Ajouter Vibreur
                        </Button>
                    </div>
                    {hasVibratorErrors && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs sm:text-sm">
                                Erreur(s) dans les compteurs vibreurs. Vérifiez les postes, la continuité et les valeurs (Fin ≥ Début, Durée max {MAX_HOURS_PER_POSTE}h/poste, Total ≤ 24h).
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[130px]">
                                    Poste
                                </TableHead>
                                <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[120px]">
                                    Début (ex: 9341.0)
                                </TableHead>
                                <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[120px]">
                                    Fin (ex: 9395.3)
                                </TableHead>
                                <TableHead className="p-2 text-right text-xs sm:text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vibratorCounters.map((counter) => (
                                <TableRow key={counter.id} className="hover:bg-muted/50">
                                     <TableCell className="p-1 sm:p-2">
                                        <Select
                                            value={counter.poste}
                                            onValueChange={(value: Poste) => updateVibratorCounter(counter.id, "poste", value)}
                                            >
                                            <SelectTrigger id={`vibrator-poste-trigger-${counter.id}`} className={cn("h-8 text-xs sm:text-sm", vibratorCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}>
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
                                    <TableCell className="p-1 sm:p-2">
                                    <Input
                                        id={`vibrator-start-${counter.id}`}
                                        type="text"
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-xs sm:text-sm", vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}
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
                                    <TableCell className="p-1 sm:p-2">
                                    <Input
                                        id={`vibrator-end-${counter.id}`}
                                        type="text"
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-xs sm:text-sm", vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.end}
                                        placeholder="Index fin"
                                        onChange={(e) =>
                                        updateVibratorCounter(counter.id, "end", e.target.value)
                                        }
                                         aria-invalid={!!vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste")}
                                         aria-describedby={vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste") ? `error-vibrator-${counter.id}-end` : undefined}
                                    />
                                    {vibratorCounterErrors[counter.id] && !vibratorCounterErrors[counter.id]?.includes("poste") ? <p id={`error-vibrator-${counter.id}-end`} className="text-xs text-destructive pt-1">{vibratorCounterErrors[counter.id]}</p> : null}
                                    </TableCell>
                                    <TableCell className="p-1 sm:p-2 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        onClick={() => deleteVibratorCounter(counter.id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
                                    >
                                        <Trash className="h-4 w-4" />
                                        <span className="sr-only">Supprimer</span>
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                                {vibratorCounters.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground p-4 text-xs sm:text-sm">
                                            Aucun compteur vibreur ajouté.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-2 text-right text-xs sm:text-sm text-muted-foreground">
                        Durée Totale Vibreurs: <strong>{formatMinutesToHoursMinutes(totalVibratorMinutes)}</strong>
                    </div>
                </div>

                {/* Compteurs LIAISON Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-base sm:text-lg text-foreground">Compteurs LIAISON</h3>
                        <Button variant="link" type="button" className="text-primary text-xs sm:text-sm p-0 h-auto" onClick={addLiaisonCounter}>
                            <Plus className="h-4 w-4 mr-1" /> Ajouter Liaison
                        </Button>
                    </div>
                     {hasLiaisonErrors && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                             <AlertDescription className="text-xs sm:text-sm">
                                Erreur(s) dans les compteurs liaison. Vérifiez les postes, la continuité et les valeurs (Fin ≥ Début, Durée max {MAX_HOURS_PER_POSTE}h/poste, Total ≤ 24h).
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                 <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[130px]">
                                    Poste
                                </TableHead>
                                <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[120px]">
                                    Début (ex: 100.5)
                                </TableHead>
                                <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[120px]">
                                    Fin (ex: 105.75)
                                </TableHead>
                                <TableHead className="p-2 text-right text-xs sm:text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {liaisonCounters.map((counter) => (
                                <TableRow key={counter.id} className="hover:bg-muted/50">
                                     <TableCell className="p-1 sm:p-2">
                                        <Select
                                            value={counter.poste}
                                            onValueChange={(value: Poste) => updateLiaisonCounter(counter.id, "poste", value)}
                                            >
                                            <SelectTrigger id={`liaison-poste-trigger-${counter.id}`} className={cn("h-8 text-xs sm:text-sm", liaisonCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}>
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
                                    <TableCell className="p-1 sm:p-2">
                                    <Input
                                        id={`liaison-start-${counter.id}`}
                                        type="text"
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-xs sm:text-sm", liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}
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
                                    <TableCell className="p-1 sm:p-2">
                                    <Input
                                        id={`liaison-end-${counter.id}`}
                                        type="text"
                                        inputMode="decimal"
                                        className={cn("w-full h-8 text-xs sm:text-sm", liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste") && "border-destructive focus-visible:ring-destructive")}
                                        value={counter.end}
                                        placeholder="Index fin"
                                        onChange={(e) =>
                                        updateLiaisonCounter(counter.id, "end", e.target.value)
                                        }
                                        aria-invalid={!!liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste")}
                                        aria-describedby={liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste") ? `error-liaison-${counter.id}-end` : undefined}
                                    />
                                     {liaisonCounterErrors[counter.id] && !liaisonCounterErrors[counter.id]?.includes("poste") ? <p id={`error-liaison-${counter.id}-end`} className="text-xs text-destructive pt-1">{liaisonCounterErrors[counter.id]}</p> : null }
                                    </TableCell>
                                    <TableCell className="p-1 sm:p-2 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        onClick={() => deleteLiaisonCounter(counter.id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
                                    >
                                        <Trash className="h-4 w-4" />
                                        <span className="sr-only">Supprimer</span>
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                                {liaisonCounters.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground p-4 text-xs sm:text-sm">
                                            Aucun compteur liaison ajouté.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-2 text-right text-xs sm:text-sm text-muted-foreground">
                        Durée Totale Liaison: <strong>{formatMinutesToHoursMinutes(totalLiaisonMinutes)}</strong>
                    </div>
                </div>


                {/* Stock Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-base sm:text-lg text-foreground">Stock</h3>
                        <Button variant="link" type="button" className="text-primary text-xs sm:text-sm p-0 h-auto" onClick={addStockEntry}>
                        <Plus className="h-4 w-4 mr-1" /> Ajouter Entrée Stock
                        </Button>
                    </div>
                    {hasStockErrors && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs sm:text-sm">
                                Erreur(s) dans les entrées de stock. Veuillez sélectionner un poste pour chaque entrée active.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="overflow-x-auto">
                        <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                            <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[130px]">Poste</TableHead>
                            <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[120px]">PARK</TableHead>
                            <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[180px]">Type Produit / Info</TableHead>
                            <TableHead className="p-2 text-left text-xs sm:text-sm font-medium text-muted-foreground min-w-[120px]">Quantité / Heure</TableHead>
                            <TableHead className="p-2 text-right text-xs sm:text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockEntries.map((entry) => {
                                const entryError = (entry.park || entry.type || entry.quantity || entry.startTime) && !entry.poste ? "Veuillez sélectionner un poste." : undefined;
                                return (
                                    <TableRow key={entry.id} className="hover:bg-muted/50">
                                        <TableCell className="p-1 sm:p-2 align-top">
                                            <Select
                                                value={entry.poste}
                                                onValueChange={(value: Poste) => updateStockEntry(entry.id, "poste", value)}
                                            >
                                                <SelectTrigger id={`stock-poste-trigger-${entry.id}`} className={cn("h-8 text-xs sm:text-sm min-w-[110px]", entryError && "border-destructive focus-visible:ring-destructive")}>
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
                                        <TableCell className="p-1 sm:p-2 align-top">
                                        <div className="space-y-2">
                                            {PARKS.map(park => (
                                            <div key={park} className="flex items-center space-x-2">
                                                <Checkbox
                                                id={`${entry.id}-${park}`}
                                                checked={entry.park === park}
                                                disabled={!entry.poste}
                                                onCheckedChange={(checked) => updateStockEntry(entry.id, 'park', checked ? park : false, park)}
                                                />
                                                <Label htmlFor={`${entry.id}-${park}`} className={`font-normal text-xs sm:text-sm ${!entry.poste ? 'text-muted-foreground' : ''}`}>{park}</Label>
                                            </div>
                                            ))}
                                        </div>
                                        </TableCell>
                                        <TableCell className="p-1 sm:p-2 align-top">
                                            <div className="space-y-2">
                                                {STOCK_TYPES.map(type => (
                                                <div key={type} className="flex items-center space-x-2">
                                                    <Checkbox
                                                    id={`${entry.id}-${type}`}
                                                    checked={entry.type === type}
                                                    disabled={!entry.poste || !entry.park || !!entry.startTime}
                                                    onCheckedChange={(checked) => updateStockEntry(entry.id, 'type', checked ? type : false, type)}
                                                    />
                                                    <Label htmlFor={`${entry.id}-${type}`} className={`font-normal text-xs sm:text-sm ${!entry.poste || !entry.park || !!entry.startTime ? 'text-muted-foreground' : ''}`}>{type}</Label>
                                                </div>
                                                ))}
                                                 <div key={STOCK_TIME_LABEL} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${entry.id}-startTime`}
                                                        checked={!!entry.startTime}
                                                        disabled={!entry.poste || !!entry.park || !!entry.type}
                                                        onCheckedChange={(checked) => updateStockEntry(entry.id, 'startTime', checked ? (entry.startTime || '00:00') : false, undefined)}
                                                    />
                                                    <Label htmlFor={`${entry.id}-startTime`} className={`font-normal text-xs sm:text-sm ${!entry.poste || !!entry.park || !!entry.type ? 'text-muted-foreground' : ''}`}>{STOCK_TIME_LABEL}</Label>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-1 sm:p-2 align-top">
                                            {entry.type && (
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full h-8 text-xs sm:text-sm mt-1"
                                                    placeholder="Quantité"
                                                    value={entry.quantity}
                                                    disabled={!entry.poste || !entry.type}
                                                    onChange={(e) => updateStockEntry(entry.id, "quantity", e.target.value)}
                                                />
                                            )}
                                            {!!entry.startTime && (
                                                 <Input
                                                    type="time"
                                                    className="w-full h-8 text-xs sm:text-sm mt-1"
                                                    value={entry.startTime}
                                                    disabled={!entry.poste || !!entry.park || !!entry.type}
                                                    onChange={(e) => updateStockEntry(entry.id, "startTime", e.target.value)}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="p-1 sm:p-2 text-right align-top">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={() => deleteStockEntry(entry.id)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 mt-1 flex-shrink-0"
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
                                    <TableCell colSpan={5} className="text-center text-muted-foreground p-4 text-xs sm:text-sm">
                                        Aucune entrée de stock ajoutée.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </div>
                </div>


                {/* Action Buttons */}
                <div className="mt-8 flex justify-end space-x-2 sm:space-x-3">
                    <Button type="button" variant="outline" size="sm">Enregistrer Brouillon</Button>
                    <Button type="submit" size="sm" disabled={hasVibratorErrors || hasLiaisonErrors || hasStockErrors}>
                        Soumettre Rapport
                    </Button>
                </div>
            </CardContent>
        </form>
    </Card>
  );
}
