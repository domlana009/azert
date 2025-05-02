
"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert for errors
import { AlertCircle } from "lucide-react"; // Icon for errors
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { useToast } from "@/hooks/use-toast"; // Import useToast


interface R0ReportProps {
  selectedDate: Date; // Changed prop name and kept type as Date
   // Prop for previous day's 3rd shift end counter
   previousDayThirdShiftEnd?: string | null; // Use string | null to represent potential absence
}

type Poste = "1er" | "2ème" | "3ème";
const MAX_HOURS_PER_POSTE = 8;

// Updated Poste times and order - IMPORTANT: Array order matters for validation logic
const POSTE_TIMES: Record<Poste, string> = {
  "1er": "06:30 - 14:30", // Index 0
  "2ème": "14:30 - 22:30", // Index 1
  "3ème": "22:30 - 06:30", // Index 2 (of the next day cycle)
};
// Order for UI display and indexing in arrays
const POSTE_ORDER: Poste[] = ["1er", "2ème", "3ème"]; // Match indexCompteurs array order

// Define types for form data sections
interface RepartitionItem {
  chantier: string;
  temps: string;
  imputation: string;
}

// Define type for Index Compteur per Poste
interface IndexCompteurPoste {
    debut: string;
    fin: string;
}

// Updated ventilation item structure to include 'note'
interface VentilationItem {
  code: number;
  label: string;
  duree: string;
  note: string; // Added note field
}

interface FormData {
  entree: string;
  secteur: string;
  rapportNo: string;
  machineEngins: string;
  sa: string;
  unite: string;
  indexCompteurs: IndexCompteurPoste[]; // Array for debut/fin per poste, ORDER MUST MATCH POSTE_ORDER
  shifts: string[]; // Corresponds to postes 1er, 2eme, 3eme D/F times
  ventilation: VentilationItem[]; // Use updated VentilationItem type
  arretsExplication: string; // Added field for explanation of stops
  exploitation: Record<string, string>; // Use a record for exploitation data
  // 'bulls' now used for displaying calculated gross hours per poste
  bulls: string[]; // Index 0: 1er, Index 1: 2eme, Index 2: 3eme
  repartitionTravail: RepartitionItem[];
  tricone: {
    pose: string;
    depose: string;
    causeDepose: string;
    indexCompteur: string; // Added index compteur for Tricone
  };
  gasoil: {
    lieuAppoint: string;
    indexCompteur: string; // Specific index for gasoil
    quantiteDelivree: string;
  };
  personnel: {
    conducteur: string;
    graisseur: string;
    matricules: string;
  };
  machineMarque: string;
  machineSerie: string;
  machineType: string;
  machineDiametre: string;
}

// Sample data structure based on user input (assuming this structure)
 const ventilationBaseData = [
    { code: 121, label: "ARRET CARREAU INDUSTRIEL" },
    { code: 122, label: "COUPURE GENERALE DU COURANT" },
    { code: 123, label: "GREVE" },
    { code: 124, label: "INTEMPERIES" },
    { code: 125, label: "STOCKS PLEINS" },
    { code: 126, label: "J. FERIES OU HEBDOMADAIRES" }, // Corrected FÊRIES to FERIES
    { code: 127, label: "ARRET PAR LA CENTRALE (ENERGIE)" }, // Corrected (E.M.E.) based on latest prompt - Assuming 127 instead of 128
    { code: 230, label: "CONTROLE" },
    { code: 231, label: "DEFAUT ELEC. (C. CRAME, RESEAU)" }, // Corrected C.RAME & RESAU
    { code: 232, label: "PANNE MECANIQUE" },
    { code: 233, label: "PANNE ELECTRIQUE" }, // Was PANNE ATELIER in previous data, corrected based on context
    { code: 234, label: "INTERVENTION ATELIER PNEUMATIQUE" },
    { code: 235, label: "ENTRETIEN SYSTEMATIQUE" },
    { code: 236, label: "APPOINT (HUILE, GAZOL, EAU)" }, // Corrected GAZOIL to GAZOL
    { code: 237, label: "GRAISSAGE" },
    { code: 238, label: "ARRET ELEC. INSTALLATION FIXES" },
    { code: 239, label: "MANQUE CAMIONS" },
    { code: 240, label: "MANQUE BULL" },
    { code: 241, label: "MANQUE MECANICIEN" },
    { code: 242, label: "MANQUE OUTILS DE TRAVAIL" },
    { code: 243, label: "MACHINE A L'ARRET" },
    { code: 244, label: "PANNE ENGIN DEVANT MACHINE" },
    { code: 441, label: "RELEVE" }, // Adjusted code based on later user input/context (was 442)
    { code: 442, label: "EXECUTION PLATE FORME" }, // Adjusted code (was 443)
    { code: 443, label: "DEPLACEMENT" }, // Adjusted code (was 444)
    { code: 444, label: "TIR ET SAUTAGE" }, // Adjusted code (was 445)
    { code: 445, label: "MOUV. DE CABLE" }, // Adjusted code (was 446)
    { code: 446, label: "ARRET DECIDE" }, // Adjusted code (was 448)
    { code: 447, label: "MANQUE CONDUCTEUR" }, // Adjusted code (was 449)
    { code: 448, label: "BRIQUET" }, // Adjusted code (was 450)
    { code: 449, label: "PERTES (INTEMPERIES EXCLUES)" }, // Adjusted code (was 451)
    { code: 450, label: "ARRETS MECA. INSTALLATIONS FIXES" }, // Adjusted code (was 452)
    { code: 451, label: "TELESCOPAGE" }, // Adjusted code (was 453)
    // Assuming the last two codes were typos and should be distinct
    { code: 452, label: "EXCAVATION PURE" }, // No change
    { code: 453, label: "TERRASSEMENT PUR" }, // No change
 ];

 // Initialize ventilation data with empty duree and note
 const initialVentilationData: VentilationItem[] = ventilationBaseData.map(item => ({
    ...item,
    duree: "",
    note: "", // Initialize note as empty string
 }));


 const exploitationLabels = [
    "HEURES COMPTEUR", // This will be calculated (Net Hours)
    "METRAGE FORE",
    "NOMBRE DE TROUS FORES",
    "NOMBRE DE VOYAGES",
    "NOMBRE D'ECAPAGES", // Corrected DECAPAGES
    "TONNAGE",
    "NOMBRE T.K.J", // Corrected T.K.U
 ];

 const personnelLabels = ["CONDUCTEUR", "GRAISSEUR", "MATRICULES"];

 const causeDeposeOptions = [
    "T1 CORPS USE",
    "T2 MOLLETTES USEES", // Corrected MOLETTES
    "T3 MOLLETTES PERDUES",
    "T4 ROULEMENT CASSE",
    "T5 CORPS FISSURE",
    "T6 ROULEMENT COINCE",
    "T7 FILAGE ABIME",
    "T8 TRICONE PERDU", // Corrected TRONCON PERDU -> Assuming this based on T1-T7
 ];


