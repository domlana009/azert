
"use client";

import { useState } from "react";
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

interface FormData {
  entree: string;
  secteur: string;
  rapportNo: string;
  machineEngins: string;
  sa: string;
  unite: string;
  indexCompteur: string;
  shifts: string[]; // Assuming shifts corresponds to postes 1er, 2eme, 3eme
  ventilation: string[];
  bulls: string[]; // Assuming bulls corresponds to postes 1er, 2eme, 3eme
  repartitionTravail: RepartitionItem[];
  tricone: {
    pose: string;
    depose: string;
    causeDepose: string;
  };
  gasoil: {
    lieuAppoint: string;
    indexCompteur: string;
    quantiteDelivree: string;
  };
  machineMarque: string;
  machineSerie: string;
  machineType: string;
  machineDiametre: string;
}


// Sample data structure based on user input (assuming this structure)
 const data = {
    ventilation: [
      { code: 121, label: "ARRET CARREAU INDUSTRIEL" },
      { code: 122, label: "COUPURE GENERALE DU COURANT" },
      { code: 123, label: "GREVE" },
      { code: 124, label: "INTEMPERIES" },
      { code: 125, label: "STOCKS PLEINS" },
      { code: 126, label: "J. FERIES OU HEBDOMADAIRES" }, // Note: Corrected FÊRIES to FERIES
      { code: 128, label: "ARRET PAR LA CENTRALE (ENERGIE)" },
      { code: 230, label: "CONTROLE" },
      { code: 231, label: "DEFAUT ELEC. (C. CRAME, RESEAU)" }, // Note: Corrected C.RAME to C. CRAME
      { code: 232, label: "PANNE MECANIQUE" },
      { code: 233, label: "PANNE ELECTRIQUE" }, // Added Panne Electrique based on context
      { code: 234, label: "INTERVENTION ATELIER PNEUMATIQUE" },
      { code: 235, label: "ENTRETIEN SYSTEMATIQUE" },
      { code: 236, label: "APPOINT (HUILE, GAZOL, EAU)" }, // Note: Corrected GAZOIL to GAZOL
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
      { code: 445, label: "TIR ET SAUTAGE" }, // Note: Corrected MISE EN SAUTAGE based on context numbers
      { code: 446, label: "MOUV. DE CABLE" },
      { code: 448, label: "ARRET DECIDE" },
      { code: 449, label: "MANQUE CONDUCTEUR" },
      { code: 450, label: "BRIQUET" },
      { code: 451, label: "PERTES (INTEMPERIES EXCLUES)" }, // Note: Corrected PISTES
      { code: 452, label: "ARRETS MECA. INSTALLATIONS FIXES" },
      { code: 453, label: "TELESCOPAGE" },
      { code: 454, label: "EXCAVATION PURE" }, // Assigning new codes as they were duplicated
      { code: 455, label: "TERRASSEMENT PUR" }, // Assigning new codes as they were duplicated
    ],
    exploitation: [
      "TOTAL",
      "HEURES COMPTEUR",
      "METRAGE FORE",
      "NOMBRE DE TROUS FORES",
      "NOMBRE DE VOYAGES",
      "NOMBRE D'ECAPAGES", // Note: Corrected DECAPAGES
      "TONNAGE",
      "NOMBRE T.K.J", // Note: Corrected T.K.U
    ],
    personnel: ["CONDUCTEUR", "GRAISSEUR", "MATRICULES"],
    travail: ["REPARTITION DU TEMPS DE TRAVAIL PUR", "CHANTIER", "TEMPS", "IMPUTATION", "POSTE"], // Note: Corrected PAR
    machine: [
      "MARQUE",
      "N° DE SERIE",
      "TYPE",
      "DIAMETRE",
      // "LIEU APPOINT", // Moved to Gasoil section
      // "INDEX COMPTEUR", // Appears multiple times, keeping general one and specific ones
      // "SOMME CONSOMMATION", // Seems redundant with Quantite Delivree
      // "TRONCON", // Ambiguous, related to Tricone?
      // "DEPOSE", // Moved to Tricone section
      // "CAUSE DE DEPOSE", // Moved to Tricone section
    ],
    causes_depose: [ // Assuming these relate to Tricone
      "T1 CORPS USE",
      "T2 MOLLETTES USEES", // Note: Corrected MOLETTES
      "T3 MOLLETTES PERDUES",
      "T4 ROULEMENT CASSE",
      "T5 CORPS FISSURE",
      "T6 ROULEMENT COINCE",
      "T7 FILAGE ABIME",
      "T8 TRICONE PERDU",
    ],
     // Adding Gasoil fields based on user provided structure
    gasoil_fields: [
       "LIEU D'APPOINT",
       "INDEX COMPTEUR",
       "QUANTITE DELIVREE",
    ]
  };


