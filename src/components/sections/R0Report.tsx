"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";


interface R0ReportProps {
  selectedDate: Date;
  previousDayThirdShiftEnd?: string | null;
}

type Poste = "1er" | "2ème" | "3ème";
const MAX_HOURS_PER_POSTE = 8;

const POSTE_TIMES: Record<Poste, string> = {
  "1er": "06:30 - 14:30",
  "2ème": "14:30 - 22:30",
  "3ème": "22:30 - 06:30",
};
const POSTE_ORDER: Poste[] = ["1er", "2ème", "3ème"];

interface RepartitionItem {
  chantier: string;
  temps: string;
  imputation: string;
}

interface IndexCompteurPoste {
    debut: string;
    fin: string;
}

interface VentilationItem {
  code: number;
  label: string;
  duree: string;
  note: string;
}

interface FormData {
  entree: string;
  secteur: string;
  rapportNo: string;
  machineEngins: string;
  sa: string;
  unite: string;
  indexCompteurs: IndexCompteurPoste[];
  shifts: string[];
  ventilation: VentilationItem[];
  arretsExplication: string;
  exploitation: Record<string, string>;
  bulls: string[];
  repartitionTravail: RepartitionItem[];
  tricone: {
    pose: string;
    depose: string;
    causeDepose: string;
    indexCompteur: string;
  };
  gasoil: {
    lieuAppoint: string;
    indexCompteur: string;
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

 const ventilationBaseData = [
    { code: 121, label: "ARRET CARREAU INDUSTRIEL" },
    { code: 122, label: "COUPURE GENERALE DU COURANT" },
    { code: 123, label: "GREVE" },
    { code: 124, label: "INTEMPERIES" },
    { code: 125, label: "STOCKS PLEINS" },
    { code: 126, label: "J. FERIES OU HEBDOMADAIRES" },
    { code: 127, label: "ARRET PAR LA CENTRALE (ENERGIE)" }, // Changed from 128 based on last prompt
    { code: 230, label: "CONTROLE" },
    { code: 231, label: "DEFAUT ELEC. (C. CRAME, RESEAU)" },
    { code: 232, label: "PANNE MECANIQUE" },
    { code: 233, label: "PANNE ELECTRIQUE" }, // Changed from PANNE ATELIER
    { code: 234, label: "INTERVENTION ATELIER PNEUMATIQUE" },
    { code: 235, label: "ENTRETIEN SYSTEMATIQUE" },
    { code: 236, label: "APPOINT (HUILE, GAZOL, EAU)" },
    { code: 237, label: "GRAISSAGE" },
    { code: 238, label: "ARRET ELEC. INSTALLATION FIXES" },
    { code: 239, label: "MANQUE CAMIONS" },
    { code: 240, label: "MANQUE BULL" },
    { code: 241, label: "MANQUE MECANICIEN" },
    { code: 242, label: "MANQUE OUTILS DE TRAVAIL" },
    { code: 243, label: "MACHINE A L'ARRET" },
    { code: 244, label: "PANNE ENGIN DEVANT MACHINE" },
    { code: 441, label: "RELEVE" }, // Changed from 442
    { code: 442, label: "EXECUTION PLATE FORME" }, // Changed from 443
    { code: 443, label: "DEPLACEMENT" }, // Changed from 444
    { code: 444, label: "TIR ET SAUTAGE" }, // Changed from 445
    { code: 445, label: "MOUV. DE CABLE" }, // Changed from 446
    { code: 446, label: "ARRET DECIDE" }, // Changed from 448
    { code: 447, label: "MANQUE CONDUCTEUR" }, // Changed from 449
    { code: 448, label: "BRIQUET" }, // Changed from 450
    { code: 449, label: "PERTES (INTEMPERIES EXCLUES)" }, // Changed from 451
    { code: 450, label: "ARRETS MECA. INSTALLATIONS FIXES" }, // Changed from 452
    { code: 451, label: "TELESCOPAGE" }, // Changed from 453
    { code: 452, label: "EXCAVATION PURE" },
    { code: 453, label: "TERRASSEMENT PUR" },
 ];

 const initialVentilationData: VentilationItem[] = ventilationBaseData.map(item => ({
    ...item,
    duree: "",
    note: "",
 }));


 const exploitationLabels = [
    "HEURES COMPTEUR",
    "METRAGE FORE",
    "NOMBRE DE TROUS FORES",
    "NOMBRE DE VOYAGES",
    "NOMBRE D'ECAPAGES",
    "TONNAGE",
    "NOMBRE T.K.J",
 ];

 const personnelLabels = ["CONDUCTEUR", "GRAISSEUR", "MATRICULES"];

 const causeDeposeOptions = [
    "T1 CORPS USE",
    "T2 MOLLETTES USEES",
    "T3 MOLLETTES PERDUES",
    "T4 ROULEMENT CASSE",
    "T5 CORPS FISSURE",
    "T6 ROULEMENT COINCE",
    "T7 FILAGE ABIME",
    "T8 TRICONE PERDU",
 ];

function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0;
  const cleaned = duration.replace(/[^0-9Hh:·Mm\s]/g, '').trim().toUpperCase();
  let hours = 0;
  let minutes = 0;
  let match = cleaned.match(/^(?:(\d{1,2})\s?[H:·]\s?)?(\d{1,2})\s?M?$/);
   if (match) {
     hours = match[1] ? parseInt(match[1], 10) : 0;
     minutes = parseInt(match[2], 10);
     if (isNaN(hours) || isNaN(minutes)) return 0;
     return (hours * 60) + minutes;
   }
   match = cleaned.match(/^(\d{1,2})\s?H$/);
    if (match) {
      hours = parseInt(match[1], 10);
      if (isNaN(hours)) return 0;
      return hours * 60;
    }
  match = cleaned.match(/^(\d+)\s?M?$/);
  if (match) {
    minutes = parseInt(match[1], 10);
    if (isNaN(minutes)) return 0;
    return minutes;
  }
  console.warn(`Could not parse duration: "${duration}"`);
  return 0;
}

function formatMinutesToHoursMinutes(totalMinutes: number): string {
    if (isNaN(totalMinutes) || totalMinutes <= 0) return "0h 0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
}

function formatHoursToHoursMinutes(totalHours: number): string {
    if (isNaN(totalHours) || totalHours <= 0) return "0h 0m";
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours}h ${minutes}m`;
}

function validateAndParseCounterValue(value: string): number | null {
    if (!value) return 0;
    const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    if (cleaned === '' || cleaned === '.' || cleaned === ',') return null;
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
}

export function R0Report({ selectedDate, previousDayThirdShiftEnd = null }: R0ReportProps) {
   const { toast } = useToast();
   const [selectedPoste, setSelectedPoste] = useState<Poste>("1er");
   const [calculatedHours, setCalculatedHours] = useState<{ poste: number[]; total: number }>({ poste: [0, 0, 0], total: 0 });
   const [totalStopMinutes, setTotalStopMinutes] = useState(0);
   const [netWorkingHours, setNetWorkingHours] = useState(0);
   const [counterErrors, setCounterErrors] = useState<string[]>(['', '', '']);

  const [formData, setFormData] = useState<FormData>({
    entree: "",
    secteur: "",
    rapportNo: "",
    machineEngins: "",
    sa: "",
    unite: "",
    indexCompteurs: Array(3).fill(null).map(() => ({ debut: "", fin: "" })),
    shifts: ["", "", ""],
    ventilation: initialVentilationData,
    arretsExplication: "",
    exploitation: exploitationLabels.reduce((acc, label) => ({ ...acc, [label]: "" }), {}),
    bulls: ["", "", ""],
    repartitionTravail: Array(3).fill(null).map(() => ({ chantier: "", temps: "", imputation: "" })),
    tricone: {
      pose: "",
      depose: "",
      causeDepose: "",
      indexCompteur: "",
    },
    gasoil: {
      lieuAppoint: "",
      indexCompteur: "",
      quantiteDelivree: "",
    },
    personnel: {
        conducteur: "",
        graisseur: "",
        matricules: "",
    },
    machineMarque: "",
    machineSerie: "",
    machineType: "",
    machineDiametre: "",
  });

    const formattedDate = selectedDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });


  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      section: keyof FormData | 'ventilation' | 'repartitionTravail' | 'tricone' | 'gasoil' | 'shifts' | 'bulls' | 'indexCompteurs' | 'exploitation' | 'personnel',
      indexOrField?: number | string,
      fieldOrNestedField?: keyof RepartitionItem | keyof FormData['tricone'] | keyof FormData['gasoil'] | keyof IndexCompteurPoste | keyof FormData['personnel'] | 'duree' | 'note'
    ) => {
      const { name, value } = e.target;
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
          else if (section === 'exploitation' && typeof indexOrField === 'string' && indexOrField in newData.exploitation) {
              newData.exploitation = { ...newData.exploitation, [indexOrField]: value };
          }
          else if (section === 'personnel' && fieldOrNestedField && typeof fieldOrNestedField === 'string' && fieldOrNestedField in newData.personnel) {
             newData.personnel = { ...newData.personnel, [fieldOrNestedField as keyof typeof newData.personnel]: value };
          }
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
      section: keyof FormData | 'tricone' | 'gasoil',
      field: keyof FormData['tricone'] | keyof FormData['gasoil']
    ) => {
     setFormData(prevData => {
        let newData = { ...prevData };
        if (section === 'tricone' && field && typeof field === 'string' && field in newData.tricone) {
            newData.tricone = { ...newData.tricone, [field as keyof typeof newData.tricone]: value };
        } else if (section === 'gasoil' && field && typeof field === 'string' && field in newData.gasoil) {
             newData.gasoil = { ...newData.gasoil, [field as keyof typeof newData.gasoil]: value };
        }
        return newData;
     });
    };

     const validateAndCalculateCompteurHours = () => {
        let validationPassed = true;
        const newErrors = ['', '', ''];
        const previousDayFin3Parsed = validateAndParseCounterValue(previousDayThirdShiftEnd || '');

        const posteHours = formData.indexCompteurs.map((compteur, index) => {
            const posteName = POSTE_ORDER[index];
            const debutStr = compteur.debut;
            const finStr = compteur.fin;
            const debut = validateAndParseCounterValue(debutStr);
            const fin = validateAndParseCounterValue(finStr);

            if ((debutStr === '' && finStr === '') || debut === null || fin === null) {
                 if (debutStr === '' && finStr === '') {
                     newErrors[index] = '';
                 } else if (debut === null && debutStr !== '') {
                      newErrors[index] = "Début invalide.";
                      validationPassed = false;
                 } else if (fin === null && finStr !== '') {
                     newErrors[index] = "Fin invalide.";
                      validationPassed = false;
                 }
                 return 0;
             }

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

            if (index === 0) { // 1er Poste
                 if (previousDayFin3Parsed !== null) {
                    if (debut !== previousDayFin3Parsed) {
                       newErrors[index] = `Début (${debut}) doit correspondre à Fin (${previousDayFin3Parsed}) du 3ème Poste de la veille.`;
                       validationPassed = false;
                       return 0;
                    }
                 } else if (previousDayThirdShiftEnd !== undefined && previousDayThirdShiftEnd !== null && previousDayThirdShiftEnd !== '') {
                      // Previous day had data but it was invalid
                      newErrors[index] = "Fin du 3ème Poste de la veille invalide pour validation.";
                      validationPassed = false;
                      return 0;
                 }
            }
            else if (index === 1) { // 2eme Poste
                const prevFinStr = formData.indexCompteurs[0]?.fin;
                const prevFin = validateAndParseCounterValue(prevFinStr || '');
                if (prevFin !== null) {
                    if (debut !== prevFin) {
                        newErrors[index] = `Début (${debut}) doit correspondre à Fin (${prevFin}) du ${POSTE_ORDER[0]} Poste.`;
                        validationPassed = false;
                        return 0;
                    }
                } else if (formData.indexCompteurs[0]?.debut !== '' && prevFinStr !== '') {
                     newErrors[index] = `Fin invalide ou manquante pour ${POSTE_ORDER[0]} Poste pour validation.`;
                     validationPassed = false;
                     return 0;
                 }
            }
            else if (index === 2) { // 3eme Poste
                const prevFinStr = formData.indexCompteurs[1]?.fin;
                const prevFin = validateAndParseCounterValue(prevFinStr || '');
                 if (prevFin !== null) {
                    if (debut !== prevFin) {
                        newErrors[index] = `Début (${debut}) doit correspondre à Fin (${prevFin}) du ${POSTE_ORDER[1]} Poste.`;
                        validationPassed = false;
                        return 0;
                    }
                 } else if (formData.indexCompteurs[1]?.debut !== '' && prevFinStr !== '') {
                     newErrors[index] = `Fin invalide ou manquante pour ${POSTE_ORDER[1]} Poste pour validation.`;
                     validationPassed = false;
                     return 0;
                 }
            }

            newErrors[index] = '';
            return duration;
        });

        setCounterErrors(newErrors);

        if (validationPassed) {
            const totalHours = posteHours.reduce((sum, hours) => sum + hours, 0);
            setCalculatedHours({ poste: posteHours, total: totalHours });
            const formattedGrossHours = posteHours.map(hours => formatHoursToHoursMinutes(hours));
            setFormData(prevData => ({
                ...prevData,
                bulls: formattedGrossHours
            }));
        } else {
             setCalculatedHours({ poste: [0, 0, 0], total: 0 });
              setFormData(prevData => ({
                ...prevData,
                bulls: ["", "", ""],
                exploitation: {
                   ...prevData.exploitation,
                   "HEURES COMPTEUR": "Erreur Compteur"
                }
            }));
        }
        return validationPassed;
    };

    const calculateTotalStops = () => {
        const totalMinutes = formData.ventilation.reduce((acc, item) => {
             const minutes = parseDurationToMinutes(item.duree);
             if (isNaN(minutes)) {
                 console.warn(`Invalid duration format for ventilation code ${item.code}: "${item.duree}"`);
                 return acc;
             }
             return acc + minutes;
        }, 0);
        setTotalStopMinutes(totalMinutes);
    };

    const calculateNetWorkingHours = () => {
        if (counterErrors.some(err => err !== '')) {
             setNetWorkingHours(0);
             return;
        }
        const totalGrossHours = calculatedHours.total;
        const totalStopHours = totalStopMinutes / 60;
        const netHours = totalGrossHours - totalStopHours;
        setNetWorkingHours(netHours >= 0 ? netHours : 0);
    };

    useEffect(() => {
        validateAndCalculateCompteurHours();
    }, [formData.indexCompteurs, previousDayThirdShiftEnd]);

    useEffect(() => {
        calculateTotalStops();
    }, [formData.ventilation]);

    useEffect(() => {
        calculateNetWorkingHours();
        const formattedNetHours = counterErrors.some(err => err !== '') ? "Erreur Compteur" : formatHoursToHoursMinutes(netWorkingHours);
        setFormData(prevData => ({
            ...prevData,
            exploitation: {
                ...prevData.exploitation,
                "HEURES COMPTEUR": formattedNetHours
            }
        }));
    }, [calculatedHours.total, totalStopMinutes, counterErrors, netWorkingHours]); // Added netWorkingHours


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isCompteurValid = validateAndCalculateCompteurHours();

        if (!isCompteurValid) {
            console.error("Validation failed: Invalid counter inputs.");
            toast({ title: "Erreur de Validation", description: "Veuillez corriger les erreurs dans les compteurs.", variant: "destructive" });
            const firstErrorIndex = counterErrors.findIndex(err => err !== '');
            if (firstErrorIndex !== -1) {
                const firstErrorInputId = `index-debut-${POSTE_ORDER[firstErrorIndex]}`;
                const firstErrorInput = document.getElementById(firstErrorInputId);
                firstErrorInput?.focus();
            }
            return;
        }

        console.log("Form submitted:", formData);
        toast({ title: "Succès", description: "Rapport R0 soumis avec succès." });
    };


  return (
    <Card className="bg-card text-card-foreground rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-lg sm:text-xl font-bold">
          Rapport Journalier Détaillé (R0)
        </CardTitle>
        <span className="text-xs sm:text-sm text-muted-foreground">{formattedDate}</span>
      </CardHeader>

      <form onSubmit={handleSubmit}>
          <CardContent className="p-0 space-y-6">
             {/* Section: Entête Info */}
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 border-b pb-4">
                  <div>
                    <Label htmlFor="entree" className="text-xs sm:text-sm">Entrée</Label>
                    <Input id="entree" name="entree" placeholder="ENTREE" value={formData.entree} onChange={(e) => handleInputChange(e, 'entree')} className="h-8 text-sm"/>
                  </div>
                  <div>
                    <Label htmlFor="secteur" className="text-xs sm:text-sm">Secteur</Label>
                    <Input id="secteur" name="secteur" placeholder="SECTEUR" value={formData.secteur} onChange={(e) => handleInputChange(e, 'secteur')} className="h-8 text-sm"/>
                  </div>
                   <div>
                    <Label htmlFor="rapport-no" className="text-xs sm:text-sm">Rapport (R°)</Label>
                    <Input id="rapport-no" name="rapportNo" placeholder="N°" value={formData.rapportNo} onChange={(e) => handleInputChange(e, 'rapportNo')} className="h-8 text-sm"/>
                  </div>
                  <div>
                    <Label htmlFor="machine-engins" className="text-xs sm:text-sm">Machine / Engins</Label>
                    <Input id="machine-engins" name="machineEngins" placeholder="Nom ou Code" value={formData.machineEngins} onChange={(e) => handleInputChange(e, 'machineEngins')} className="h-8 text-sm"/>
                  </div>
                   <div>
                    <Label htmlFor="sa" className="text-xs sm:text-sm">S.A</Label>
                    <Input id="sa" name="sa" placeholder="S.A" value={formData.sa} onChange={(e) => handleInputChange(e, 'sa')} className="h-8 text-sm"/>
                  </div>
                </div>


            {/* Section: Unite & Index Compteur per Poste */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <Label htmlFor="unite" className="text-xs sm:text-sm">Unité</Label>
                <Input
                  id="unite"
                  name="unite"
                  value={formData.unite}
                  onChange={(e) => handleInputChange(e, "unite")}
                  className="h-8 text-sm"
                  placeholder="ex: H ou M3"
                />
              </div>
               <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 border p-4 rounded-md bg-muted/30">
                    {POSTE_ORDER.map((poste, index) => (
                        <div key={`index-${poste}`} className="space-y-2">
                             <Label className="font-medium text-xs sm:text-sm">{poste} Poste</Label>
                             <div>
                                <Label htmlFor={`index-debut-${poste}`} className="text-xs text-muted-foreground">Début</Label>
                                <Input
                                    id={`index-debut-${poste}`}
                                    type="text"
                                    inputMode="decimal"
                                    value={formData.indexCompteurs[index]?.debut || ''}
                                    onChange={(e) => handleInputChange(e, "indexCompteurs", index, 'debut')}
                                    placeholder="Index début"
                                    className={`h-8 text-xs sm:text-sm ${counterErrors[index] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    aria-invalid={!!counterErrors[index]}
                                    aria-describedby={counterErrors[index] ? `error-compteur-${poste}` : undefined}
                                />
                             </div>
                             <div>
                                 <Label htmlFor={`index-fin-${poste}`} className="text-xs text-muted-foreground">Fin</Label>
                                <Input
                                    id={`index-fin-${poste}`}
                                    type="text"
                                    inputMode="decimal"
                                    value={formData.indexCompteurs[index]?.fin || ''}
                                    onChange={(e) => handleInputChange(e, "indexCompteurs", index, 'fin')}
                                    placeholder="Index fin"
                                    className={`h-8 text-xs sm:text-sm ${counterErrors[index] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                     aria-invalid={!!counterErrors[index]}
                                     aria-describedby={counterErrors[index] ? `error-compteur-${poste}` : undefined}
                                />
                             </div>
                              <div className="text-xs text-muted-foreground pt-1">
                                 Heures Brutes: {formatHoursToHoursMinutes(calculatedHours.poste[index])}
                             </div>
                             {counterErrors[index] && (
                                <p id={`error-compteur-${poste}`} className="text-xs text-destructive pt-1">{counterErrors[index]}</p>
                             )}
                        </div>
                    ))}
                    <div className="col-span-1 sm:col-span-3 mt-2 text-right font-semibold text-xs sm:text-sm">
                        Total Heures Brutes (24h): {formatHoursToHoursMinutes(calculatedHours.total)}
                     </div>
                     {previousDayThirdShiftEnd === undefined && (
                         <p className="col-span-1 sm:col-span-3 text-xs text-muted-foreground mt-1">
                            Info: Données du 3ème poste de la veille non disponibles pour validation du début 1er poste.
                         </p>
                     )}
                      {previousDayThirdShiftEnd === null && (
                         <p className="col-span-1 sm:col-span-3 text-xs text-muted-foreground mt-1">
                             Info: Pas de fin enregistrée pour le 3ème poste de la veille.
                         </p>
                     )}
               </div>
            </div>

              {counterErrors.some(err => err !== '') && (
                  <Alert variant="destructive" className="mt-4">
                       <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs sm:text-sm">
                          Erreur dans les index compteurs. Vérifiez les valeurs et la continuité entre les postes (Fin précédent = Début suivant).
                      </AlertDescription>
                  </Alert>
              )}

            {/* Section: Poste Selection & Shifts */}
            <div className="space-y-2">
               <Label className="text-foreground text-xs sm:text-sm">Poste Actuel</Label>
                <RadioGroup
                  value={selectedPoste}
                  onValueChange={(value: Poste) => setSelectedPoste(value)}
                  className="flex flex-wrap space-x-4 pt-2"
                >
                  {POSTE_ORDER.map((poste) => (
                    <div key={poste} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={poste} id={`r0-poste-${poste}`} />
                      <Label htmlFor={`r0-poste-${poste}`} className="font-normal text-foreground text-xs sm:text-sm">
                        {poste} Poste <span className="text-muted-foreground text-xs">({POSTE_TIMES[poste]})</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

               <div className="grid grid-cols-3 gap-4 pt-2">
                    {POSTE_ORDER.map((poste, index) => (
                      <div key={poste}>
                        <Label htmlFor={`shift-${poste}`} className="text-muted-foreground text-xs">{`${poste} D/F`}</Label>
                         <Input
                          id={`shift-${poste}`}
                          type="text"
                          value={formData.shifts[index]}
                          onChange={(e) => handleInputChange(e, "shifts", index)}
                          placeholder={POSTE_TIMES[poste]}
                          className="h-8 text-xs sm:text-sm"
                        />
                      </div>
                    ))}
                </div>
            </div>

            {/* Section: Ventilation */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg text-foreground">Ventilation des Arrêts</h3>
               <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[60px] sm:w-[80px] text-xs sm:text-sm">Code</TableHead>
                          <TableHead className="min-w-[150px] text-xs sm:text-sm">Nature de l'Arrêt</TableHead>
                          <TableHead className="min-w-[120px] sm:w-[150px] text-xs sm:text-sm">Note</TableHead>
                          <TableHead className="text-right min-w-[100px] sm:w-[150px] text-xs sm:text-sm">Durée Totale</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.ventilation.map((item, index) => (
                          <TableRow key={item.code} className="hover:bg-muted/50">
                            <TableCell className="font-medium text-xs sm:text-sm p-1 sm:p-4">{item.code}</TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-4">{item.label}</TableCell>
                            <TableCell className="p-1 sm:p-4">
                              <Input
                                type="text"
                                className="h-8 text-xs sm:text-sm w-full"
                                placeholder="Ajouter une note..."
                                value={item.note}
                                onChange={(e) => handleInputChange(e, "ventilation", index, 'note')}
                              />
                            </TableCell>
                            <TableCell className="text-right p-1 sm:p-4">
                              <Input
                                type="text"
                                className="h-8 text-xs sm:text-sm text-right w-full"
                                placeholder="ex: 1h 30m"
                                value={item.duree}
                                onChange={(e) => handleInputChange(e, "ventilation", index, 'duree')}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                         <TableRow className="bg-muted/80 font-semibold">
                             <TableCell colSpan={3} className="text-xs sm:text-sm p-2 sm:p-4">TOTAL Arrêts</TableCell>
                             <TableCell className="text-right p-1 sm:p-4">
                                 <Input
                                    type="text"
                                    className="h-8 text-xs sm:text-sm text-right w-full bg-transparent font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
                 <Label htmlFor="arrets-explication" className="font-semibold text-base sm:text-lg text-foreground">Explication des Arrêts</Label>
                 <Textarea
                    id="arrets-explication"
                    name="arretsExplication"
                    placeholder="Expliquez ici les arrêts enregistrés ci-dessus..."
                    value={formData.arretsExplication}
                    onChange={(e) => handleInputChange(e, "arretsExplication")}
                    className="min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
                 />
            </div>


             {/* Section: Exploitation Metrics */}
             <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground mb-4">Données d'Exploitation</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {exploitationLabels.map((item) => (
                             <div key={item} className="space-y-1">
                                <Label htmlFor={`expl-${item.toLowerCase().replace(/\s/g, '-')}`} className="text-xs sm:text-sm text-muted-foreground">
                                    {item}
                                </Label>
                                <Input
                                    id={`expl-${item.toLowerCase().replace(/\s/g, '-')}`}
                                    type={item === "HEURES COMPTEUR" ? "text" : "number"}
                                    step={item !== "HEURES COMPTEUR" ? "0.01" : undefined}
                                    className={`h-8 text-xs sm:text-sm ${item === "HEURES COMPTEUR" ? 'bg-input font-medium border-input focus-visible:ring-0 focus-visible:ring-offset-0 cursor-default' : ''}`}
                                    value={formData.exploitation[item]}
                                    onChange={(e) => handleInputChange(e, 'exploitation', item)}
                                    readOnly={item === "HEURES COMPTEUR"}
                                    placeholder={item !== "HEURES COMPTEUR" ? "0" : ""}
                                    tabIndex={item === "HEURES COMPTEUR" ? -1 : undefined}
                                />
                             </div>
                        ))}
                   </div>
                   <div className="mt-4 text-right font-semibold text-xs sm:text-sm">
                        Heures de Travail Net (Total Brutes - Total Arrêts): {formatHoursToHoursMinutes(netWorkingHours)}
                   </div>
             </div>


            {/* Section: Heures Brutes par Poste */}
            <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium text-foreground text-base sm:text-lg mb-2">Heures Brutes par Poste (Calculé)</h3>
              <div className="grid grid-cols-3 gap-4">
                {POSTE_ORDER.map((poste, index) => (
                  <div key={poste}>
                    <Label htmlFor={`gross-hours-${poste}`} className="text-muted-foreground text-xs">{`${poste} Poste`}</Label>
                    <Input
                      id={`gross-hours-${poste}`}
                      type="text"
                      value={formData.bulls[index]}
                      readOnly
                      className="h-8 text-xs sm:text-sm bg-input font-medium border-input focus-visible:ring-0 focus-visible:ring-offset-0 cursor-default"
                      tabIndex={-1}
                    />
                  </div>
                ))}
              </div>
            </div>


            {/* Section: Répartition du Temps de Travail Pur */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg text-foreground">Répartition du Temps de Travail Pur</h3>
                {POSTE_ORDER.map((poste, index) => (
                    <div key={poste} className="p-4 border rounded-lg space-y-3">
                         <h4 className="font-medium text-foreground text-sm sm:text-base">{poste} Poste</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor={`chantier-${poste}`} className="text-xs sm:text-sm">Chantier</Label>
                                <Input
                                    id={`chantier-${poste}`}
                                    type="text"
                                    value={formData.repartitionTravail[index]?.chantier || ''}
                                    onChange={(e) => handleInputChange(e, 'repartitionTravail', index, 'chantier')}
                                    className="h-8 text-xs sm:text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`temps-${poste}`} className="text-xs sm:text-sm">Temps</Label>
                                <Input
                                    id={`temps-${poste}`}
                                    type="text"
                                    placeholder="ex: 7h 00m"
                                    value={formData.repartitionTravail[index]?.temps || ''}
                                    onChange={(e) => handleInputChange(e, 'repartitionTravail', index, 'temps')}
                                    className="h-8 text-xs sm:text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`imputation-${poste}`} className="text-xs sm:text-sm">Imputation</Label>
                                <Input
                                    id={`imputation-${poste}`}
                                    type="text"
                                    value={formData.repartitionTravail[index]?.imputation || ''}
                                    onChange={(e) => handleInputChange(e, 'repartitionTravail', index, 'imputation')}
                                    className="h-8 text-xs sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

             {/* Section: Personnel */}
             <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground mb-4">Personnel</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {personnelLabels.map(role => (
                            <div key={role} className="space-y-1">
                                <Label htmlFor={`personnel-${role.toLowerCase()}`} className="text-xs sm:text-sm">{role}</Label>
                                <Input
                                    id={`personnel-${role.toLowerCase()}`}
                                    type="text"
                                    className="h-8 text-xs sm:text-sm"
                                    name={role.toLowerCase()}
                                    value={formData.personnel[role.toLowerCase() as keyof FormData['personnel']]}
                                    onChange={(e) => handleInputChange(e, 'personnel', undefined, role.toLowerCase() as keyof FormData['personnel'])}
                                />
                            </div>
                       ))}
                   </div>
             </div>

            {/* Section: Suivi Consommation */}
            <div className="space-y-6">
               <h3 className="font-semibold text-base sm:text-lg text-foreground">Suivi Consommation</h3>

               <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-medium text-foreground text-sm sm:text-base">Tricone</h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div>
                            <Label htmlFor="tricone-marque" className="text-xs sm:text-sm">Marque</Label>
                            <Input id="tricone-marque" name="machineMarque" value={formData.machineMarque} onChange={(e) => handleInputChange(e, 'machineMarque')} className="h-8 text-xs sm:text-sm"/>
                         </div>
                         <div>
                            <Label htmlFor="tricone-serie" className="text-xs sm:text-sm">N° de Série</Label>
                            <Input id="tricone-serie" name="machineSerie" value={formData.machineSerie} onChange={(e) => handleInputChange(e, 'machineSerie')} className="h-8 text-xs sm:text-sm"/>
                         </div>
                         <div>
                            <Label htmlFor="tricone-type" className="text-xs sm:text-sm">Type</Label>
                            <Input id="tricone-type" name="machineType" value={formData.machineType} onChange={(e) => handleInputChange(e, 'machineType')} className="h-8 text-xs sm:text-sm"/>
                         </div>
                         <div>
                            <Label htmlFor="tricone-diametre" className="text-xs sm:text-sm">Diamètre</Label>
                            <Input id="tricone-diametre" name="machineDiametre" value={formData.machineDiametre} onChange={(e) => handleInputChange(e, 'machineDiametre')} className="h-8 text-xs sm:text-sm"/>
                         </div>
                     </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <Label htmlFor="tricone-pose" className="text-xs sm:text-sm">Posé (N°)</Label>
                            <Input
                                id="tricone-pose"
                                type="text"
                                name="pose"
                                value={formData.tricone.pose}
                                onChange={(e) => handleInputChange(e, 'tricone', undefined, 'pose')}
                                 className="h-8 text-xs sm:text-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor="tricone-depose" className="text-xs sm:text-sm">Déposé (N°)</Label>
                            <Input
                                id="tricone-depose"
                                type="text"
                                name="depose"
                                value={formData.tricone.depose}
                                onChange={(e) => handleInputChange(e, 'tricone', undefined, 'depose')}
                                 className="h-8 text-xs sm:text-sm"
                            />
                        </div>
                         <div>
                            <Label htmlFor="tricone-cause" className="text-xs sm:text-sm">Cause de Dépose</Label>
                            <Select
                                value={formData.tricone.causeDepose}
                                onValueChange={(value) => handleSelectChange(value, 'tricone', 'causeDepose')}
                                >
                              <SelectTrigger id="tricone-cause" className="w-full h-8 text-xs sm:text-sm">
                                <SelectValue placeholder="Sélectionner Cause" />
                              </SelectTrigger>
                              <SelectContent>
                                {causeDeposeOptions.map((cause, index) => (
                                  <SelectItem key={index} value={cause} className="text-xs sm:text-sm">{cause}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="tricone-index-compteur" className="text-xs sm:text-sm">Index Compteur (Tricone)</Label>
                        <Input
                            id="tricone-index-compteur"
                            type="text"
                            inputMode="decimal"
                            placeholder="Index au moment de la dépose"
                            name="indexCompteur"
                            value={formData.tricone.indexCompteur}
                            onChange={(e) => handleInputChange(e, 'tricone', undefined, 'indexCompteur')}
                            className="h-8 text-xs sm:text-sm"
                         />
                    </div>
               </div>

               <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-medium text-foreground text-sm sm:text-base">Gasoil</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="gasoil-lieu" className="text-xs sm:text-sm">Lieu d'Appoint</Label>
                            <Input
                                id="gasoil-lieu"
                                type="text"
                                name="lieuAppoint"
                                value={formData.gasoil.lieuAppoint}
                                onChange={(e) => handleInputChange(e, 'gasoil', undefined, 'lieuAppoint')}
                                 className="h-8 text-xs sm:text-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor="gasoil-index" className="text-xs sm:text-sm">Index Compteur (Gasoil)</Label>
                            <Input
                                id="gasoil-index"
                                type="text"
                                inputMode="decimal"
                                name="indexCompteur"
                                value={formData.gasoil.indexCompteur}
                                 onChange={(e) => handleInputChange(e, 'gasoil', undefined, 'indexCompteur')}
                                  className="h-8 text-xs sm:text-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor="gasoil-quantite" className="text-xs sm:text-sm">Quantité Délivrée</Label>
                            <Input
                                id="gasoil-quantite"
                                type="text"
                                inputMode="decimal"
                                name="quantiteDelivree"
                                value={formData.gasoil.quantiteDelivree}
                                onChange={(e) => handleInputChange(e, 'gasoil', undefined, 'quantiteDelivree')}
                                 placeholder="en Litres"
                                  className="h-8 text-xs sm:text-sm"
                            />
                        </div>
                    </div>
               </div>
            </div>


            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-2 sm:space-x-3">
                <Button type="button" variant="outline" size="sm">Enregistrer Brouillon</Button>
                <Button type="submit" size="sm" disabled={counterErrors.some(err => err !== '')}>
                    Soumettre Rapport
                </Button>
            </div>
          </CardContent>
      </form>
    </Card>
  );
}
