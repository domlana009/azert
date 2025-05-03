"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface TruckTrackingProps {
  selectedDate: Date;
}

type Poste = "1er" | "2ème" | "3ème";

const POSTE_TIMES: Record<Poste, string> = {
  "3ème": "22:30 - 06:30",
  "1er": "06:30 - 14:30",
  "2ème": "14:30 - 22:30",
};
const POSTE_ORDER: Poste[] = ["3ème", "1er", "2ème"];

interface TruckData {
    id: string;
    truckNumber: string;
    driver: string;
    counts: string[];
    tSud: string;
    tNord: string;
    stock: string;
    total: string;
    hour: string;
    location: string;
}

interface GeneralInfo {
  direction: string;
  division: string;
  oibEe: string;
  mine: string;
  sortie: string;
  distance: string;
  qualite: string;
  machineEngins: string;
  arretsExplication: string;
}


export function TruckTracking({ selectedDate }: TruckTrackingProps) {
  const [selectedPoste, setSelectedPoste] = useState<Poste>("1er");
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    direction: "phosboucraa",
    division: "Extraction",
    oibEe: "",
    mine: "",
    sortie: "",
    distance: "",
    qualite: "",
    machineEngins: "",
    arretsExplication: "",
  });

  const [truckData, setTruckData] = useState<TruckData[]>([
    {
      id: crypto.randomUUID(),
      truckNumber: "",
      driver: "",
      counts: Array(15).fill(""),
      tSud: "",
      tNord: "",
      stock: "",
      total: "0", // Initialize total as string '0'
      hour: "",
      location: "",
    },
  ]);

    const formattedDate = selectedDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const handleGeneralInfoChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: keyof GeneralInfo
    ) => {
        setGeneralInfo(prev => ({ ...prev, [field]: e.target.value }));
    };

  const addTruck = () => {
    setTruckData([
      ...truckData,
      {
        id: crypto.randomUUID(),
        truckNumber: "",
        driver: "",
        counts: Array(15).fill(""),
        tSud: "",
        tNord: "",
        stock: "",
        total: "0", // Initialize total as string '0'
        hour: "",
        location: "",
      },
    ]);
  };

 const updateTruckData = (
    id: string,
    field: keyof Omit<TruckData, 'id' | 'total'>, // Allow counts here
    value: string,
    countIndex?: number
  ) => {
    setTruckData(prevData =>
      prevData.map(truck => {
        if (truck.id === id) {
           let updatedTruck = { ...truck };
          if (field === 'counts' && countIndex !== undefined && countIndex >= 0 && countIndex < 15) {
            const newCounts = [...truck.counts];
            newCounts[countIndex] = value;
            updatedTruck.counts = newCounts; // Assign updated counts array
          } else if (field !== 'counts') {
             // Type assertion to bypass TypeScript error
             (updatedTruck as any)[field] = value;
          }
           updatedTruck.total = calculateTotal(updatedTruck);
           return updatedTruck;
        }
        return truck;
      })
    );
  };


   const deleteTruck = (id: string) => {
        setTruckData(truckData.filter(truck => truck.id !== id));
    };

    const calculateTotal = (truck: TruckData): string => {
        const countsSum = truck.counts.reduce((acc, count) => {
            const num = parseInt(count, 10);
            return acc + (isNaN(num) ? 0 : num);
        }, 0);
        const tSudNum = parseInt(truck.tSud, 10);
        const tNordNum = parseInt(truck.tNord, 10);
        const stockNum = parseInt(truck.stock, 10);
        return (
            countsSum +
            (isNaN(tSudNum) ? 0 : tSudNum) +
            (isNaN(tNordNum) ? 0 : tNordNum) +
            (isNaN(stockNum) ? 0 : stockNum)
        ).toString();
    };


  return (
    <Card className="bg-card text-card-foreground rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-lg sm:text-xl font-bold">
          POINTAGE DES CAMIONS
        </CardTitle>
        <span className="text-xs sm:text-sm text-muted-foreground">{formattedDate}</span>
      </CardHeader>

      <CardContent className="p-0 space-y-6">

         <div className="space-y-2">
            <Label className="text-foreground text-xs sm:text-sm">Poste</Label>
            <RadioGroup
              value={selectedPoste}
              onValueChange={(value: Poste) => setSelectedPoste(value)}
              className="flex flex-wrap space-x-4 pt-2"
            >
              {POSTE_ORDER.map((poste) => (
                <div key={poste} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={poste} id={`truck-poste-${poste}`} />
                  <Label htmlFor={`truck-poste-${poste}`} className="font-normal text-foreground text-xs sm:text-sm">
                    {poste} Poste <span className="text-muted-foreground text-xs">({POSTE_TIMES[poste]})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>


        <div className="space-y-3 p-4 border rounded-lg">
          <h3 className="font-semibold text-base sm:text-lg text-foreground">
            Informations Générales
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="direction" className="block text-muted-foreground text-xs sm:text-sm mb-1">
                Direction
              </Label>
              <Input id="direction" name="direction" type="text" value={generalInfo.direction} onChange={(e) => handleGeneralInfoChange(e, 'direction')} className="h-8 sm:h-9 text-xs sm:text-sm"/>
            </div>
            <div>
              <Label htmlFor="division" className="block text-muted-foreground text-xs sm:text-sm mb-1">
                Division
              </Label>
              <Input id="division" name="division" type="text" value={generalInfo.division} onChange={(e) => handleGeneralInfoChange(e, 'division')} className="h-8 sm:h-9 text-xs sm:text-sm"/>
            </div>
            <div>
              <Label htmlFor="oib-ee" className="block text-muted-foreground text-xs sm:text-sm mb-1">OIB/EE</Label>
              <Input id="oib-ee" name="oibEe" type="text" value={generalInfo.oibEe} onChange={(e) => handleGeneralInfoChange(e, 'oibEe')} className="h-8 sm:h-9 text-xs sm:text-sm"/>
            </div>
            <div>
              <Label htmlFor="mine" className="block text-muted-foreground text-xs sm:text-sm mb-1">Mine</Label>
              <Input id="mine" name="mine" type="text" value={generalInfo.mine} onChange={(e) => handleGeneralInfoChange(e, 'mine')} className="h-8 sm:h-9 text-xs sm:text-sm"/>
            </div>
            <div>
              <Label htmlFor="sortie" className="block text-muted-foreground text-xs sm:text-sm mb-1">Sortie</Label>
              <Input id="sortie" name="sortie" type="text" value={generalInfo.sortie} onChange={(e) => handleGeneralInfoChange(e, 'sortie')} className="h-8 sm:h-9 text-xs sm:text-sm"/>
            </div>
            <div>
              <Label htmlFor="distance" className="block text-muted-foreground text-xs sm:text-sm mb-1">
                Distance
              </Label>
              <Input id="distance" name="distance" type="text" value={generalInfo.distance} onChange={(e) => handleGeneralInfoChange(e, 'distance')} className="h-8 sm:h-9 text-xs sm:text-sm"/>
            </div>
            <div>
              <Label htmlFor="qualite" className="block text-muted-foreground text-xs sm:text-sm mb-1">
                Qualité
              </Label>
              <Input id="qualite" name="qualite" type="text" value={generalInfo.qualite} onChange={(e) => handleGeneralInfoChange(e, 'qualite')} className="h-8 sm:h-9 text-xs sm:text-sm"/>
            </div>
             <div className="sm:col-span-2 md:col-span-1"> {/* Adjusted span for better layout */}
              <Label htmlFor="machine-engins-track" className="block text-muted-foreground text-xs sm:text-sm mb-1">
                Machine ou Engins
              </Label>
              <Input id="machine-engins-track" name="machineEngins" type="text" value={generalInfo.machineEngins} onChange={(e) => handleGeneralInfoChange(e, 'machineEngins')} className="h-8 sm:h-9 text-xs sm:text-sm"/>
            </div>
          </div>
        </div>

         <div className="space-y-2 p-4 border rounded-lg">
             <Label htmlFor="truck-arrets-explication" className="font-semibold text-base sm:text-lg text-foreground">Explication des Arrêts (si applicable)</Label>
             <Textarea
                id="truck-arrets-explication"
                name="arretsExplication"
                placeholder="Expliquez ici les arrêts éventuels ayant impacté le pointage..."
                value={generalInfo.arretsExplication}
                onChange={(e) => handleGeneralInfoChange(e, 'arretsExplication')}
                className="min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm"
             />
        </div>

        <div className="space-y-3 p-4 border rounded-lg">
          <h3 className="font-semibold text-base sm:text-lg text-foreground">
            Tableau de Pointage
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground sticky left-0 bg-muted/50 z-10 min-w-[80px]">
                    N° Camion
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground sticky left-[80px] bg-muted/50 z-10 min-w-[120px]">
                    Conducteur
                  </TableHead>
                  {Array.from({ length: 15 }, (_, i) => (
                    <TableHead
                      key={i}
                      className="p-2 text-center text-xs font-medium text-muted-foreground min-w-[45px] w-[45px]"
                    >
                      {i + 1}
                    </TableHead>
                  ))}
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground min-w-[60px] w-[60px]">
                    T.sud
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground min-w-[60px] w-[60px]">
                    T.nord
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground min-w-[60px] w-[60px]">
                    Stock
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground min-w-[70px] w-[70px] font-semibold">
                    Total
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground min-w-[70px] w-[70px]">
                    Heure
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground min-w-[80px] w-[80px]">
                    Lieu
                  </TableHead>
                   <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground sticky right-0 bg-muted/50 z-10 w-[50px]">
                    {/* Actions */}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {truckData.map((truck) => (
                  <TableRow key={truck.id} className="border-b hover:bg-muted/50 h-10">
                    <TableCell className="p-1 sticky left-0 bg-card hover:bg-muted/50 z-10">
                      <Input
                        type="text"
                        className="w-full h-8 text-xs sm:text-sm min-w-[60px]"
                        value={truck.truckNumber}
                        onChange={(e) =>
                          updateTruckData(truck.id, "truckNumber", e.target.value)
                        }
                      />
                    </TableCell>
                     <TableCell className="p-1 sticky left-[80px] bg-card hover:bg-muted/50 z-10">
                      <Input
                        type="text"
                        className="w-full h-8 text-xs sm:text-sm min-w-[100px]"
                        value={truck.driver}
                        onChange={(e) =>
                          updateTruckData(truck.id, "driver", e.target.value)
                        }
                      />
                    </TableCell>
                    {truck.counts.map((count, i) => (
                      <TableCell key={i} className="p-1">
                        <Input
                          type="text"
                          inputMode="numeric"
                          className="w-full h-8 text-xs sm:text-sm text-center min-w-[35px]"
                          value={count}
                          onChange={(e) =>
                            updateTruckData(truck.id, "counts", e.target.value, i)
                          }
                        />
                      </TableCell>
                    ))}
                    <TableCell className="p-1">
                      <Input
                        type="text" inputMode="numeric"
                        className="w-full h-8 text-xs sm:text-sm text-center min-w-[50px]"
                        value={truck.tSud}
                        onChange={(e) =>
                          updateTruckData(truck.id, "tSud", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="text" inputMode="numeric"
                        className="w-full h-8 text-xs sm:text-sm text-center min-w-[50px]"
                        value={truck.tNord}
                        onChange={(e) =>
                          updateTruckData(truck.id, "tNord", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="text" inputMode="numeric"
                        className="w-full h-8 text-xs sm:text-sm text-center min-w-[50px]"
                        value={truck.stock}
                        onChange={(e) =>
                          updateTruckData(truck.id, "stock", e.target.value)
                        }
                      />
                    </TableCell>
                     <TableCell className="p-1 font-semibold text-center align-middle text-xs sm:text-sm">
                         {truck.total}
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="text"
                        className="w-full h-8 text-xs sm:text-sm text-center min-w-[60px]"
                        value={truck.hour}
                        onChange={(e) =>
                          updateTruckData(truck.id, "hour", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="text"
                        className="w-full h-8 text-xs sm:text-sm text-center min-w-[70px]"
                        value={truck.location}
                        onChange={(e) =>
                          updateTruckData(truck.id, "location", e.target.value)
                        }
                      />
                    </TableCell>
                     <TableCell className="p-1 sticky right-0 bg-card hover:bg-muted/50 z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
                            onClick={() => deleteTruck(truck.id)}
                            >
                             <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer Camion</span>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {truckData.length === 0 && (
                     <tr>
                        <td colSpan={22} className="text-center text-muted-foreground p-4 text-xs sm:text-sm">
                            Aucun camion ajouté. Cliquez sur "+ Ajouter Camion" pour commencer.
                        </td>
                    </tr>
                )}
              </TableBody>
            </Table>
          </div>
            <Button onClick={addTruck} variant="outline" size="sm" className="mt-4" type="button">
                <Plus className="mr-2 h-4 w-4"/>
                Ajouter Camion
            </Button>
        </div>
        <div className="mt-8 flex justify-end space-x-2 sm:space-x-3">
          <Button variant="outline" type="button" size="sm">Enregistrer</Button>
          <Button type="submit" size="sm">Soumettre</Button>
        </div>
      </CardContent>
    </Card>
  );
}