export function R0Report({ currentDate }: R0ReportProps) {
   const [selectedPoste, setSelectedPoste] = useState<Poste>("1er"); // Default to 1er Poste

  const [formData, setFormData] = useState<FormData>({
    entree: "",
    secteur: "",
    rapportNo: "",
    machineEngins: "",
    sa: "",
    unite: "",
    indexCompteur: "",
    shifts: ["", "", ""], // Corresponds to 1er, 2eme, 3eme D/F times? Needs clarification
    ventilation: Array(data.ventilation.length).fill(""),
    bulls: ["", "", ""], // Corresponds to 1er, 2eme, 3eme D manque bull?
    repartitionTravail: Array(3).fill(null).map(() => ({ chantier: "", temps: "", imputation: "" })), // Create distinct objects
    tricone: {
      pose: "",
      depose: "",
      causeDepose: "",
    },
    gasoil: {
      lieuAppoint: "",
      indexCompteur: "",
      quantiteDelivree: "",
    },
    machineMarque: "",
    machineSerie: "",
    machineType: "",
    machineDiametre: "",
  });

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      section: keyof FormData | 'ventilation' | 'repartitionTravail' | 'tricone' | 'gasoil' | 'shifts' | 'bulls',
      index?: number,
      field?: keyof RepartitionItem | keyof FormData['tricone'] | keyof FormData['gasoil']
    ) => {
      const { name, value } = e.target;
       // Use name attribute for top-level fields if available and section matches a key in FormData
      const targetName = (name && section in formData && typeof (formData as any)[section] === 'string') ? name : section;

      setFormData(prevData => {
          let newData = { ...prevData };

          if (section === 'ventilation' && index !== undefined) {
              const newVentilation = [...newData.ventilation];
              newVentilation[index] = value;
              newData.ventilation = newVentilation;
          } else if (section === 'repartitionTravail' && index !== undefined && field) {
              // Ensure the array exists and the index is valid
              if (newData.repartitionTravail && newData.repartitionTravail[index]) {
                  const newRepartition = [...newData.repartitionTravail];
                  // Ensure the item at the index is an object before spreading
                  newRepartition[index] = { ...newRepartition[index], [field]: value };
                  newData.repartitionTravail = newRepartition;
              }
          } else if (section === 'tricone' && field && typeof field === 'string' && field in newData.tricone) {
              newData.tricone = { ...newData.tricone, [field as keyof typeof newData.tricone]: value };
          } else if (section === 'gasoil' && field && typeof field === 'string' && field in newData.gasoil) {
               newData.gasoil = { ...newData.gasoil, [field as keyof typeof newData.gasoil]: value };
          } else if (section === 'shifts' && index !== undefined) {
              const newShifts = [...newData.shifts];
              newShifts[index] = value;
              newData.shifts = newShifts;
          } else if (section === 'bulls' && index !== undefined) {
               const newBulls = [...newData.bulls];
              newBulls[index] = value;
              newData.bulls = newBulls;
          }
          // Handle top-level string fields directly
          else if (typeof targetName === 'string' && targetName in newData && typeof (newData as any)[targetName] === 'string') {
             (newData as any)[targetName] = value;
          }
          else {
             console.warn("Unhandled input change:", { section, index, field, name, value });
          }
          return newData;
      });
  };

   const handleSelectChange = (
      value: string,
      section: keyof FormData | 'tricone', // Specify sections where select is used
      field: keyof FormData['tricone']
      // Add other fields if needed
    ) => {
     setFormData(prevData => {
        let newData = { ...prevData };
        if (section === 'tricone' && field && typeof field === 'string' && field in newData.tricone) {
            newData.tricone = { ...newData.tricone, [field as keyof typeof newData.tricone]: value };
        }
        // Add other select handlers here if needed
        return newData;
     });
    };


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
                <Input id="entree" name="entree" placeholder="ENTREE" value={formData.entree} onChange={(e) => handleInputChange(e, 'entree')} />
              </div>
              <div>
                <Label htmlFor="secteur">Secteur</Label>
                <Input id="secteur" name="secteur" placeholder="SECTEUR" value={formData.secteur} onChange={(e) => handleInputChange(e, 'secteur')}/>
              </div>
               <div>
                <Label htmlFor="rapport-no">Rapport (R°)</Label>
                <Input id="rapport-no" name="rapportNo" placeholder="N°" value={formData.rapportNo} onChange={(e) => handleInputChange(e, 'rapportNo')} />
              </div>
              <div>
                <Label htmlFor="machine-engins">Machine / Engins</Label>
                <Input id="machine-engins" name="machineEngins" placeholder="Nom ou Code" value={formData.machineEngins} onChange={(e) => handleInputChange(e, 'machineEngins')} />
              </div>
               <div>
                <Label htmlFor="sa">S.A</Label>
                <Input id="sa" name="sa" placeholder="S.A" value={formData.sa} onChange={(e) => handleInputChange(e, 'sa')} />
              </div>
            </div>


        {/* Section: Unite & Index */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="unite">Unité</Label>
            <Input
              id="unite"
              name="unite"
              value={formData.unite}
              onChange={(e) => handleInputChange(e, "unite")}
            />
          </div>
          <div>
            <Label htmlFor="indexCompteur">Index Compteur</Label>
            <Input
              id="indexCompteur"
              name="indexCompteur"
              value={formData.indexCompteur}
              onChange={(e) => handleInputChange(e, "indexCompteur")}
            />
          </div>
        </div>

        {/* Section: Poste Selection & Shifts */}
        <div className="space-y-2">
           <Label className="text-foreground">Poste</Label>
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
                    {data.ventilation.map((item, index) => (
                      <TableRow key={item.code} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{item.label}</TableCell>
                        {/* Add cells for shift-specific durations if needed */}
                        <TableCell className="text-right">
                          <Input
                            type="text"
                            className="h-8 text-sm text-right w-full"
                            placeholder="ex: 1h 30"
                            value={formData.ventilation[index]}
                            onChange={(e) => handleInputChange(e, "ventilation", index)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Add Total Row */}
                     <TableRow className="bg-muted/80 font-semibold">
                         <TableCell colSpan={2}>TOTAL Arrêts</TableCell>
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
                    {data.exploitation.map((item) => (
                         <div key={item} className="space-y-1">
                            <Label htmlFor={`expl-${item.toLowerCase().replace(/\s/g, '-')}`} className="text-sm text-muted-foreground">
                                {item}
                            </Label>
                            <Input
                                id={`expl-${item.toLowerCase().replace(/\s/g, '-')}`}
                                type="text"
                                className="h-9"
                                // Add state management if these need to be dynamic
                            />
                         </div>
                    ))}
               </div>
         </div>


        {/* Section: Manque Bull */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Manque Bull</h3>
          <div className="grid grid-cols-3 gap-4">
            {POSTE_ORDER.map((poste, index) => (
              <div key={poste}>
                <Label htmlFor={`bull-${poste}`} className="text-muted-foreground text-xs">{`${poste} D`}</Label>
                <Input
                  id={`bull-${poste}`}
                  type="text"
                  value={formData.bulls[index]} // Assuming index matches POSTE_ORDER
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
                   {data.personnel.map(role => (
                        <div key={role} className="space-y-1">
                            <Label htmlFor={`personnel-${role.toLowerCase()}`}>{role}</Label>
                            <Input
                                id={`personnel-${role.toLowerCase()}`}
                                type="text"
                                className="h-9"
                                // Add state management
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
                        <Input id="tricone-marque" name="machineMarque" value={formData.machineMarque} onChange={(e) => handleInputChange(e, 'machineMarque')}/>
                     </div>
                     <div>
                        <Label htmlFor="tricone-serie">N° de Série</Label>
                        <Input id="tricone-serie" name="machineSerie" value={formData.machineSerie} onChange={(e) => handleInputChange(e, 'machineSerie')}/>
                     </div>
                     <div>
                        <Label htmlFor="tricone-type">Type</Label>
                        <Input id="tricone-type" name="machineType" value={formData.machineType} onChange={(e) => handleInputChange(e, 'machineType')}/>
                     </div>
                     <div>
                        <Label htmlFor="tricone-diametre">Diamètre</Label>
                        <Input id="tricone-diametre" name="machineDiametre" value={formData.machineDiametre} onChange={(e) => handleInputChange(e, 'machineDiametre')}/>
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
                    <Input id="tricone-index-compteur" type="text" placeholder="Index au moment de la dépose?" />
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
