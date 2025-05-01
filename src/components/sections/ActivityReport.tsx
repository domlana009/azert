
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ActivityReportProps {
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

interface Stop {
  id: string;
  duration: string;
  nature: string;
  hm: string;
  ha: string;
}

interface Counter {
    id: string;
    post: string;
    start: string;
    end: string;
    total: string;
}

export function ActivityReport({ currentDate }: ActivityReportProps) {
  const [selectedPoste, setSelectedPoste] = useState<Poste>("1er"); // Default to 1er Poste

  const [stops, setStops] = useState<Stop[]>([
    { id: crypto.randomUUID(), duration: "4:1o", nature: "Manque Produit", hm: "66H", ha: "17H" },
    {
      id: crypto.randomUUID(),
      duration: "4:1v",
      nature: "Attent Saturation SiCo",
      hm: "55",
      ha: "15H",
    },
  ]);

  const [counters, setCounters] = useState<Counter[]>([
    { id: crypto.randomUUID(), post: "Poste3", start: "93h41r", end: "9395,30", total: "0:45" },
  ]);

  const addStop = () => {
    setStops([...stops, { id: crypto.randomUUID(), duration: "", nature: "", hm: "", ha: "" }]);
  };

  const addCounter = () => {
    setCounters([...counters, { id: crypto.randomUUID(), post: "", start: "", end: "", total: "" }]);
  };

  const deleteStop = (id: string) => {
    setStops(stops.filter(stop => stop.id !== id));
  };

  const deleteCounter = (id: string) => {
    setCounters(counters.filter(counter => counter.id !== id));
  };

 const updateStop = (id: string, field: keyof Omit<Stop, 'id'>, value: string) => {
    setStops(stops.map(stop => stop.id === id ? { ...stop, [field]: value } : stop));
 };

 const updateCounter = (id: string, field: keyof Omit<Counter, 'id'>, value: string) => {
    setCounters(counters.map(counter => counter.id === id ? { ...counter, [field]: value } : counter));
 };


  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0 border-b dark:border-gray-700 mb-6">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
          RAPPORT D'ACTIVITÉ TNR
        </CardTitle>
        <span className="text-sm text-gray-500 dark:text-gray-400">{currentDate}</span>
      </CardHeader>

      <CardContent className="p-0">
         {/* Poste Selection */}
         <div className="mb-6 space-y-2">
            <Label className="text-foreground dark:text-gray-300">Poste</Label>
            <RadioGroup
              value={selectedPoste} // Controlled component
              onValueChange={(value: Poste) => setSelectedPoste(value)}
              className="flex flex-wrap space-x-4 pt-2"
            >
              {POSTE_ORDER.map((poste) => ( // Use defined order
                <div key={poste} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={poste} id={`activity-poste-${poste}`} />
                  <Label htmlFor={`activity-poste-${poste}`} className="font-normal text-foreground dark:text-gray-300">
                    {poste} Poste <span className="text-muted-foreground dark:text-gray-400 text-xs">({POSTE_TIMES[poste]})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Arrêts</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Durée
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Nature
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    HM
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    HA
                  </th>
                  <th className="p-2 text-right text-sm font-medium text-gray-600 dark:text-gray-400 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {stops.map((stop) => (
                  <tr key={stop.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-24 h-8 text-sm"
                        value={stop.duration}
                        onChange={(e) =>
                          updateStop(stop.id, "duration", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={stop.nature}
                        onChange={(e) =>
                          updateStop(stop.id, "nature", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-20 h-8 text-sm"
                        value={stop.hm}
                        onChange={(e) => updateStop(stop.id, "hm", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-20 h-8 text-sm"
                        value={stop.ha}
                        onChange={(e) => updateStop(stop.id, "ha", e.target.value)}
                      />
                    </td>
                    <td className="p-2 text-right">
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStop(stop.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash className="h-4 w-4" />
                         <span className="sr-only">Supprimer</span>
                      </Button>
                    </td>
                  </tr>
                ))}
                 {stops.length === 0 && (
                    <tr className="border-b dark:border-gray-700">
                        <td colSpan={5} className="text-center text-muted-foreground dark:text-gray-500 p-4">
                            Aucun arrêt ajouté.
                        </td>
                    </tr>
                 )}
              </tbody>
            </table>
          </div>
          <Button variant="link" onClick={addStop} className="text-primary dark:text-blue-400 text-sm mt-2 p-0 h-auto">
            + Ajouter Arrêt
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Compteurs Vibreurs</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Poste
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Début
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Fin
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total
                  </th>
                  <th className="p-2 text-right text-sm font-medium text-gray-600 dark:text-gray-400 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {counters.map((counter) => (
                  <tr key={counter.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={counter.post}
                        onChange={(e) =>
                          updateCounter(counter.id, "post", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-full h-8 text-sm"
                        value={counter.start}
                        onChange={(e) =>
                          updateCounter(counter.id, "start", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                         className="w-full h-8 text-sm"
                        value={counter.end}
                        onChange={(e) =>
                          updateCounter(counter.id, "end", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                         className="w-24 h-8 text-sm"
                        value={counter.total}
                        onChange={(e) =>
                          updateCounter(counter.id, "total", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2 text-right">
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCounter(counter.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </td>
                  </tr>
                ))}
                 {counters.length === 0 && (
                    <tr className="border-b dark:border-gray-700">
                        <td colSpan={5} className="text-center text-muted-foreground dark:text-gray-500 p-4">
                            Aucun compteur ajouté.
                        </td>
                    </tr>
                 )}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <Button variant="link" className="text-primary dark:text-blue-400 text-sm p-0 h-auto" onClick={addCounter}>
              + Ajouter Vibreur
            </Button>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                Total Vibreurs:
              </span>
              <Input type="text" className="w-24 h-8 text-sm" defaultValue="06H55" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Stock</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">PARK 1</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">
                    NORMAL
                  </label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">
                    OCEANE
                  </label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">
                    PB30
                  </label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">PARK 2</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">
                    NORMAL
                  </label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">
                    OCEANE
                  </label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">
                    PB30
                  </label>
                  <Input type="text" className="h-8 text-sm"/>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">
                  Poste
                </label>
                <Input type="text" className="h-8 text-sm" defaultValue="3+1+2" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline">Enregistrer</Button>
          <Button>Soumettre</Button>
        </div>
      </CardContent>
    </Card>
  );
}
