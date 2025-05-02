"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea

interface TruckTrackingProps {
  selectedDate: Date; // Changed prop name and kept type as Date
}

type Poste = "1er" | "2ème" | "3ème";

// Updated Poste times and order
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
    counts: string[]; // Array for 15 counts
    tSud: string;
    tNord: string;
    stock: string;
    total: string; // Should this be calculated?
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
  arretsExplication: string; // Added field for stop explanations
}


export function TruckTracking({ selectedDate }: TruckTrackingProps) { // Updated prop name
  const [selectedPoste, setSelectedPoste] = useState<Poste>("1er"); // Default to 1er Poste
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    direction: "phosboucraa",
    division: "Extraction",
    oibEe: "",
    mine: "",
    sortie: "",
    distance: "",
    qualite: "",
    machineEngins: "",
    arretsExplication: "", // Initialize explanation field
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
      total: "", // Should this be calculated?
      hour: "",
      location: "",
    },
  ]);

    // Format date string once using the selectedDate prop
    const formattedDate = selectedDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const handleGeneralInfoChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, // Allow Textarea
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
        total: "",
        hour: "",
        location: "",
      },
    ]);
  };

 const updateTruckData = (
    id: string,
    field: keyof Omit<TruckData, 'id' | 'counts'> | 'counts', // Allow 'counts' specifically
    value: string,
    countIndex?: number // Only needed if field is 'counts'
  ) => {
    setTruckData(prevData =>
      prevData.map(truck => {
        if (truck.id === id) {
          if (field === 'counts' && countIndex !== undefined) {
            const newCounts = [...truck.counts];
            newCounts[countIndex] = value;
            return { ...truck, counts: newCounts };
          } else if (field !== 'counts') {
             // Create a temporary mutable copy for type safety
             let mutableTruck: Partial<TruckData> = { ...truck };
             // Assign value using the field name as key
             (mutableTruck as any)[field] = value;
             // Return the updated object
             return mutableTruck as TruckData;
          }
        }
        return truck;
      })
    );
  };


   const deleteTruck = (id: string) => {
        setTruckData(truckData.filter(truck => truck.id !== id));
    };

  // Example calculation for total (sum of counts, tSud, tNord, stock)
    const calculateTotal = (truck: TruckData): string => {
        const countsSum = truck.counts.reduce((acc, count) => acc + (parseInt(count, 10) || 0), 0);
        const tSudNum = parseInt(truck.tSud, 10) || 0;
        const tNordNum = parseInt(truck.tNord, 10) || 0;
        const stockNum = parseInt(truck.stock, 10) || 0;
        return (countsSum + tSudNum + tNordNum + stockNum).toString();
    };

    // Update total whenever relevant fields change
    // This could be done within updateTruckData or using useEffect
    // For simplicity, let's display the calculated total directly in the table


  return (
    <Card className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-xl font-bold">
          POINTAGE DES CAMIONS
        </CardTitle>
        {/* Display the formatted date from the prop */}
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </CardHeader>

      <CardContent className="p-0 space-y-6"> {/* Added space-y-6 */}

        {/* Poste Selection */}
         <div className="space-y-2">
            <Label className="text-foreground">Poste</Label>
            <RadioGroup
              value={selectedPoste} // Controlled component
              onValueChange={(value: Poste) => setSelectedPoste(value)}
              className="flex flex-wrap space-x-4 pt-2"
            >
              {POSTE_ORDER.map((poste) => ( // Use defined order
                <div key={poste} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={poste} id={`truck-poste-${poste}`} />
                  <Label htmlFor={`truck-poste-${poste}`} className="font-normal text-foreground">
                    {poste} Poste <span className="text-muted-foreground text-xs">({POSTE_TIMES[poste]})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>


        <div className="space-y-3"> {/* Replaced mb-6 with space-y-3 */}
          <h3 className="font-medium text-gray-700 dark:text-gray-300">
            Informations Générales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="direction" className="block text-muted-foreground text-sm mb-1">
                Direction
              </Label>
              <Input id="direction" name="direction" type="text" value={generalInfo.direction} onChange={(e) => handleGeneralInfoChange(e, 'direction')} className="h-9"/>
            </div>
            <div>
              <Label htmlFor="division" className="block text-muted-foreground text-sm mb-1">
                Division
              </Label>
              <Input id="division" name="division" type="text" value={generalInfo.division} onChange={(e) => handleGeneralInfoChange(e, 'division')} className="h-9"/>
            </div>
            <div>
              <Label htmlFor="oib-ee" className="block text-muted-foreground text-sm mb-1">OIB/EE</Label>
              <Input id="oib-ee" name="oibEe" type="text" value={generalInfo.oibEe} onChange={(e) => handleGeneralInfoChange(e, 'oibEe')} className="h-9"/>
            </div>
            <div>
              <Label htmlFor="mine" className="block text-muted-foreground text-sm mb-1">Mine</Label>
              <Input id="mine" name="mine" type="text" value={generalInfo.mine} onChange={(e) => handleGeneralInfoChange(e, 'mine')} className="h-9"/>
            </div>
            <div>
              <Label htmlFor="sortie" className="block text-muted-foreground text-sm mb-1">Sortie</Label>
              <Input id="sortie" name="sortie" type="text" value={generalInfo.sortie} onChange={(e) => handleGeneralInfoChange(e, 'sortie')} className="h-9"/>
            </div>
            <div>
              <Label htmlFor="distance" className="block text-muted-foreground text-sm mb-1">
                Distance
              </Label>
              <Input id="distance" name="distance" type="text" value={generalInfo.distance} onChange={(e) => handleGeneralInfoChange(e, 'distance')} className="h-9"/>
            </div>
            <div>
              <Label htmlFor="qualite" className="block text-muted-foreground text-sm mb-1">
                Qualité
              </Label>
              <Input id="qualite" name="qualite" type="text" value={generalInfo.qualite} onChange={(e) => handleGeneralInfoChange(e, 'qualite')} className="h-9"/>
            </div>
             <div className="md:col-span-2">
              <Label htmlFor="machine-engins-track" className="block text-muted-foreground text-sm mb-1">
                Machine ou Engins
              </Label>
              <Input id="machine-engins-track" name="machineEngins" type="text" value={generalInfo.machineEngins} onChange={(e) => handleGeneralInfoChange(e, 'machineEngins')} className="h-9"/>
            </div>
          </div>
        </div>

         {/* Section: Explication des Arrêts */}
         <div className="space-y-2">
             <Label htmlFor="truck-arrets-explication" className="font-medium text-gray-700 dark:text-gray-300">Explication des Arrêts (si applicable)</Label>
             <Textarea
                id="truck-arrets-explication"
                name="arretsExplication"
                placeholder="Expliquez ici les arrêts éventuels ayant impacté le pointage..."
                value={generalInfo.arretsExplication}
                onChange={(e) => handleGeneralInfoChange(e, 'arretsExplication')}
                className="min-h-[80px]" // Adjusted height
             />
        </div>

        <div className="space-y-3"> {/* Replaced mb-6 with space-y-3 */}
          <h3 className="font-medium text-gray-700 dark:text-gray-300">
            Tableau de Pointage
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground sticky left-0 bg-muted/50 z-10 w-[80px]">
                    N° Camion
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground sticky left-[80px] bg-muted/50 z-10 w-[150px]">
                    Conducteur
                  </TableHead>
                  {/* Count Headers */}
                  {Array.from({ length: 15 }, (_, i) => (
                    <TableHead
                      key={i}
                      className="p-2 text-center text-xs font-medium text-muted-foreground w-[50px]"
                    >
                      {i + 1}
                    </TableHead>
                  ))}
                  {/* Summary Headers */}
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground w-[60px]">
                    T.sud
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground w-[60px]">
                    T.nord
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground w-[60px]">
                    Stock
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground w-[70px] font-semibold">
                    Total
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground w-[70px]">
                    Heure
                  </TableHead>
                  <TableHead className="p-2 text-center text-xs font-medium text-muted-foreground w-[80px]">
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
                    {/* Sticky Truck Number */}
                    <TableCell className="p-1 sticky left-0 bg-card hover:bg-muted/50 z-10">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm min-w-[60px]"
                        value={truck.truckNumber}
                        onChange={(e) =>
                          updateTruckData(truck.id, "truckNumber", e.target.value)
                        }
                      />
                    </TableCell>
                    {/* Sticky Driver */}
                     <TableCell className="p-1 sticky left-[80px] bg-card hover:bg-muted/50 z-10">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm min-w-[130px]"
                        value={truck.driver}
                        onChange={(e) =>
                          updateTruckData(truck.id, "driver", e.target.value)
                        }
                      />
                    </TableCell>
                    {/* Count Inputs */}
                    {truck.counts.map((count, i) => (
                      <TableCell key={i} className="p-1">
                        <Input
                          type="text" // Use type="number" for better input validation?
                          inputMode="numeric" // Hint for mobile keyboards
                          className="w-full h-8 text-sm text-center min-w-[40px]"
                          value={count}
                          onChange={(e) =>
                            updateTruckData(truck.id, "counts", e.target.value, i)
                          }
                        />
                      </TableCell>
                    ))}
                    {/* Summary Inputs */}
                    <TableCell className="p-1">
                      <Input
                        type="text" inputMode="numeric"
                        className="w-full h-8 text-sm text-center min-w-[50px]"
                        value={truck.tSud}
                        onChange={(e) =>
                          updateTruckData(truck.id, "tSud", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="text" inputMode="numeric"
                        className="w-full h-8 text-sm text-center min-w-[50px]"
                        value={truck.tNord}
                        onChange={(e) =>
                          updateTruckData(truck.id, "tNord", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="text" inputMode="numeric"
                        className="w-full h-8 text-sm text-center min-w-[50px]"
                        value={truck.stock}
                        onChange={(e) =>
                          updateTruckData(truck.id, "stock", e.target.value)
                        }
                      />
                    </TableCell>
                    {/* Calculated Total (Read Only) */}
                     <TableCell className="p-1 font-semibold text-center align-middle">
                         {calculateTotal(truck)}
                       {/* Or use a read-only input
                       <Input
                        type="text"
                        className="w-full h-8 text-sm text-center min-w-[60px] bg-muted/70 font-semibold"
                        value={calculateTotal(truck)}
                        readOnly
                        tabIndex={-1} // Prevent tabbing into read-only
                      /> */}
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="text" // Consider type="time"?
                        className="w-full h-8 text-sm text-center min-w-[60px]"
                        value={truck.hour}
                        onChange={(e) =>
                          updateTruckData(truck.id, "hour", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm text-center min-w-[70px]"
                        value={truck.location}
                        onChange={(e) =>
                          updateTruckData(truck.id, "location", e.target.value)
                        }
                      />
                    </TableCell>
                     {/* Delete Button */}
                     <TableCell className="p-1 sticky right-0 bg-card hover:bg-muted/50 z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                            onClick={() => deleteTruck(truck.id)}
                            >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            <span className="sr-only">Supprimer Camion</span>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {truckData.length === 0 && (
                     <tr>
                        <td colSpan={21} className="text-center text-muted-foreground p-4">
                            Aucun camion ajouté. Cliquez sur "+ Ajouter Camion" pour commencer.
                        </td>
                    </tr>
                )}
              </TableBody>
               {/* Add a footer for column totals if needed */}
                 {/* <TableFooter>
                    <TableRow>
                       <TableCell colSpan={2} className="font-semibold sticky left-0 bg-muted/80 z-10">Total</TableCell>
                       {Array.from({ length: 15 }).map((_, i) => <TableCell key={`foot-count-${i}`} className="text-center font-semibold">Sum {i+1}</TableCell>)}
                       <TableCell className="text-center font-semibold">Sum Sud</TableCell>
                       <TableCell className="text-center font-semibold">Sum Nord</TableCell>
                       <TableCell className="text-center font-semibold">Sum Stock</TableCell>
                       <TableCell className="text-center font-semibold">Grand Total</TableCell>
                       <TableCell colSpan={2}></TableCell>
                       <TableCell className="sticky right-0 bg-muted/80 z-10"></TableCell>
                    </TableRow>
                 </TableFooter> */}
            </Table>
          </div>
            <Button onClick={addTruck} variant="outline" size="sm" className="mt-4"> {/* Added margin-top */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus mr-2 h-4 w-4"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Ajouter Camion
            </Button>
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline">Enregistrer</Button>
          <Button>Soumettre</Button>
        </div>
      </CardContent>
    </Card>
  );
}