// Helper function to parse duration strings into minutes
function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0;

  // Clean the string: remove anything not a digit, H, h, :, ·, M, m
  // Allow spaces for flexibility e.g., "1 H 20 M"
  const cleaned = duration.replace(/[^0-9Hh:·Mm\s]/g, '').trim().toUpperCase();

  let hours = 0;
  let minutes = 0;

  // Match formats like HH:MM, HH·MM, HH H MM M, HH H MM, H:MM, H·MM, H H MM M, H H MM
  let match = cleaned.match(/^(?:(\d{1,2})\s?[H:·]\s?)?(\d{1,2})\s?M?$/);
   if (match) {
     hours = match[1] ? parseInt(match[1], 10) : 0;
     minutes = parseInt(match[2], 10);
      // Validate parsed numbers
     if (isNaN(hours) || isNaN(minutes)) return 0;
     return (hours * 60) + minutes;
   }


   // Match formats like HH H, H H
   match = cleaned.match(/^(\d{1,2})\s?H$/);
    if (match) {
      hours = parseInt(match[1], 10);
      if (isNaN(hours)) return 0;
      return hours * 60;
    }

  // Match only numbers (assume minutes)
  match = cleaned.match(/^(\d+)\s?M?$/);
  if (match) {
    minutes = parseInt(match[1], 10);
    if (isNaN(minutes)) return 0;
    return minutes;
  }

  console.warn(`Could not parse duration: "${duration}"`);
  return 0; // Return 0 if parsing fails
}


// Helper function to format minutes into HHh MMm string
function formatMinutesToHoursMinutes(totalMinutes: number): string {
    if (isNaN(totalMinutes) || totalMinutes <= 0) return "0h 0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60); // Round minutes
    return `${hours}h ${minutes}m`;
}

