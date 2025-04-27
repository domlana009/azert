"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const updateStop = (module: number, index: number, field: string, value: string) => {
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
    <Card className="bg-white rounded-lg p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0">
        <CardTitle className="text-xl font-bold text-gray-800">
          RAPPORT JOURNALIER
        </CardTitle>
        <span className="text-sm text-gray-500">{currentDate}</span>
      </CardHeader>

      <CardContent className="p-0">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Site</label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USINE SUD">USINE SUD</SelectItem>
              <SelectItem value="USINE NORD">USINE NORD</SelectItem>
              <SelectItem value="USINE CENTRALE">USINE CENTRALE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700">Module 1</h3>
            <Button variant="link" className="text-blue-500 text-sm" onClick={() => addStop(1)}>
              Ajouter Arrêt
            </Button>
          </div>

          <div className="table-responsive">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    Durée
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    Nature
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    HM
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    HA
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {module1Stops.map((stop, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-20"
                        value={stop.duration}
                        onChange={(e) =>
                          updateStop(1, index, "duration", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={stop.nature}
                        onChange={(e) =>
                          updateStop(1, index, "nature", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-20"
                        value={stop.hm}
                        onChange={(e) => updateStop(1, index, "hm", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-20"
                        value={stop.ha}
                        onChange={(e) => updateStop(1, index, "ha", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        onClick={() => deleteStop(1, index)}
                        className="text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700">Module 2</h3>
            <Button variant="link" className="text-blue-500 text-sm" onClick={() => addStop(2)}>
              Ajouter Arrêt
            </Button>
          </div>

          <div className="table-responsive">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    Durée
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    Nature
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    HM
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    HA
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {module2Stops.map((stop, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-20"
                        value={stop.duration}
                        onChange={(e) =>
                          updateStop(2, index, "duration", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={stop.nature}
                        onChange={(e) =>
                          updateStop(2, index, "nature", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-20"
                        value={stop.hm}
                        onChange={(e) => updateStop(2, index, "hm", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-20"
                        value={stop.ha}
                        onChange={(e) => updateStop(2, index, "ha", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        onClick={() => deleteStop(2, index)}
                        className="text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">Totaux</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Module 1 HM
              </label>
              <Input type="text" defaultValue="σ·6·H·20" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Module 1 HA
              </label>
              <Input type="text" defaultValue="A7·H·40" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Module 2 HM
              </label>
              <Input type="text" defaultValue="A6·H·5.5" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Module 2 HA
              </label>
              <Input type="text" defaultValue="σ·7·H·0.5" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary">Enregistrer</Button>
          <Button>Soumettre</Button>
        </div>
      </CardContent>
    </Card>
  );
}
