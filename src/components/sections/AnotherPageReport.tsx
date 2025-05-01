
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

interface AnotherPageReportProps {
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
  // indexCompteur: string; // Removed global index compteur
  indexCompteurs: IndexCompteurPoste[]; // Array for debut/fin per poste
  shifts: string[]; // Corresponds to 1er, 2eme, 3eme D/F times
  ventilation: { [code: number]: string }; // Use code as key for easier access
  bulls: string[]; // Corresponds to 1er, 2eme, 3eme D manque bull
  repartitionTravail: RepartitionItem[];
  exploitation: { [key: string]: string }; // For metrics like HEURES COMPTEUR etc.
  personnel: {
      conducteur: string;
      graisseur: string;
      matricules: string;
  };
  tricone: {
    marque: string;
    serie: string;
    type: string;
    diametre: string;
    pose: string;
    depose: string;
    causeDepose: string;
    indexCompteur: string; // Specific index for tricone
  };
  gasoil: {
    lieuAppoint: string;
    indexCompteur: string; // Specific index for gasoil
    quantiteDelivree: string;
  };
}


// Data structure based on user input
 const data = {
    ventilation: [
      { code: 121, label: "ARRET CARREAU INDUSTRIEL" },
      { code: 122, label: "COUPURE GENERALE DU COURANT", shifts: [7, 15, 23] }, // Example shift codes
      { code: 123, label: "GREVE" },
      { code: 124, label: "INTEMPERIES" },
      { code: 125, label: "STOCKS PLEINS" },
      { code: 126, label: "J. FERIES OU HEBDOMADAIRES", shifts: [8, 16, 24] },
      { code: 128, label: "ARRET PAR LA CENTRALE (ENERGIE)" },
      { code: 230, label: "CONTROLE" },
      { code: 231, label: "DEFAUT ELEC. (C. CRAME, RESEAU)" },
      { code: 232, label: "PANNE MECANIQUE", shifts: [null, 1, null] }, // Example shift codes
      { code: 233, label: "PANNE ELECTRIQUE" },
      { code: 234, label: "INTERVENTION ATELIER PNEUMATIQUE" },
      { code: 235, label: "ENTRETIEN SYSTEMATIQUE" },
      { code: 236, label: "APPOINT (HUILE, GAZOL, EAU)", shifts: [10, 18, 2] },
      { code: 237, label: "GRAISSAGE" },
      { code: 238, label: "ARRET ELEC. INSTALLATION FIXES" },
      { code: 239, label: "MANQUE CAMIONS" },
      { code: 240, label: "MANQUE BULL", shifts: [11, 19, 3] },
      { code: 241, label: "MANQUE MECANICIEN" },
      { code: 242, label: "MANQUE OUTILS DE TRAVAIL" },
      { code: 243, label: "MACHINE A L'ARRET" },
      { code: 244, label: "PANNE ENGIN DEVANT MACHINE", shifts: [12, 20, 4] },
      { code: 442, label: "RELEVE" },
      { code: 443, label: "EXECUTION PLATE FORME" },
      { code: 444, label: "DEPLACEMENT" },
      { code: 445, label: "TIR ET SAUTAGE", shifts: [13, 21, 5] },
      { code: 446, label: "MOUV. DE CABLE" },
      { code: 448, label: "ARRET DECIDE" },
      { code: 449, label: "MANQUE CONDUCTEUR" },
      { code: 450, label: "BRIQUET" },
      { code: 451, label: "PERTES (INTEMPERIES EXCLUES)", shifts: [14, 22, 6] },
      { code: 452, label: "ARRETS MECA. INSTALLATIONS FIXES" },
      { code: 453, label: "TELESCOPAGE", shifts: [15, 23, 7] },
      { code: 454, label: "EXCAVATION PURE" }, // Use different code if needed
      { code: 455, label: "TERRASSEMENT PUR" }, // Use different code if needed
    ],
    exploitation_codes: { // Using codes as keys
      total: 'TOTAL', // Assuming this is a calculated field
      heuresCompteur: 510,
      metrageFore: 610,
      nombreTrousFores: 620,
      nombreVoyages: 630,
      nombreDecapages: 640, // Corrected spelling
      tonnage: 650,
      nombreTKJ: 660, // Corrected T.K.U
    },
    causes_depose: [
      "T1 CORPS USE",
      "T2 MOLLETTES USEES",
      "T3 MOLLETTES PERDUES",
      "T4 ROULEMENT CASSE",
      "T5 CORPS FISSURE",
      "T6 ROULEMENT COINCE",
      "T7 FILAGE ABIME",
      "T8 TRICONE PERDU",
    ]
  };