// Helper function to format hours (float) into HHh MMm string
function formatHoursToHoursMinutes(totalHours: number): string {
    if (isNaN(totalHours) || totalHours <= 0) return "0h 0m";
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours}h ${minutes}m`;
}

// Helper function to validate and parse counter values (returns null on failure)
function validateAndParseCounterValue(value: string): number | null {
    if (!value) return 0; // Treat empty as 0 for calculation consistency
    const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    if (cleaned === '' || cleaned === '.' || cleaned === ',') return null; // Incomplete input
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed; // Return null if not a valid number
}


// Added type prop
export function R0Report({ selectedDate, previousDayThirdShiftEnd = null }: R0ReportProps) { // Updated prop name
   const { toast } = useToast();
   const [selectedPoste, setSelectedPoste] = useState<Poste>("1er"); // Default to 1er Poste
   // State to hold calculated gross hours per poste and total
   const [calculatedHours, setCalculatedHours] = useState<{ poste: number[]; total: number }>({ poste: [0, 0, 0], total: 0 });
   // State to hold total stop duration in minutes
   const [totalStopMinutes, setTotalStopMinutes] = useState(0);
   // State to hold net working hours (total gross hours - total stop hours)
   const [netWorkingHours, setNetWorkingHours] = useState(0);
   // State for counter validation errors (including sequential checks)
   const [counterErrors, setCounterErrors] = useState<string[]>(['', '', '']); // One error message per poste

  const [formData, setFormData] = useState<FormData>({
    entree: "",
    secteur: "",
    rapportNo: "",
    machineEngins: "",
    sa: "",
    unite: "",
    indexCompteurs: Array(3).fill(null).map(() => ({ debut: "", fin: "" })), // Initialize for 3 postes, order: 1er, 2eme, 3eme
    shifts: ["", "", ""], // Corresponds to 1er, 2eme, 3eme D/F times
    ventilation: initialVentilationData, // Use initialized ventilation data with 'note'
    arretsExplication: "", // Initialize explanation field
    exploitation: exploitationLabels.reduce((acc, label) => ({ ...acc, [label]: "" }), {}), // Initialize exploitation fields
    bulls: ["", "", ""], // Display for gross hours: Index 0: 1er, Index 1: 2eme, Index 2: 3eme
    repartitionTravail: Array(3).fill(null).map(() => ({ chantier: "", temps: "", imputation: "" })), // Create distinct objects
    tricone: {
      pose: "",
      depose: "",
      causeDepose: "",
      indexCompteur: "", // Added field
    },
    gasoil: {
      lieuAppoint: "",
      indexCompteur: "", // Gasoil specific index
      quantiteDelivree: "",
    },
    personnel: { // Initialize personnel object
        conducteur: "",
        graisseur: "",
        matricules: "",
    },
    machineMarque: "",
    machineSerie: "",
    machineType: "",
    machineDiametre: "",
  });

    // Format date string once using the selectedDate prop
    const formattedDate = selectedDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });


  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, // Allow Textarea
      section: keyof FormData | 'ventilation' | 'repartitionTravail' | 'tricone' | 'gasoil' | 'shifts' | 'bulls' | 'indexCompteurs' | 'exploitation' | 'personnel',
      indexOrField?: number | string,
      fieldOrNestedField?: keyof RepartitionItem | keyof FormData['tricone'] | keyof FormData['gasoil'] | keyof IndexCompteurPoste | keyof FormData['personnel'] | 'duree' | 'note' // Added 'note'
    ) => {
      const { name, value } = e.target;
       // Use name attribute for top-level fields if available and section matches a key in FormData
      const targetName = (name && section in formData && typeof (formData as any)[section] === 'string') ? name : section;

      setFormData(prevData => {
          let newData = { ...prevData };

          if (section === 'ventilation' && typeof indexOrField === 'number' && (fieldOrNestedField === 'duree' || fieldOrNestedField === 'note')) {
              const newVentilation = [...newData.ventilation];
              if (newVentilation[indexOrField]) {
                 newVentilation[indexOrField] = { ...newVentilation[indexOrField], [fieldOrNestedField]: value };
                 newData.ventilation = newVentilation;
              }
          } else if (section === 'repartitionTravail' && typeof indexOrField === 'number' && fieldOrNestedField && fieldOrNestedField in newData.repartitionTravail[0]) {
              if (newData.repartitionTravail && newData.repartitionTravail[indexOrField]) {
                  const newRepartition = [...newData.repartitionTravail];
                  newRepartition[indexOrField] = { ...newRepartition[indexOrField], [fieldOrNestedField as keyof RepartitionItem]: value };
                  newData.repartitionTravail = newRepartition;
              }
          } else if (section === 'indexCompteurs' && typeof indexOrField === 'number' && fieldOrNestedField && fieldOrNestedField in newData.indexCompteurs[0]) {
             if (newData.indexCompteurs && newData.indexCompteurs[indexOrField]) {
                const newIndexCompteurs = [...newData.indexCompteurs];
                newIndexCompteurs[indexOrField] = { ...newIndexCompteurs[indexOrField], [fieldOrNestedField as keyof IndexCompteurPoste]: value };
                newData.indexCompteurs = newIndexCompteurs;

                 // Clear error for this specific poste when input changes
                 setCounterErrors(prevErrors => {
                    const updatedErrors = [...prevErrors];
                    updatedErrors[indexOrField] = '';
                    return updatedErrors;
                 });
            }
          } else if (section === 'tricone' && fieldOrNestedField && typeof fieldOrNestedField === 'string' && fieldOrNestedField in newData.tricone) {
              newData.tricone = { ...newData.tricone, [fieldOrNestedField as keyof typeof newData.tricone]: value };
          } else if (section === 'gasoil' && fieldOrNestedField && typeof fieldOrNestedField === 'string' && fieldOrNestedField in newData.gasoil) {
               newData.gasoil = { ...newData.gasoil, [fieldOrNestedField as keyof typeof newData.gasoil]: value };
          } else if (section === 'shifts' && typeof indexOrField === 'number') {
              const newShifts = [...newData.shifts];
              newShifts[indexOrField] = value;
              newData.shifts = newShifts;
          }
          // Handle exploitation fields
          else if (section === 'exploitation' && typeof indexOrField === 'string' && indexOrField in newData.exploitation) {
              newData.exploitation = { ...newData.exploitation, [indexOrField]: value };
          }
           // Handle personnel fields
          else if (section === 'personnel' && fieldOrNestedField && typeof fieldOrNestedField === 'string' && fieldOrNestedField in newData.personnel) {
             newData.personnel = { ...newData.personnel, [fieldOrNestedField as keyof typeof newData.personnel]: value };
          }
          // Handle top-level string fields directly (including arretsExplication)
          else if (typeof targetName === 'string' && targetName in newData && typeof (newData as any)[targetName] === 'string') {
             (newData as any)[targetName] = value;
          }
          else {
             console.warn("Unhandled input change:", { section, indexOrField, fieldOrNestedField, name, value });
          }
          return newData;
      });
  };

   const handleSelectChange = (
      value: string,
      section: keyof FormData | 'tricone' | 'gasoil', // Specify sections where select is used
      field: keyof FormData['tricone'] | keyof FormData['gasoil']
    ) => {
     setFormData(prevData => {
        let newData = { ...prevData };
        if (section === 'tricone' && field && typeof field === 'string' && field in newData.tricone) {
            newData.tricone = { ...newData.tricone, [field as keyof typeof newData.tricone]: value };
        } else if (section === 'gasoil' && field && typeof field === 'string' && field in newData.gasoil) {
             newData.gasoil = { ...newData.gasoil, [field as keyof typeof newData.gasoil]: value };
        }
        // Add other select handlers here if needed
        return newData;
     });
    };

    // Function to validate and calculate working hours from index compteurs
     const validateAndCalculateCompteurHours = () => {
        let validationPassed = true;
        const newErrors = ['', '', '']; // Order: 1er, 2eme, 3eme
        const previousDayFin3Parsed = validateAndParseCounterValue(previousDayThirdShiftEnd || ''); // Handle null/undefined

        const posteHours = formData.indexCompteurs.map((compteur, index) => {
            const posteName = POSTE_ORDER[index];
            const debutStr = compteur.debut;
            const finStr = compteur.fin;

            const debut = validateAndParseCounterValue(debutStr);
            const fin = validateAndParseCounterValue(finStr);

            // If both fields are empty or invalid for parsing, skip validation and return 0 hours
            if ((debutStr === '' && finStr === '') || debut === null || fin === null) {
                 // Clear error only if both are empty, otherwise keep potential parsing error
                 if (debutStr === '' && finStr === '') {
                     newErrors[index] = '';
                 } else if (debut === null && debutStr !== '') {
                      newErrors[index] = "Début invalide.";
                      validationPassed = false;
                 } else if (fin === null && finStr !== '') {
                     newErrors[index] = "Fin invalide.";
                      validationPassed = false;
                 }
                 // Don't reset errors if one field is valid and the other is empty/invalid yet
                 return 0;
             }

            // 1. Basic Validation (Fin >= Debut, Duration <= Max)
            if (fin < debut) {
                newErrors[index] = "Fin doit être supérieur ou égal à Début.";
                validationPassed = false;
                return 0;
            }
            const duration = fin - debut;
            if (duration > MAX_HOURS_PER_POSTE) {
                 newErrors[index] = `Durée max ${MAX_HOURS_PER_POSTE}h dépassée (${duration.toFixed(2)}h).`;
                 validationPassed = false;
                 return 0;
            }

            // 2. Sequential Validation (Check if current Debut matches previous Fin)
            // Index 0 (1er Poste): Check against previous day's 3eme Poste Fin
            if (index === 0) {
                 if (previousDayFin3Parsed !== null) { // Only validate if previous day data exists and is valid
                    if (debut !== previousDayFin3Parsed) {
                       newErrors[index] = `Début (${debut}) doit correspondre à Fin (${previousDayFin3Parsed}) du 3ème Poste de la veille.`;
                       validationPassed = false;
                       return 0;
                    }
                 } else if (previousDayThirdShiftEnd === undefined) {
                     // Prop wasn't passed (might be first day entry) - OK
                 } else if (previousDayThirdShiftEnd === null) {
                     // Previous day had no 3rd shift data - OK
                 } else {
                      // previousDayThirdShiftEnd was invalid - Maybe warn or add error?
                      // console.warn("Fin du 3ème Poste de la veille est invalide.");
                      // For now, let's allow starting without a valid previous value if it's unparseable
                 }
            }
            // Index 1 (2eme Poste): Check against 1er Poste Fin
            else if (index === 1) {
                const prevFinStr = formData.indexCompteurs[0]?.fin;
                const prevFin = validateAndParseCounterValue(prevFinStr || '');
                if (prevFin !== null) { // Only validate if 1er Fin exists and is numeric
                    if (debut !== prevFin) {
                        newErrors[index] = `Début (${debut}) doit correspondre à Fin (${prevFin}) du ${POSTE_ORDER[0]} Poste.`;
                        validationPassed = false;
                        return 0;
                    }
                } else if (formData.indexCompteurs[0]?.debut !== '' && prevFinStr !== '') { // Error if debut exists but fin is invalid/empty
                     newErrors[index] = `Fin invalide ou manquante pour ${POSTE_ORDER[0]} Poste pour validation.`;
                     validationPassed = false;
                     return 0;
                 }
                 // else: Previous fin is empty/0, allow start (assumes it's the first entry or previous was 0)
            }
            // Index 2 (3eme Poste): Check against 2eme Poste Fin
            else if (index === 2) {
                const prevFinStr = formData.indexCompteurs[1]?.fin;
                const prevFin = validateAndParseCounterValue(prevFinStr || '');
                 if (prevFin !== null) { // Only validate if 2eme Fin exists and is numeric
                    if (debut !== prevFin) {
                        newErrors[index] = `Début (${debut}) doit correspondre à Fin (${prevFin}) du ${POSTE_ORDER[1]} Poste.`;
                        validationPassed = false;
                        return 0;
                    }
                 } else if (formData.indexCompteurs[1]?.debut !== '' && prevFinStr !== '') { // Error if debut exists but fin is invalid/empty
                     newErrors[index] = `Fin invalide ou manquante pour ${POSTE_ORDER[1]} Poste pour validation.`;
                     validationPassed = false;
                     return 0;
                 }
                  // else: Previous fin is empty/0, allow start
            }

             // Validation passed for this poste
            newErrors[index] = '';
            return duration; // Return calculated duration
        });

        setCounterErrors(newErrors);

        if (validationPassed) {
            const totalHours = posteHours.reduce((sum, hours) => sum + hours, 0);
            setCalculatedHours({ poste: posteHours, total: totalHours });

            // Update the 'bulls' array in formData with formatted gross hours for display
            const formattedGrossHours = posteHours.map(hours => formatHoursToHoursMinutes(hours));
            setFormData(prevData => ({
                ...prevData,
                bulls: formattedGrossHours // Use bulls to display formatted gross hours
            }));
        } else {
            // Reset calculated hours if validation fails
             setCalculatedHours({ poste: [0, 0, 0], total: 0 });
              setFormData(prevData => ({
                ...prevData,
                bulls: ["", "", ""], // Clear display hours
                exploitation: { // Also clear calculated HEURES COMPTEUR
                   ...prevData.exploitation,
                   "HEURES COMPTEUR": "Erreur Compteur"
                }
            }));
        }
        return validationPassed; // Return validation status
    };

    // Function to calculate total stop duration
    const calculateTotalStops = () => {
        const totalMinutes = formData.ventilation.reduce((acc, item) => {
             const minutes = parseDurationToMinutes(item.duree);
             if (isNaN(minutes)) {
                 console.warn(`Invalid duration format for ventilation code ${item.code}: "${item.duree}"`);
                 return acc; // Skip invalid durations
             }
             return acc + minutes;
        }, 0);
        setTotalStopMinutes(totalMinutes);
    };

     // Calculate Net Working Hours
    const calculateNetWorkingHours = () => {
        // Only calculate if there are no counter errors
        if (counterErrors.some(err => err !== '')) {
             setNetWorkingHours(0); // Reset if there are errors
             return;
        }
        const totalGrossHours = calculatedHours.total; // From index compteurs
        const totalStopHours = totalStopMinutes / 60;
        const netHours = totalGrossHours - totalStopHours;
        setNetWorkingHours(netHours >= 0 ? netHours : 0); // Ensure non-negative
    };


    // Recalculate on index compteur change or when previous day data potentially changes
    useEffect(() => {
        validateAndCalculateCompteurHours();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.indexCompteurs, previousDayThirdShiftEnd]); // Add dependency

     // Recalculate on ventilation duration change
    useEffect(() => {
        calculateTotalStops();
    }, [formData.ventilation]);

    // Recalculate net hours when gross hours or stop hours change, or errors change
    useEffect(() => {
        calculateNetWorkingHours();
         // Update the HEURES COMPTEUR field in exploitation data only if no errors
        const formattedNetHours = counterErrors.some(err => err !== '') ? "Erreur Compteur" : formatHoursToHoursMinutes(netWorkingHours);
        setFormData(prevData => ({
            ...prevData,
            exploitation: {
                ...prevData.exploitation,
                "HEURES COMPTEUR": formattedNetHours
            }
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calculatedHours.total, totalStopMinutes, counterErrors]); // Added counterErrors dependency


    // Handle form submission - Prevent submission if errors exist
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Re-validate on submit attempt to catch any potential inconsistencies
        const isCompteurValid = validateAndCalculateCompteurHours();

        if (!isCompteurValid) {
            console.error("Validation failed: Invalid counter inputs.");
            toast({ title: "Erreur de Validation", description: "Veuillez corriger les erreurs dans les compteurs.", variant: "destructive" });

            // Focus the first input with an error
            const firstErrorIndex = counterErrors.findIndex(err => err !== '');
            if (firstErrorIndex !== -1) {
                const firstErrorInputId = `index-debut-${POSTE_ORDER[firstErrorIndex]}`; // Focus debut input
                const firstErrorInput = document.getElementById(firstErrorInputId);
                firstErrorInput?.focus();
            }
            return; // Prevent submission
        }

        // If validation passes, proceed with submission logic...
        console.log("Form submitted:", formData);
        toast({ title: "Succès", description: "Rapport R0 soumis avec succès." });
        // TODO: Replace with actual submission logic (e.g., API call)
        // Example: await submitR0Report(formData);
    };


  return (
    <Card className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-xl font-bold">
          Rapport Journalier Détaillé (R0)
        </CardTitle>
        {/* Display the formatted date from the prop */}
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </CardHeader>

      {/* Use form tag and onSubmit handler */}
      <form onSubmit={handleSubmit}>
          <CardContent className="p-0 space-y-6">
             {/* Section: Entête Info */}
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-b pb-4">
                  <div>
                    <Label htmlFor="entree">Entrée</Label>
                    <Input id="entree" name="entree" placeholder="ENTREE" value={formData.entree} onChange={(e) => handleInputChange(e, 'entree')} className="h-8"/>
                  </div>
                  <div>
                    <Label htmlFor="secteur">Secteur</Label>
                    <Input id="secteur" name="secteur" placeholder="SECTEUR" value={formData.secteur} onChange={(e) => handleInputChange(e, 'secteur')} className="h-8"/>
                  </div>
                   <div>
                    <Label htmlFor="rapport-no">Rapport (R°)</Label>
                    <Input id="rapport-no" name="rapportNo" placeholder="N°" value={formData.rapportNo} onChange={(e) => handleInputChange(e, 'rapportNo')} className="h-8"/>
                  </div>
                  <div>
                    <Label htmlFor="machine-engins">Machine / Engins</Label>
                    <Input id="machine-engins" name="machineEngins" placeholder="Nom ou Code" value={formData.machineEngins} onChange={(e) => handleInputChange(e, 'machineEngins')} className="h-8"/>
                  </div>
                   <div>
                    <Label htmlFor="sa">S.A</Label>
                    <Input id="sa" name="sa" placeholder="S.A" value={formData.sa} onChange={(e) => handleInputChange(e, 'sa')} className="h-8"/>
                  </div>
                </div>


            {/* Section: Unite & Index Compteur per Poste */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <Label htmlFor="unite">Unité</Label>
                <Input
                  id="unite"
                  name="unite"
                  value={formData.unite}
                  onChange={(e) => handleInputChange(e, "unite")}
                  className="h-8"
                  placeholder="ex: H ou M3"
                />
              </div>
               {/* Index Compteur per Poste */}
               <div className="md:col-span-3 grid grid-cols-3 gap-4 border p-4 rounded-md bg-muted/30">
                    {POSTE_ORDER.map((poste, index) => (
                        <div key={`index-${poste}`} className="space-y-2">
                             <Label className="font-medium">{poste} Poste</Label>
                             <div>
                                <Label htmlFor={`index-debut-${poste}`} className="text-xs text-muted-foreground">Début</Label>
                                <Input
                                    id={`index-debut-${poste}`}
                                    type="text" // Use text to allow intermediate states like '.'
                                    inputMode="decimal"
                                    value={formData.indexCompteurs[index]?.debut || ''}
                                    onChange={(e) => handleInputChange(e, "indexCompteurs", index, 'debut')}
                                    placeholder="Index début"
                                    className={`h-8 ${counterErrors[index] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    aria-invalid={!!counterErrors[index]}
                                    aria-describedby={counterErrors[index] ? `error-compteur-${poste}` : undefined}
                                />
                             </div>
                             <div>
                                 <Label htmlFor={`index-fin-${poste}`} className="text-xs text-muted-foreground">Fin</Label>
                                <Input
                                    id={`index-fin-${poste}`}
                                    type="text" // Use text
                                    inputMode="decimal"
                                    value={formData.indexCompteurs[index]?.fin || ''}
                                    onChange={(e) => handleInputChange(e, "indexCompteurs", index, 'fin')}
                                    placeholder="Index fin"
                                    className={`h-8 ${counterErrors[index] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                     aria-invalid={!!counterErrors[index]}
                                     aria-describedby={counterErrors[index] ? `error-compteur-${poste}` : undefined}
                                />
                             </div>
                              <div className="text-xs text-muted-foreground pt-1">
                                 Heures Brutes: {formatHoursToHoursMinutes(calculatedHours.poste[index])}
                             </div>
                              {/* Display error message for this specific poste */}
                             {counterErrors[index] && (
                                <p id={`error-compteur-${poste}`} className="text-xs text-destructive pt-1">{counterErrors[index]}</p>
                             )}
                        </div>
                    ))}
                    <div className="col-span-3 mt-2 text-right font-semibold">
                        Total Heures Brutes (24h): {formatHoursToHoursMinutes(calculatedHours.total)}
                     </div>
                     {/* Display message about previous day's data if relevant */}
                     {previousDayThirdShiftEnd === undefined && (
                         <p className="col-span-3 text-xs text-muted-foreground mt-1">
                            Info: Données du 3ème poste de la veille non disponibles pour validation du début 1er poste.
                         </p>
                     )}
                      {previousDayThirdShiftEnd === null && (
                         <p className="col-span-3 text-xs text-muted-foreground mt-1">
                             Info: Pas de fin enregistrée pour le 3ème poste de la veille.
                         </p>
                     )}
               </div>
            </div>

             {/* General Counter Error Alert */}
              {counterErrors.some(err => err !== '') && (
                  <Alert variant="destructive" className="mt-4">
                       <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                          Erreur dans les index compteurs. Vérifiez les valeurs et la continuité entre les postes (Fin précédent = Début suivant).
                      </AlertDescription>
                  </Alert>
              )}

            {/* Section: Poste Selection & Shifts */}
            <div className="space-y-2">
               <Label className="text-foreground">Poste Actuel</Label>
                <RadioGroup
                  value={selectedPoste} // Controlled component
                  onValueChange={(value: Poste) => setSelectedPoste(value)}
                  className="flex flex-wrap space-x-4 pt-2"
                >
                  {POSTE_ORDER.map((poste) => ( // Use defined order
                    <div key={poste} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={poste} id={`r0-poste-${poste}`} />
                      <Label htmlFor={`r0-poste-${poste}`} className="font-normal text-foreground">
                        {poste} Poste <span className="text-muted-foreground text-xs">({POSTE_TIMES[poste]})</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Shift Input Fields (Example - adjust based on actual meaning) */}
               <div className="grid grid-cols-3 gap-4 pt-2">
                    {POSTE_ORDER.map((poste, index) => (
                      <div key={poste}>
                        <Label htmlFor={`shift-${poste}`} className="text-muted-foreground text-xs">{`${poste} D/F`}</Label>
                         <Input
                          id={`shift-${poste}`}
                          type="text"
                          value={formData.shifts[index]} // Assuming index matches POSTE_ORDER
                          onChange={(e) => handleInputChange(e, "shifts", index)}
                          placeholder={POSTE_TIMES[poste]} // Use times as placeholder
                          className="h-8"
                        />
                      </div>
                    ))}
                </div>
            </div>

            {/* Section: Ventilation */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground">Ventilation des Arrêts</h3>
               <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[80px]">Code</TableHead>
                          <TableHead>Nature de l'Arrêt</TableHead>
                          <TableHead className="w-[150px]">Note</TableHead>{/* Added Note Header */}
                          <TableHead className="text-right w-[150px]">Durée Totale</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.ventilation.map((item, index) => (
                          <TableRow key={item.code} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{item.code}</TableCell>
                            <TableCell>{item.label}</TableCell>
                            <TableCell>{/* Added Note Cell */}
                              <Input
                                type="text"
                                className="h-8 text-sm w-full"
                                placeholder="Ajouter une note..."
                                value={item.note}
                                onChange={(e) => handleInputChange(e, "ventilation", index, 'note')}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="text"
                                className="h-8 text-sm text-right w-full"
                                placeholder="ex: 1h 30m"
                                value={item.duree}
                                onChange={(e) => handleInputChange(e, "ventilation", index, 'duree')}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Add Total Row */}
                         <TableRow className="bg-muted/80 font-semibold">
                             <TableCell colSpan={3}>TOTAL Arrêts</TableCell>{/* Adjusted colSpan */}
                             <TableCell className="text-right">
                                 <Input
                                    type="text"
                                    className="h-8 text-sm text-right w-full bg-transparent font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                    readOnly
                                    value={formatMinutesToHoursMinutes(totalStopMinutes)}
                                    tabIndex={-1}
                                  />
                             </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                </div>
            </div>

            {/* Section: Explication des Arrêts */}
             <div className="space-y-2">
                 <Label htmlFor="arrets-explication" className="font-semibold text-lg text-foreground">Explication des Arrêts</Label>
                 <Textarea
                    id="arrets-explication"
                    name="arretsExplication"
                    placeholder="Expliquez ici les arrêts enregistrés ci-dessus..."
                    value={formData.arretsExplication}
                    onChange={(e) => handleInputChange(e, "arretsExplication")}
                    className="min-h-[100px]"
                 />
            </div>


             {/* Section: Exploitation Metrics */}
             <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold text-lg text-foreground mb-4">Données d'Exploitation</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {exploitationLabels.map((item) => (
                             <div key={item} className="space-y-1">
                                <Label htmlFor={`expl-${item.toLowerCase().replace(/\s/g, '-')}`} className="text-sm text-muted-foreground">
                                    {item}
                                </Label>
                                <Input
                                    id={`expl-${item.toLowerCase().replace(/\s/g, '-')}`}
                                    type={item === "HEURES COMPTEUR" ? "text" : "number"} // Use number for metrics, text for calculated hours
                                    step={item !== "HEURES COMPTEUR" ? "0.01" : undefined} // Allow decimals for metrics
                                    className={`h-8 ${item === "HEURES COMPTEUR" ? 'bg-input font-medium border-input focus-visible:ring-0 focus-visible:ring-offset-0 cursor-default' : ''}`} // Updated styling for read-only
                                    value={formData.exploitation[item]}
                                    onChange={(e) => handleInputChange(e, 'exploitation', item)}
                                    readOnly={item === "HEURES COMPTEUR"} // Make Heures Compteur read-only
                                    // Removed disabled attribute, use readOnly and styling
                                    placeholder={item !== "HEURES COMPTEUR" ? "0" : ""}
                                    tabIndex={item === "HEURES COMPTEUR" ? -1 : undefined}
                                />
                             </div>
                        ))}
                   </div>
                   <div className="mt-4 text-right font-semibold">
                        Heures de Travail Net (Total Brutes - Total Arrêts): {formatHoursToHoursMinutes(netWorkingHours)}
                   </div>
             </div>


            {/* Section: Heures Brutes par Poste (Replacing Manque Bull) */}
            <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Heures Brutes par Poste (Calculé)</h3>
              <div className="grid grid-cols-3 gap-4">
                {POSTE_ORDER.map((poste, index) => (
                  <div key={poste}>
                    <Label htmlFor={`gross-hours-${poste}`} className="text-muted-foreground text-xs">{`${poste} Poste`}</Label>
                    <Input
                      id={`gross-hours-${poste}`}
                      type="text"
                      value={formData.bulls[index]} // Display formatted gross hours from bulls array
                      readOnly
                      className="h-8 bg-input font-medium border-input focus-visible:ring-0 focus-visible:ring-offset-0 cursor-default" // Style as read-only input
                      tabIndex={-1} // Make it non-focusable
                    />
                  </div>
                ))}
              </div>
            </div>


            {/* Section: Répartition du Temps de Travail Pur */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground">Répartition du Temps de Travail Pur</h3>
                {POSTE_ORDER.map((poste, index) => ( // Ensure index matches the intended poste data
                    <div key={poste} className="p-4 border rounded-lg space-y-3">
                         <h4 className="font-medium text-foreground">{poste} Poste</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor={`chantier-${poste}`}>Chantier</Label>
                                <Input
                                    id={`chantier-${poste}`}
                                    type="text"
                                    value={formData.repartitionTravail[index]?.chantier || ''}
                                    onChange={(e) => handleInputChange(e, 'repartitionTravail', index, 'chantier')}
                                    className="h-8"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`temps-${poste}`}>Temps</Label>
                                <Input
                                    id={`temps-${poste}`}
                                    type="text"
                                    placeholder="ex: 7h 00m"
                                    value={formData.repartitionTravail[index]?.temps || ''}
                                    onChange={(e) => handleInputChange(e, 'repartitionTravail', index, 'temps')}
                                    className="h-8"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`imputation-${poste}`}>Imputation</Label>
                                <Input
                                    id={`imputation-${poste}`}
                                    type="text"
                                    value={formData.repartitionTravail[index]?.imputation || ''}
                                    onChange={(e) => handleInputChange(e, 'repartitionTravail', index, 'imputation')}
                                    className="h-8"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

             {/* Section: Personnel */}
             <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold text-lg text-foreground mb-4">Personnel</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {personnelLabels.map(role => (
                            <div key={role} className="space-y-1">
                                <Label htmlFor={`personnel-${role.toLowerCase()}`}>{role}</Label>
                                <Input
                                    id={`personnel-${role.toLowerCase()}`}
                                    type="text"
                                    className="h-8"
                                    name={role.toLowerCase()} // Set name for direct mapping
                                    value={formData.personnel[role.toLowerCase() as keyof FormData['personnel']]}
                                    onChange={(e) => handleInputChange(e, 'personnel', undefined, role.toLowerCase() as keyof FormData['personnel'])}
                                />
                            </div>
                       ))}
                   </div>
             </div>

            {/* Section: Suivi Consommation */}
            <div className="space-y-6">
               <h3 className="font-semibold text-lg text-foreground">Suivi Consommation</h3>

               {/* Tricone Sub-section */}
               <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-medium text-foreground">Tricone</h4>
                     {/* Machine Info for Tricone */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div>
                            <Label htmlFor="tricone-marque">Marque</Label>
                            <Input id="tricone-marque" name="machineMarque" value={formData.machineMarque} onChange={(e) => handleInputChange(e, 'machineMarque')} className="h-8"/>
                         </div>
                         <div>
                            <Label htmlFor="tricone-serie">N° de Série</Label>
                            <Input id="tricone-serie" name="machineSerie" value={formData.machineSerie} onChange={(e) => handleInputChange(e, 'machineSerie')} className="h-8"/>
                         </div>
                         <div>
                            <Label htmlFor="tricone-type">Type</Label>
                            <Input id="tricone-type" name="machineType" value={formData.machineType} onChange={(e) => handleInputChange(e, 'machineType')} className="h-8"/>
                         </div>
                         <div>
                            <Label htmlFor="tricone-diametre">Diamètre</Label>
                            <Input id="tricone-diametre" name="machineDiametre" value={formData.machineDiametre} onChange={(e) => handleInputChange(e, 'machineDiametre')} className="h-8"/>
                         </div>
                     </div>

                    {/* Pose / Depose */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <Label htmlFor="tricone-pose">Posé (N°)</Label>
                            <Input
                                id="tricone-pose"
                                type="text"
                                name="pose"
                                value={formData.tricone.pose}
                                onChange={(e) => handleInputChange(e, 'tricone', undefined, 'pose')}
                                 className="h-8"
                            />
                        </div>
                        <div>
                            <Label htmlFor="tricone-depose">Déposé (N°)</Label>
                            <Input
                                id="tricone-depose"
                                type="text"
                                name="depose"
                                value={formData.tricone.depose}
                                onChange={(e) => handleInputChange(e, 'tricone', undefined, 'depose')}
                                 className="h-8"
                            />
                        </div>
                         <div>
                            <Label htmlFor="tricone-cause">Cause de Dépose</Label>
                            <Select
                                value={formData.tricone.causeDepose}
                                onValueChange={(value) => handleSelectChange(value, 'tricone', 'causeDepose')}
                                >
                              <SelectTrigger id="tricone-cause" className="w-full h-8">
                                <SelectValue placeholder="Sélectionner Cause" />
                              </SelectTrigger>
                              <SelectContent>
                                {causeDeposeOptions.map((cause, index) => (
                                  <SelectItem key={index} value={cause}>{cause}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="tricone-index-compteur">Index Compteur (Tricone)</Label>
                        <Input
                            id="tricone-index-compteur"
                            type="text" // Use text for flexibility
                            inputMode="decimal"
                            placeholder="Index au moment de la dépose"
                            name="indexCompteur"
                            value={formData.tricone.indexCompteur}
                            onChange={(e) => handleInputChange(e, 'tricone', undefined, 'indexCompteur')}
                            className="h-8"
                         />
                    </div>
               </div>

               {/* Gasoil Sub-section */}
               <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-medium text-foreground">Gasoil</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="gasoil-lieu">Lieu d'Appoint</Label>
                            <Input
                                id="gasoil-lieu"
                                type="text"
                                name="lieuAppoint"
                                value={formData.gasoil.lieuAppoint}
                                onChange={(e) => handleInputChange(e, 'gasoil', undefined, 'lieuAppoint')}
                                 className="h-8"
                            />
                        </div>
                        <div>
                            <Label htmlFor="gasoil-index">Index Compteur (Gasoil)</Label>
                            <Input
                                id="gasoil-index"
                                type="text" // Use text
                                inputMode="decimal"
                                name="indexCompteur"
                                value={formData.gasoil.indexCompteur}
                                 onChange={(e) => handleInputChange(e, 'gasoil', undefined, 'indexCompteur')}
                                  className="h-8"
                            />
                        </div>
                        <div>
                            <Label htmlFor="gasoil-quantite">Quantité Délivrée</Label>
                            <Input
                                id="gasoil-quantite"
                                type="text" // Use text
                                inputMode="decimal"
                                name="quantiteDelivree"
                                value={formData.gasoil.quantiteDelivree}
                                onChange={(e) => handleInputChange(e, 'gasoil', undefined, 'quantiteDelivree')}
                                 placeholder="en Litres" // Added placeholder
                                  className="h-8"
                            />
                        </div>
                    </div>
               </div>
            </div>


            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-3">
                <Button type="button" variant="outline">Enregistrer Brouillon</Button>{/* type="button" to prevent form submission */}
                <Button type="submit" disabled={counterErrors.some(err => err !== '')}>
                    Soumettre Rapport
                </Button>{/* Submit button, disable if errors */}
            </div>
          </CardContent>
      </form>
    </Card>
  );
}
