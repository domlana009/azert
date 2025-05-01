
"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DailyReportProps {
  currentDate: string;
}

interface ModuleStop {
  duration: string;
  nature: string;
  hm: string;
  ha: string;
}

export function DailyReport({ currentDate }: DailyReportProps) {
  const [module1Stops, setModule1Stops] = useState<ModuleStop[]>([
    {
      duration: "A1·20",
      nature: "Marque produit d'agissant steril",
      hm: "6H·20",
      ha: "A1·40",
    },
    { duration: "A2·20", nature: "", hm: "", ha: "" },
  ]);
  const [module2Stops, setModule2Stops] = useState<ModuleStop[]>([
    { duration: "σ·40", nature: "Lancement Vol. G3", hm: "A6·H·5.5", ha: "σ·5.5" },
  ]);

  const addStop = (module: number) => {
    if (module === 1) {
      setModule1Stops([...module1Stops, { duration: "", nature: "", hm: "", ha: "" }]);
    } else {
      setModule2Stops([...module2Stops, { duration: "", nature: "", hm: "", ha: "" }]);
    }
  };

  const deleteStop = (module: number, index: number) => {
    if (module === 1) {
      const newStops = [...module1Stops];
      newStops.splice(index, 1);
      setModule1Stops(newStops);
    } else {
      const newStops = [...module2Stops];
      newStops.splice(index, 1);
      setModule2Stops(newStops);
    }
  };

  const updateStop = (module: number, index: number, field: keyof ModuleStop, value: string) => {
    if (module === 1) {
      const newStops = [...module1Stops];
      newStops[index][field] = value;
      setModule1Stops(newStops);
    } else {
      const newStops = [...module2Stops];
      newStops[index][field] = value;
      setModule2Stops(newStops);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b mb-6">
        <CardTitle className="text-xl font-bold text-foreground">
          RAPPORT JOURNALIER (Activité TSUD)
        </CardTitle>
        <span className="text-sm text-muted-foreground">{currentDate}</span>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="site-select" className="text-foreground">Site</Label>
          <Select>
            <SelectTrigger id="site-select" className="w-full">
              <SelectValue placeholder="Select Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USINE SUD">USINE SUD</SelectItem>
              <SelectItem value="USINE NORD">USINE NORD</SelectItem>
              <SelectItem value="USINE CENTRALE">USINE CENTRALE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Module 1 Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-card">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-foreground">Module 1</h3>
            <Button variant="link" className="text-primary text-sm p-0 h-auto" onClick={() => addStop(1)}>
              + Ajouter Arrêt
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[100px]">
                    Durée
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                    Nature
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[100px]">
                    HM
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[100px]">
                    HA
                  </TableHead>
                  <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {module1Stops.map((stop, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.duration}
                        onChange={(e) =>
                          updateStop(1, index, "duration", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.nature}
                        onChange={(e) =>
                          updateStop(1, index, "nature", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.hm}
                        onChange={(e) => updateStop(1, index, "hm", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.ha}
                        onChange={(e) => updateStop(1, index, "ha", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="p-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStop(1, index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {module1Stops.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground p-4">
                            Aucun arrêt ajouté pour le Module 1.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Module 2 Section */}
         <div className="space-y-4 p-4 border rounded-lg bg-card">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-foreground">Module 2</h3>
            <Button variant="link" className="text-primary text-sm p-0 h-auto" onClick={() => addStop(2)}>
              + Ajouter Arrêt
            </Button>
          </div>

          <div className="overflow-x-auto">
             <Table>
               <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[100px]">
                    Durée
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground">
                    Nature
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[100px]">
                    HM
                  </TableHead>
                  <TableHead className="p-2 text-left text-sm font-medium text-muted-foreground w-[100px]">
                    HA
                  </TableHead>
                  <TableHead className="p-2 text-right text-sm font-medium text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {module2Stops.map((stop, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.duration}
                        onChange={(e) =>
                          updateStop(2, index, "duration", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.nature}
                        onChange={(e) =>
                          updateStop(2, index, "nature", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.hm}
                        onChange={(e) => updateStop(2, index, "hm", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.ha}
                        onChange={(e) => updateStop(2, index, "ha", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="p-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStop(2, index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash className="h-4 w-4" />
                         <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {module2Stops.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground p-4">
                            Aucun arrêt ajouté pour le Module 2.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Totaux Section */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold text-lg text-foreground mb-4">Totaux</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label htmlFor="total-m1-hm" className="text-sm text-muted-foreground">
                Module 1 HM
              </Label>
              <Input id="total-m1-hm" type="text" defaultValue="σ·6·H·20" className="h-9"/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="total-m1-ha" className="text-sm text-muted-foreground">
                Module 1 HA
              </Label>
              <Input id="total-m1-ha" type="text" defaultValue="A7·H·40" className="h-9"/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="total-m2-hm" className="text-sm text-muted-foreground">
                Module 2 HM
              </Label>
              <Input id="total-m2-hm" type="text" defaultValue="A6·H·5.5" className="h-9"/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="total-m2-ha" className="text-sm text-muted-foreground">
                Module 2 HA
              </Label>
              <Input id="total-m2-ha" type="text" defaultValue="σ·7·H·0.5" className="h-9"/>
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

    