export function AnotherPageReport({ currentDate }: AnotherPageReportProps) {
   const [selectedPoste, setSelectedPoste] = useState<Poste>("1er"); // Default to 1er Poste
   const [calculatedHours, setCalculatedHours] = useState<{ poste: number[]; total: number }>({ poste: [0, 0, 0], total: 0 });

  const [formData, setFormData] = useState<FormData>({
    entree: "",
    secteur: "",
    rapportNo: "",
    machineEngins: "",
    sa: "",
    unite: "",
    indexCompteurs: Array(3).fill(null).map(() => ({ debut: "", fin: "" })), // Initialize for 3 postes
    shifts: ["", "", ""], // For 6H30 F, 14H30 F, 22H30 F fields
    ventilation: data.ventilation.reduce((acc, item) => ({ ...acc, [item.code]: "" }), {}),
    bulls: ["", "", ""], // For Manque Bull 1er D, 2eme D, 3eme D
    repartitionTravail: Array(3).fill(null).map(() => ({ chantier: "", temps: "", imputation: "" })), // Create distinct objects
    exploitation: Object.keys(data.exploitation_codes).reduce((acc, key) => ({ ...acc, [key]: "" }), {}),
    personnel: { conducteur: "", graisseur: "", matricules: "" },
    tricone: { marque: "", serie: "", type: "", diametre: "", pose: "", depose: "", causeDepose: "", indexCompteur: "" },
    gasoil: { lieuAppoint: "", indexCompteur: "", quantiteDelivree: "" },
  });

 const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: keyof FormData | 'ventilation' | 'exploitation' | 'personnel' | 'tricone' | 'gasoil' | 'repartitionTravail' | 'shifts' | 'bulls' | 'indexCompteurs',
    subFieldOrIndex?: string | number, // Can be ventilation code, exploitation key, personnel role, tricone/gasoil field, repartition/indexCompteurs/shifts/bulls index
    nestedField?: keyof RepartitionItem | keyof IndexCompteurPoste // For repartition or indexCompteurs
 ) => {
    const { name, value } = e.target;
    const targetName = name || e.target.id; // Use id if name is not available

    setFormData(prevData => {
        let newData = { ...prevData };

        if (section === 'ventilation' && typeof subFieldOrIndex === 'number') {
            newData.ventilation[subFieldOrIndex] = value;
        } else if (section === 'exploitation' && typeof subFieldOrIndex === 'string') {
            newData.exploitation[subFieldOrIndex] = value;
        } else if (section === 'personnel' && typeof subFieldOrIndex === 'string' && (subFieldOrIndex === 'conducteur' || subFieldOrIndex === 'graisseur' || subFieldOrIndex === 'matricules')) {
             newData.personnel = { ...newData.personnel, [subFieldOrIndex]: value };
        } else if (section === 'tricone' && typeof subFieldOrIndex === 'string' && subFieldOrIndex in newData.tricone) {
             newData.tricone = { ...newData.tricone, [subFieldOrIndex as keyof typeof newData.tricone]: value };
        } else if (section === 'gasoil' && typeof subFieldOrIndex === 'string' && subFieldOrIndex in newData.gasoil) {
             newData.gasoil = { ...newData.gasoil, [subFieldOrIndex as keyof typeof newData.gasoil]: value };
        } else if (section === 'repartitionTravail' && typeof subFieldOrIndex === 'number' && nestedField && nestedField in newData.repartitionTravail[0]) {
            if (newData.repartitionTravail && newData.repartitionTravail[subFieldOrIndex]) {
                const newRepartition = [...newData.repartitionTravail];
                newRepartition[subFieldOrIndex] = { ...newRepartition[subFieldOrIndex], [nestedField]: value };
                newData.repartitionTravail = newRepartition;
            }
        } else if (section === 'indexCompteurs' && typeof subFieldOrIndex === 'number' && nestedField && nestedField in newData.indexCompteurs[0]) {
             if (newData.indexCompteurs && newData.indexCompteurs[subFieldOrIndex]) {
                const newIndexCompteurs = [...newData.indexCompteurs];
                newIndexCompteurs[subFieldOrIndex] = { ...newIndexCompteurs[subFieldOrIndex], [nestedField]: value };
                newData.indexCompteurs = newIndexCompteurs;
            }
        } else if (section === 'shifts' && typeof subFieldOrIndex === 'number') {
            const newShifts = [...newData.shifts];
            newShifts[subFieldOrIndex] = value;
            newData.shifts = newShifts;
        } else if (section === 'bulls' && typeof subFieldOrIndex === 'number') {
             const newBulls = [...newData.bulls];
            newBulls[subFieldOrIndex] = value;
            newData.bulls = newBulls;
        } else if (typeof section === 'string' && section in newData && typeof (newData as any)[section] === 'string') {
            // Handles top-level fields like entree, secteur, unite, etc.
            (newData as any)[section] = value;
        } else {
             console.warn("Unhandled input change:", { section, subFieldOrIndex, nestedField, targetName, value });
        }

        return newData;
    });
};


   const handleSelectChange = (
      value: string,
      section: 'tricone', // Only tricone uses select for now
      field: 'causeDepose' // Only causeDepose for now
    ) => {
     setFormData(prevData => ({
         ...prevData,
         [section]: {
             ...prevData[section],
             [field]: value
         }
     }));
    };

    // Function to calculate working hours
    const calculateWorkingHours = () => {
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
    };

    // Recalculate on index compteur change
    useEffect(() => {
        calculateWorkingHours();
    }, [formData.indexCompteurs]);


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
                <Input id="entree" value={formData.entree} onChange={(e) => handleInputChange(e, 'entree')} placeholder="ENTREE" />
              </div>
              <div>
                <Label htmlFor="secteur">Secteur</Label>
                <Input id="secteur" value={formData.secteur} onChange={(e) => handleInputChange(e, 'secteur')} placeholder="SECTEUR" />
              </div>
               <div>
                <Label htmlFor="rapport-no">Rapport (R°)</Label>
                <Input id="rapport-no" value={formData.rapportNo} onChange={(e) => handleInputChange(e, 'rapportNo')} placeholder="N°" />
              </div>
              <div>
                <Label htmlFor="machine-engins">Machine / Engins</Label>
                <Input id="machine-engins" value={formData.machineEngins} onChange={(e) => handleInputChange(e, 'machineEngins')} placeholder="Nom ou Code" />
              </div>
               <div>
                <Label htmlFor="sa">S.A</Label>
                <Input id="sa" value={formData.sa} onChange={(e) => handleInputChange(e, 'sa')} placeholder="S.A" />
              </div>
            </div>


        {/* Section: Unite & Index Compteur per Poste */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Label htmlFor="unite">Unité</Label>
            <Input
              id="unite"
              value={formData.unite}
              onChange={(e) => handleInputChange(e, "unite")}
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
                             Heures: {calculatedHours.poste[index].toFixed(2)}h
                         </div>
                    </div>
                ))}
                <div className="col-span-3 mt-2 text-right font-semibold">
                    Total Heures (24h): {calculatedHours.total.toFixed(2)}h
                 </div>
           </div>
        </div>

         {/* Section: Poste Selection & Shift Times */}
        <div className="space-y-2">
           <Label className="text-foreground">Poste Actuel</Label>
            <RadioGroup
              value={selectedPoste} // Controlled component
              onValueChange={(value: Poste) => setSelectedPoste(value)}
              className="flex flex-wrap space-x-4 pt-2"
            >
              {POSTE_ORDER.map((poste) => ( // Use defined order
                <div key={poste} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={poste} id={`another-poste-${poste}`} />
                  <Label htmlFor={`another-poste-${poste}`} className="font-normal text-foreground">
                    {poste} Poste <span className="text-muted-foreground text-xs">({POSTE_TIMES[poste]})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

           {/* Shift Input Fields (6H30 F, 14H30 F, 22H30 F) */}
           <div className="grid grid-cols-3 gap-4 pt-2">
                {/* Assuming these correspond to the END times of the postes */}
                 <div >
                    <Label htmlFor={`shift-1`} className="text-muted-foreground text-xs">Fin 1er (14H30 F)</Label>
                     <Input
                      id={`shift-1`}
                      type="text"
                      value={formData.shifts[1]} // Index 1 for 2eme shift end?
                      onChange={(e) => handleInputChange(e, "shifts", 1)}
                      placeholder="Valeur?"
                    />
                  </div>
                  <div >
                    <Label htmlFor={`shift-2`} className="text-muted-foreground text-xs">Fin 2ème (22H30 F)</Label>
                     <Input
                      id={`shift-2`}
                      type="text"
                      value={formData.shifts[2]} // Index 2 for 3eme shift end?
                      onChange={(e) => handleInputChange(e, "shifts", 2)}
                      placeholder="Valeur?"
                    />
                  </div>
                 <div >
                    <Label htmlFor={`shift-0`} className="text-muted-foreground text-xs">Fin 3ème (06H30 F)</Label>
                     <Input
                      id={`shift-0`}
                      type="text"
                      value={formData.shifts[0]} // Index 0 for 1er shift end?
                      onChange={(e) => handleInputChange(e, "shifts", 0)}
                       placeholder="Valeur?"
                    />
                  </div>
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
                      {/* Optional Shift Code columns */}
                       {/* <TableHead className="w-[50px] text-center text-xs">1er D</TableHead>
                       <TableHead className="w-[50px] text-center text-xs">2eme D</TableHead>
                       <TableHead className="w-[50px] text-center text-xs">3eme D</TableHead> */}
                      <TableHead className="text-right w-[150px]">Durée Totale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.ventilation.map((item) => (
                      <TableRow key={item.code} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{item.label}</TableCell>
                         {/* Optional Shift Code columns */}
                        {/* <TableCell className="text-center text-xs text-muted-foreground">{item.shifts?.[0] ?? ''}</TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">{item.shifts?.[1] ?? ''}</TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">{item.shifts?.[2] ?? ''}</TableCell> */}
                        <TableCell className="text-right">
                          <Input
                            type="text"
                            className="h-8 text-sm text-right w-full min-w-[100px]"
                            placeholder="ex: 1h 30"
                            value={formData.ventilation[item.code]}
                            onChange={(e) => handleInputChange(e, "ventilation", item.code)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Add Total Row */}
                     <TableRow className="bg-muted/80 font-semibold">
                         <TableCell colSpan={2}>TOTAL Arrêts</TableCell>
                         {/* <TableCell colSpan={3}></TableCell> Optional Shift Code columns */}
                         <TableCell className="text-right">
                             <Input type="text" className="h-8 text-sm text-right w-full bg-transparent font-semibold" readOnly value={"Calculated Total"} /> {/* Replace with calculated total */}
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
                    {Object.entries(data.exploitation_codes).map(([key, code]) => (
                         <div key={key} className="space-y-1">
                            <Label htmlFor={`expl-${key}`} className="text-sm text-muted-foreground">
                                {typeof code === 'string' ? code : `${data.exploitation_codes[key as keyof typeof data.exploitation_codes]} - ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}` }
                                 {typeof code === 'number' && <span className="text-xs"> ({code})</span>}
                            </Label>
                            <Input
                                id={`expl-${key}`}
                                type="text"
                                className="h-9"
                                value={formData.exploitation[key]}
                                onChange={(e) => handleInputChange(e, 'exploitation', key)}
                                disabled={key === 'total'} // Disable total if calculated
                                placeholder={key === 'total' ? 'Calculé' : ''}
                            />
                         </div>
                    ))}
               </div>
         </div>


        {/* Section: Manque Bull */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Manque Bull (Durée)</h3>
          <div className="grid grid-cols-3 gap-4">
             {/* Assuming bulls indices correspond to POSTE_ORDER */}
            {POSTE_ORDER.map((poste, index) => (
              <div key={poste}>
                <Label htmlFor={`bull-${poste}`} className="text-muted-foreground text-xs">{`${poste} D`}</Label>
                <Input
                  id={`bull-${poste}`}
                  type="text"
                   placeholder="ex: 0h 45"
                  value={formData.bulls[index]}
                  onChange={(e) => handleInputChange(e, "bulls", index)}
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
                            />
                        </div>
                        <div>
                            <Label htmlFor={`temps-${poste}`}>Temps</Label>
                            <Input
                                id={`temps-${poste}`}
                                type="text"
                                placeholder="ex: 7h 00"
                                value={formData.repartitionTravail[index]?.temps || ''}
                                onChange={(e) => handleInputChange(e, 'repartitionTravail', index, 'temps')}
                            />
                        </div>
                        <div>
                            <Label htmlFor={`imputation-${poste}`}>Imputation</Label>
                            <Input
                                id={`imputation-${poste}`}
                                type="text"
                                value={formData.repartitionTravail[index]?.imputation || ''}
                                onChange={(e) => handleInputChange(e, 'repartitionTravail', index, 'imputation')}
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
                   <div>
                        <Label htmlFor="personnel-conducteur">Conducteur</Label>
                        <Input
                            id="personnel-conducteur"
                            value={formData.personnel.conducteur}
                            onChange={(e) => handleInputChange(e, 'personnel', 'conducteur')}
                        />
                    </div>
                    <div>
                        <Label htmlFor="personnel-graisseur">Graisseur</Label>
                        <Input
                            id="personnel-graisseur"
                             value={formData.personnel.graisseur}
                            onChange={(e) => handleInputChange(e, 'personnel', 'graisseur')}
                        />
                    </div>
                     <div>
                        <Label htmlFor="personnel-matricules">Matricules</Label>
                        <Input
                            id="personnel-matricules"
                             value={formData.personnel.matricules}
                            onChange={(e) => handleInputChange(e, 'personnel', 'matricules')}
                             placeholder="Séparés par des virgules"
                        />
                    </div>
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
                        <Input id="tricone-marque" value={formData.tricone.marque} onChange={(e) => handleInputChange(e, 'tricone', 'marque')}/>
                     </div>
                     <div>
                        <Label htmlFor="tricone-serie">N° de Série</Label>
                        <Input id="tricone-serie" value={formData.tricone.serie} onChange={(e) => handleInputChange(e, 'tricone', 'serie')}/>
                     </div>
                     <div>
                        <Label htmlFor="tricone-type">Type</Label>
                        <Input id="tricone-type" value={formData.tricone.type} onChange={(e) => handleInputChange(e, 'tricone', 'type')}/>
                     </div>
                     <div>
                        <Label htmlFor="tricone-diametre">Diamètre</Label>
                        <Input id="tricone-diametre" value={formData.tricone.diametre} onChange={(e) => handleInputChange(e, 'tricone', 'diametre')}/>
                     </div>
                 </div>

                {/* Pose / Depose */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <Label htmlFor="tricone-pose">Posé (N°)</Label>
                        <Input
                            id="tricone-pose"
                            value={formData.tricone.pose}
                            onChange={(e) => handleInputChange(e, 'tricone', 'pose')}
                        />
                    </div>
                    <div>
                        <Label htmlFor="tricone-depose">Déposé (N°)</Label>
                        <Input
                            id="tricone-depose"
                            value={formData.tricone.depose}
                            onChange={(e) => handleInputChange(e, 'tricone', 'depose')}
                        />
                    </div>
                     <div>
                        <Label htmlFor="tricone-cause">Cause de Dépose</Label>
                        <Select
                            value={formData.tricone.causeDepose}
                            onValueChange={(value) => handleSelectChange(value, 'tricone', 'causeDepose')}
                            >
                          <SelectTrigger id="tricone-cause" className="w-full">
                            <SelectValue placeholder="Sélectionner Cause" />
                          </SelectTrigger>
                          <SelectContent>
                            {data.causes_depose.map((cause, index) => (
                              <SelectItem key={index} value={cause}>{cause}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div>
                    <Label htmlFor="tricone-index-compteur">Index Compteur (Tricone)</Label>
                    <Input id="tricone-index-compteur" type="text"
                     value={formData.tricone.indexCompteur} onChange={(e) => handleInputChange(e, 'tricone', 'indexCompteur')}
                    placeholder="Index au moment de la dépose?" />
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
                            value={formData.gasoil.lieuAppoint}
                            onChange={(e) => handleInputChange(e, 'gasoil', 'lieuAppoint')}
                        />
                    </div>
                    <div>
                        <Label htmlFor="gasoil-index">Index Compteur (Gasoil)</Label>
                        <Input
                            id="gasoil-index"
                            value={formData.gasoil.indexCompteur}
                             onChange={(e) => handleInputChange(e, 'gasoil', 'indexCompteur')}
                        />
                    </div>
                    <div>
                        <Label htmlFor="gasoil-quantite">Quantité Délivrée</Label>
                        <Input
                            id="gasoil-quantite"
                            value={formData.gasoil.quantiteDelivree}
                            onChange={(e) => handleInputChange(e, 'gasoil', 'quantiteDelivree')}
                             placeholder="en Litres"
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

