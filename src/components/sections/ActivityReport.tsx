"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ActivityReportProps {
  currentDate: string;
}

export function ActivityReport({ currentDate }: ActivityReportProps) {
  const [stops, setStops] = useState([
    { duration: "4:1o", nature: "Manque Produit", hm: "66H", ha: "17H" },
    {
      duration: "4:1v",
      nature: "Attent Saturation SiCo",
      hm: "55",
      ha: "15H",
    },
  ]);

  const [counters, setCounters] = useState([
    { post: "Poste3", start: "93h41r", end: "9395,30", total: "0:45" },
  ]);

  const addStop = () => {
    setStops([...stops, { duration: "", nature: "", hm: "", ha: "" }]);
  };

  const addCounter = () => {
    setCounters([...counters, { post: "", start: "", end: "", total: "" }]);
  };

  const deleteStop = (index: number) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const deleteCounter = (index: number) => {
    const newCounters = [...counters];
    newCounters.splice(index, 1);
    setCounters(newCounters);
  };

  const updateStop = (index: number, field: string, value: string) => {
    const newStops = [...stops];
    newStops[index][field] = value;
    setStops(newStops);
  };

  const updateCounter = (index: number, field: string, value: string) => {
    const newCounters = [...counters];
    newCounters[index][field] = value;
    setCounters(newCounters);
  };

  return (
    <Card className="bg-white rounded-lg p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0">
        <CardTitle className="text-xl font-bold text-gray-800">
          RAPPORT D'ACTIVITÉ TNB
        </CardTitle>
        <span className="text-sm text-gray-500">{currentDate}</span>
      </CardHeader>

      <CardContent className="p-0">
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Arrêts</h3>
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
                {stops.map((stop, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-20"
                        value={stop.duration}
                        onChange={(e) =>
                          updateStop(index, "duration", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={stop.nature}
                        onChange={(e) =>
                          updateStop(index, "nature", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-20"
                        value={stop.hm}
                        onChange={(e) => updateStop(index, "hm", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        className="w-20"
                        value={stop.ha}
                        onChange={(e) => updateStop(index, "ha", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        onClick={() => deleteStop(index)}
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
          <Button variant="link" onClick={addStop} className="text-blue-500 text-sm mt-2">
            Ajouter Arrêt
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Compteurs Vibreurs</h3>
          <div className="table-responsive">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    Poste
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    Début
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    Fin
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600">
                    Total
                  </th>
                  <th className="p-2 text-left text-sm font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {counters.map((counter, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <Input
                        type="text"
                        value={counter.post}
                        onChange={(e) =>
                          updateCounter(index, "post", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={counter.start}
                        onChange={(e) =>
                          updateCounter(index, "start", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={counter.end}
                        onChange={(e) =>
                          updateCounter(index, "end", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={counter.total}
                        onChange={(e) =>
                          updateCounter(index, "total", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        onClick={() => deleteCounter(index)}
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
          <div className="mt-2 flex justify-between items-center">
            <Button variant="link" className="text-blue-500 text-sm" onClick={addCounter}>
              Ajouter Vibreur
            </Button>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                Total Vibreurs:
              </span>
              <Input type="text" className="w-24" defaultValue="06H55" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Stock</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">PARK 1</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-600 text-xs mb-1">
                    NORMAL
                  </label>
                  <Input type="text" />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs mb-1">
                    OCEANE
                  </label>
                  <Input type="text" />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs mb-1">
                    PB30
                  </label>
                  <Input type="text" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">PARK 2</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-600 text-xs mb-1">
                    NORMAL
                  </label>
                  <Input type="text" />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs mb-1">
                    OCEANE
                  </label>
                  <Input type="text" />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs mb-1">
                    PB30
                  </label>
                  <Input type="text" />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-gray-600 text-xs mb-1">
                  Poste
                </label>
                <Input type="text" defaultValue="3+1+2" />
              </div>
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
