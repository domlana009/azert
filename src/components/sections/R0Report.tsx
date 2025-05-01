
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

interface R0ReportProps {
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

interface FormData {
  entree: string;
  secteur: string;
  rapportNo: string;
  machineEngins: string;
  sa: string;
  unite: string;
  indexCompteurs: IndexCompteurPoste[]; // Array for debut/fin per poste
  shifts: string[]; // Assuming shifts corresponds to postes 1er, 2eme, 3eme
  ventilation: { code: number; label: string; duree: string }[]; // Updated ventilation structure
  exploitation: Record<string, string>; // Use a record for exploitation data
  bulls: string[]; // Corresponds to 1er, 2eme, 3eme D manque bull - NOW USED FOR DISPLAYING GROSS HOURS
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
 const ventilationData = [
    { code: 121, label: "ARRET CARREAU INDUSTRIEL" },
    { code: 122, label: "COUPURE GENERALE DU COURANT" },
    { code: 123, label: "GREVE" },
    { code: 124, label: "INTEMPERIES" },
    { code: 125, label: "STOCKS PLEINS" },
    { code: 126, label: "J. FERIES OU HEBDOMADAIRES" }, // Corrected FÊRIES to FERIES
    { code: 128, label: "ARRET PAR LA CENTRALE (ENERGIE)" }, // Corrected (E.M.E.) based on latest prompt
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
    { code: 442, label: "RELEVE" },
    { code: 443, label: "EXECUTION PLATE FORME" },
    { code: 444, label: "DEPLACEMENT" },
    { code: 445, label: "TIR ET SAUTAGE" }, // Corrected MISE EN SAUTAGE
    { code: 446, label: "MOUV. DE CABLE" }, // Corrected MOV.
    { code: 448, label: "ARRET DECIDE" },
    { code: 449, label: "MANQUE CONDUCTEUR" },
    { code: 450, label: "BRIQUET" },
    { code: 451, label: "PERTES (INTEMPERIES EXCLUES)" }, // Corrected PISTES
    { code: 452, label: "ARRETS MECA. INSTALLATIONS FIXES" },
    { code: 453, label: "TELESCOPAGE" },
    // Assuming the last two codes were typos and should be distinct
    { code: 454, label: "EXCAVATION PURE" }, // Previously 452
    { code: 455, label: "TERRASSEMENT PUR" }, // Previously 453
 ];

 const exploitationLabels = [
    "HEURES COMPTEUR", // This will be calculated
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
    "T8 TRICONE PERDU", // Corrected TRONCON PERDU
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
     return (hours * 60) + minutes;
   }


   // Match formats like HH H, H H
   match = cleaned.match(/^(\d{1,2})\s?H$/);
    if (match) {
      hours = parseInt(match[1], 10);
      return hours * 60;
    }

