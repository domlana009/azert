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

interface R0ReportProps {
  currentDate: string;
}

export function R0Report({ currentDate }: R0ReportProps) {
  const data = {
    ventilation: [
      "ARRET CARREAU INDUSTRIEL",
      "COUPURE GENERALE DU COURANT",
      "GREVE",
      "INTEMPERIES",
      "STOCKS PLEINS",
      "FÊRIES OU HEBDOMADAIRES",
      "ARRET PAR LA CENTRALE (E.M.E.)",
      "CONTROLE",
      "DEFAUT ELEC. (C.RAME, RESAU)",
      "PANNE MECANIQUE",
      "PANNE ATELIER",
      "INTERVENTION ATELIER PNEUMATIQUE",
      "ENTRETIEN SYSTEMATIQUE",
      "APPOINT (HUILE, GAZOIL, EAU)",
      "GRAISSAGE",
      "ARRET ELEC. INSTALLATION FIXES",
      "MANQUE CAMIONS",
      "MANQUE BULL",
      "MANQUE MECANICIEN",
      "MANQUE OUTILS DE TRAVAIL",
      "MACHINE A L'ARRET",
      "PANNE ENGIN DEVANT MACHINE",
      "RELEVE",
      "EXECUTION PLATE FORME",
      "DEPLACEMENT",
      "MISE EN SAUTAGE",
      "MOV. DE CABLE",
      "ARRET DECIDE",
      "MANQUE CONDUCTEUR",
      "BRIQUET",
      "PISTES (INTEMPERIES EXCLUES)",
      "ARRETS MECA. INSTALLATIONS FIXES",
      "TELESCOPAGE",
      "EXCAVATION PURE",
      "TERRASSEMENT PUR",
    ],
    exploitation: [
      "TOTAL",
      "HEURES COMPTEUR",
      "METRAGE FORE",
      "NOMBRE DE TROUS FORES",
      "NOMBRE DE VOYAGES",
      "NOMBRE D'ECAPAGES",
      "TONNAGE",
      "NOMBRE T.K.U",
    ],
    personnel: ["CONDUCTEUR", "GRAISSEUR", "MATRICULES"],
    travail: ["REPARTITION DU TEMPS DE TRAVAIL PAR", "CHANTIER", "TEMPS", "IMPUTATION", "POSTE"],
    machine: [
      "MARQUE",
      "N° DE SERIE",
      "TYPE",
      "DIAMETRE",
      "LIEU APPOINT",
      "INDEX COMPTEUR",
      "SOMME CONSOMMATION",
      "TRONCON",
      "DEPOSE",
      "CAUSE DE DEPOSE",
    ],
    causes_depose: [
      "1T CORPS USE",
      "T2 MOLETTES USEES",
      "T3 MOLETTES PERDUES",
      "T4 ROULEMENT CASSE",
      "T5 CORPS FISSURE",
      "T6 ROULEMENT COINCE",
      "T7 FILAGE ABIME",
      "T8 TRONCON PERDU",
      "QUANTITE DELIVREE",
    ],
  };

  const [formData, setFormData] = useState({
    unite: "",
    indexCompteur: "",
    shifts: ["", "", ""],
    ventilation: Array(data.ventilation.length).fill(""),
    bulls: ["", "", ""],
    repartitionTravail: Array(3).fill({ chantier: "", temps: "", imputation: "" }),
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, section: string, index?: number, field?: string) => {
    const { name, value } = e.target;

    setFormData(prevData => {
      if (section === 'shifts') {
        const newShifts = [...prevData.shifts];
        newShifts[index || 0] = value;
        return { ...prevData, shifts: newShifts };
      } else if (section === 'ventilation') {
        const newVentilation = [...prevData.ventilation];
        newVentilation[index || 0] = value;
        return { ...prevData, ventilation: newVentilation };
      } else if (section === 'bulls') {
        const newBulls = [...prevData.bulls];
        newBulls[index || 0] = value;
        return { ...prevData, bulls: newBulls };
      }
        else if (section === 'repartitionTravail' && field) {
          const newRepartition = [...prevData.repartitionTravail];
          if(index !== undefined){
              newRepartition[index] = {...newRepartition[index], [field]: value};
          }
          return {...prevData, repartitionTravail: newRepartition};
      }
      else if (section === 'tricone') {
          return {...prevData, tricone: {...prevData.tricone, [name]: value}};
      }
      else if (section === 'gasoil') {
          return {...prevData, gasoil: {...prevData.gasoil, [name]: value}};
      }
       else {
        return { ...prevData, [name]: value };
      }
    });
  };


  return (
    <Card className="bg-white rounded-lg p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0">
        <CardTitle className="text-xl font-bold text-gray-800">
          Rapport R0
        </CardTitle>
        <span className="text-sm text-gray-500">{currentDate}</span>
      </CardHeader>

      <CardContent className="p-0">
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Entête</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Unité</label>
              <Input
                type="text"
                name="unite"
                value={formData.unite}
                onChange={(e) => handleInputChange(e, "unite")}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Index Compteur</label>
              <Input
                type="text"
                name="indexCompteur"
                value={formData.indexCompteur}
                onChange={(e) => handleInputChange(e, "indexCompteur")}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Shifts</h3>
          <div className="grid grid-cols-3 gap-4">
            {formData.shifts.map((shift, index) => (
              <div key={index}>
                <label className="block text-gray-700 mb-2">{`${
                  index === 0 ? "1er" : index === 1 ? "2eme" : "3eme"
                } D`}</label>
                <Input
                  type="text"
                  value={shift}
                  onChange={(e) => handleInputChange(e, "shifts", index)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Ventilation</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Extérieurs</TableHead>
                <TableHead>Totaux</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.ventilation.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item}</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={formData.ventilation[index]}
                      onChange={(e) => handleInputChange(e, "ventilation", index)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Manque Bull</h3>
          <div className="grid grid-cols-3 gap-4">
            {formData.bulls.map((bull, index) => (
              <div key={index}>
                <label className="block text-gray-700 mb-2">{`${
                  index === 0 ? "1er" : index === 1 ? "2eme" : "3eme"
                } D`}</label>
                <Input
                  type="text"
                  value={bull}
                  onChange={(e) => handleInputChange(e, "bulls", index)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Répartition du temps de travail pur</h3>
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="mb-4">
                    <h4 className="font-semibold text-gray-700">Poste {index + 1}</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Chantier</label>
                            <Input
                                type="text"
                                value={formData.repartitionTravail[index]?.chantier || ''}
                                onChange={(e) => handleInputChange(e, 'repartitionTravail', index, 'chantier')}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Temps</label>
                            <Input
                                type="text"
                                value={formData.repartitionTravail[index]?.temps || ''}
                                onChange={(e) => handleInputChange(e, 'repartitionTravail', index, 'temps')}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Imputation</label>
                            <Input
                                type="text"
                                value={formData.repartitionTravail[index]?.imputation || ''}
                                onChange={(e) => handleInputChange(e, 'repartitionTravail', index, 'imputation')}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Suivi Consommation Tricone</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 mb-2">Posé</label>
                    <Input
                        type="text"
                        name="pose"
                        value={formData.tricone.pose}
                        onChange={(e) => handleInputChange(e, 'tricone')}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-2">Déposé</label>
                    <Input
                        type="text"
                        name="depose"
                        value={formData.tricone.depose}
                        onChange={(e) => handleInputChange(e, 'tricone')}
                    />
                </div>
            </div>
            <div>
                <label className="block text-gray-700 mb-2">Cause de Déposé</label>
                <Select onValueChange={(value) => handleInputChange({target: {name: 'causeDepose', value}} as any, 'tricone')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Cause" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.causes_depose.map((cause, index) => (
                      <SelectItem key={index} value={cause}>{cause}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
        </div>

        <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Gasoil</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-gray-700 mb-2">Lieu d'Appoint</label>
                    <Input
                        type="text"
                        name="lieuAppoint"
                        value={formData.gasoil.lieuAppoint}
                        onChange={(e) => handleInputChange(e, 'gasoil')}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-2">Index Compteur</label>
                    <Input
                        type="text"
                        name="indexCompteur"
                        value={formData.gasoil.indexCompteur}
                        onChange={(e) => handleInputChange(e, 'gasoil')}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-2">Quantité Délivrée</label>
                    <Input
                        type="text"
                        name="quantiteDelivree"
                        value={formData.gasoil.quantiteDelivree}
                        onChange={(e) => handleInputChange(e, 'gasoil')}
                    />
                </div>
            </div>
        </div>


        <Button>Enregistrer</Button>
      </CardContent>
    </Card>
  );
}