  // Match only numbers (assume minutes)
  match = cleaned.match(/^(\d+)\s?M?$/);
  if (match) {
    minutes = parseInt(match[1], 10);
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


export function R0Report({ currentDate }: R0ReportProps) {
   const [selectedPoste, setSelectedPoste] = useState<Poste>("1er"); // Default to 1er Poste
   // State to hold calculated gross hours per poste and total
   const [calculatedHours, setCalculatedHours] = useState<{ poste: number[]; total: number }>({ poste: [0, 0, 0], total: 0 });
   // State to hold total stop duration in minutes
   const [totalStopMinutes, setTotalStopMinutes] = useState(0);
   // State to hold net working hours (total gross hours - total stop hours)
   const [netWorkingHours, setNetWorkingHours] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    entree: "",
    secteur: "",
    rapportNo: "",
    machineEngins: "",
    sa: "",
    unite: "",
    indexCompteurs: Array(3).fill(null).map(() => ({ debut: "", fin: "" })), // Initialize for 3 postes
    shifts: ["", "", ""], // Corresponds to 1er, 2eme, 3eme D/F times
    ventilation: ventilationData.map(item => ({ ...item, duree: "" })), // Initialize duration for ventilation items
    exploitation: exploitationLabels.reduce((acc, label) => ({ ...acc, [label]: "" }), {}), // Initialize exploitation fields
    bulls: ["", "", ""], // Corresponds to 1er, 2eme, 3eme - NOW DISPLAYING GROSS HOURS
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

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      section: keyof FormData | 'ventilation' | 'repartitionTravail' | 'tricone' | 'gasoil' | 'shifts' | 'bulls' | 'indexCompteurs' | 'exploitation' | 'personnel',
      indexOrField?: number | string,
      fieldOrNestedField?: keyof RepartitionItem | keyof FormData['tricone'] | keyof FormData['gasoil'] | keyof IndexCompteurPoste | keyof FormData['personnel'] // Added personnel keys
    ) => {
      const { name, value } = e.target;
       // Use name attribute for top-level fields if available and section matches a key in FormData
      const targetName = (name && section in formData && typeof (formData as any)[section] === 'string') ? name : section;

      setFormData(prevData => {
          let newData = { ...prevData };

          if (section === 'ventilation' && typeof indexOrField === 'number') {
              const newVentilation = [...newData.ventilation];
              if (newVentilation[indexOrField]) {
                 newVentilation[indexOrField] = { ...newVentilation[indexOrField], duree: value };
                 newData.ventilation = newVentilation;
              }
          } else if (section === 'repartitionTravail' && typeof indexOrField === 'number' && fieldOrNestedField && fieldOrNestedField in newData.repartitionTravail[0]) {
              if (newData.repartitionTravail && newData.repartitionTravail[indexOrField]) {
                  const newRepartition = [...newData.repartitionTravail];
                  newRepartition[indexOrField] = { ...newRepartition[indexOrField], [fieldOrNestedField]: value };
                  newData.repartitionTravail = newRepartition;
              }
          } else if (section === 'indexCompteurs' && typeof indexOrField === 'number' && fieldOrNestedField && fieldOrNestedField in newData.indexCompteurs[0]) {
             if (newData.indexCompteurs && newData.indexCompteurs[indexOrField]) {
                const newIndexCompteurs = [...newData.indexCompteurs];
                newIndexCompteurs[indexOrField] = { ...newIndexCompteurs[indexOrField], [fieldOrNestedField as keyof IndexCompteurPoste]: value };
                newData.indexCompteurs = newIndexCompteurs;
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
          // NOTE: Removed bulls section handler as it's now display-only
          // else if (section === 'bulls' && typeof indexOrField === 'number') {
          //      const newBulls = [...newData.bulls];
          //     newBulls[indexOrField] = value;
          //     newData.bulls = newBulls;
          // }
          // Handle exploitation fields
          else if (section === 'exploitation' && typeof indexOrField === 'string' && indexOrField in newData.exploitation) {
              newData.exploitation = { ...newData.exploitation, [indexOrField]: value };
          }
           // Handle personnel fields
          else if (section === 'personnel' && fieldOrNestedField && typeof fieldOrNestedField === 'string' && fieldOrNestedField in newData.personnel) {
             newData.personnel = { ...newData.personnel, [fieldOrNestedField as keyof typeof newData.personnel]: value };
          }
          // Handle top-level string fields directly
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
      section: keyof FormData | 'tricone', // Specify sections where select is used
      field: keyof FormData['tricone'] | keyof FormData['gasoil'] // Allow gasoil fields too
      // Add other fields if needed
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

    // Function to calculate working hours from index compteurs
    const calculateCompteurHours = () => {
        const posteHours = formData.indexCompteurs.map(compteur => {
            const debut = parseFloat(compteur.debut);
            const fin = parseFloat(compteur.fin);
            if (!isNaN(debut) && !isNaN(fin) && fin >= debut) {
                return fin - debut;
            }
            return 0;
        });
        const totalHours = posteHours.reduce((sum, hours) => sum + hours, 0);
        setCalculatedHours({ poste: posteHours, total: totalHours });

        // Update the 'bulls' array in formData with formatted gross hours for display
        const formattedGrossHours = posteHours.map(hours => formatHoursToHoursMinutes(hours));
        setFormData(prevData => ({
            ...prevData,
            bulls: formattedGrossHours // Use bulls to display formatted gross hours
        }));
    };

    // Function to calculate total stop duration
    const calculateTotalStops = () => {
        const totalMinutes = formData.ventilation.reduce((acc, item) => {
            return acc + parseDurationToMinutes(item.duree);
        }, 0);
        setTotalStopMinutes(totalMinutes);
    };

     // Calculate Net Working Hours
    const calculateNetWorkingHours = () => {
        const totalGrossHours = calculatedHours.total; // From index compteurs
        const totalStopHours = totalStopMinutes / 60;
        const netHours = totalGrossHours - totalStopHours;
        setNetWorkingHours(netHours >= 0 ? netHours : 0); // Ensure non-negative
    };


    // Recalculate on index compteur change
    useEffect(() => {
        calculateCompteurHours();
    }, [formData.indexCompteurs]);

     // Recalculate on ventilation duration change
    useEffect(() => {
        calculateTotalStops();
    }, [formData.ventilation]);

    // Recalculate net hours when gross hours or stop hours change
    useEffect(() => {
        calculateNetWorkingHours();
         // Update the HEURES COMPTEUR field in exploitation data
        setFormData(prevData => ({
            ...prevData,
            exploitation: {
                ...prevData.exploitation,
                "HEURES COMPTEUR": formatHoursToHoursMinutes(netWorkingHours) // Format the net hours
            }
        }));
    }, [calculatedHours.total, totalStopMinutes]); // Removed netWorkingHours dependency to prevent loop


  return (
    <Card className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-xl font-bold">
          Rapport Journalier Détaillé (R0)
        </CardTitle>
        <span className="text-sm text-muted-foreground">{currentDate}</span>
      </CardHeader>

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
                                type="number"
                                step="0.01"
                                value={formData.indexCompteurs[index]?.debut || ''}
                                onChange={(e) => handleInputChange(e, "indexCompteurs", index, 'debut')}
                                placeholder="Index début"
                                className="h-8"
                            />
                         </div>
                         <div>
                             <Label htmlFor={`index-fin-${poste}`} className="text-xs text-muted-foreground">Fin</Label>
                            <Input
                                id={`index-fin-${poste}`}
                                type="number"
                                step="0.01"
                                value={formData.indexCompteurs[index]?.fin || ''}
                                onChange={(e) => handleInputChange(e, "indexCompteurs", index, 'fin')}
                                placeholder="Index fin"
                                className="h-8"
                            />
                         </div>
                          <div className="text-xs text-muted-foreground pt-1">
                             Heures Brutes: {formatHoursToHoursMinutes(calculatedHours.poste[index])}
                         </div>
                    </div>
                ))}
                <div className="col-span-3 mt-2 text-right font-semibold">
                    Total Heures Brutes (24h): {formatHoursToHoursMinutes(calculatedHours.total)}
                 </div>
           </div>
        </div>

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
                      <TableHead>Nature de l'Arrêt (Extérieurs, Matériel, Exploitation)</TableHead>
                      {/* Add columns for 1er, 2eme, 3eme shifts if needed */}
                      <TableHead className="text-right w-[150px]">Durée Totale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.ventilation.map((item, index) => (
                      <TableRow key={item.code} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{item.label}</TableCell>
                        {/* Add cells for shift-specific durations if needed */}
                        <TableCell className="text-right">
                          <Input
                            type="text"
                            className="h-8 text-sm text-right w-full"
                            placeholder="ex: 1h 30m"
                            value={item.duree}
                            onChange={(e) => handleInputChange(e, "ventilation", index)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Add Total Row */}
                     <TableRow className="bg-muted/80 font-semibold">
                         <TableCell colSpan={2}>TOTAL Arrêts</TableCell>
                         <TableCell className="text-right">
                             <Input
                                type="text"
                                className="h-8 text-sm text-right w-full bg-transparent font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                readOnly
                                value={formatMinutesToHoursMinutes(totalStopMinutes)}
                              />
                         </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
            </div>
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
                                type="text"
                                className={`h-8 ${item === "HEURES COMPTEUR" ? 'bg-muted font-medium' : ''}`}
                                value={formData.exploitation[item]}
                                onChange={(e) => handleInputChange(e, 'exploitation', item)}
                                readOnly={item === "HEURES COMPTEUR"} // Make Heures Compteur read-only
                                disabled={item === "HEURES COMPTEUR"} // Visually indicate it's disabled
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
                  className="h-8 bg-muted font-medium" // Style as read-only
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
                        type="text"
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
                            type="text"
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
                            type="text"
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
            <Button variant="outline">Enregistrer Brouillon</Button>
            <Button>Soumettre Rapport</Button>
        </div>
      </CardContent>
    </Card>
  );
}

