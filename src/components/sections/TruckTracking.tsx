"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TruckTrackingProps {
  currentDate: string;
}

export function TruckTracking({ currentDate }: TruckTrackingProps) {
  const [truckData, setTruckData] = useState([
    {
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

  const addTruck = () => {
    setTruckData([
      ...truckData,
      {
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
    index: number,
    field: string,
    value: string | string[],
    countIndex?: number
  ) => {
    const newTruckData = [...truckData];
    if (field === "counts" && countIndex !== undefined) {
      (newTruckData[index].counts as string[])[countIndex] = value as string;
    } else {
      newTruckData[index][field] = value as string;
    }
    setTruckData(newTruckData);
  };

  return (
    <Card className="bg-white rounded-lg p-6 mb-6">
      <CardHeader className="flex flex-row justify-between items-center pb-4 space-y-0">
        <CardTitle className="text-xl font-bold text-gray-800">
          POINTAGE DES CAMIONS
        </CardTitle>
        <span className="text-sm text-gray-500">{currentDate}</span>
      </CardHeader>

      <CardContent className="p-0">
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">
            Informations Générales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Direction
              </label>
              <Input type="text" defaultValue="phosboucraa" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Division
              </label>
              <Input type="text" defaultValue="Extraction" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">OIB/EE</label>
              <Input type="text" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Mine</label>
              <Input type="text" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Sortie</label>
              <Input type="text" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Distance
              </label>
              <Input type="text" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Qualité
              </label>
              <Input type="text" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Machine ou Engins
              </label>
              <Input type="text" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">
            Tableau de Pointage
          </h3>
          <div className="table-responsive">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-2 text-center text-sm font-medium text-gray-600">
                    N° Camion
                  </TableHead>
                  <TableHead className="p-2 text-center text-sm font-medium text-gray-600">
                    Conducteur
                  </TableHead>
                  {Array.from({ length: 15 }, (_, i) => (
                    <TableHead
                      key={i}
                      className="p-2 text-center text-sm font-medium text-gray-600"
                    >
                      {i + 1}
                    </TableHead>
                  ))}
                  <TableHead className="p-2 text-center text-sm font-medium text-gray-600">
                    T.sud
                  </TableHead>
                  <TableHead className="p-2 text-center text-sm font-medium text-gray-600">
                    T.nord
                  </TableHead>
                  <TableHead className="p-2 text-center text-sm font-medium text-gray-600">
                    Stock
                  </TableHead>
                  <TableHead className="p-2 text-center text-sm font-medium text-gray-600">
                    Total
                  </TableHead>
                  <TableHead className="p-2 text-center text-sm font-medium text-gray-600">
                    Heure
                  </TableHead>
                  <TableHead className="p-2 text-center text-sm font-medium text-gray-600">
                    Lieu
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {truckData.map((truck, index) => (
                  <TableRow key={index} className="border-b">
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-16"
                        value={truck.truckNumber}
                        onChange={(e) =>
                          updateTruckData(index, "truckNumber", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        value={truck.driver}
                        onChange={(e) =>
                          updateTruckData(index, "driver", e.target.value)
                        }
                      />
                    </TableCell>
                    {truck.counts.map((count, i) => (
                      <TableCell key={i} className="p-2">
                        <Input
                          type="text"
                          className="w-10"
                          value={count}
                          onChange={(e) =>
                            updateTruckData(index, "counts", e.target.value, i)
                          }
                        />
                      </TableCell>
                    ))}
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-10"
                        value={truck.tSud}
                        onChange={(e) =>
                          updateTruckData(index, "tSud", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-10"
                        value={truck.tNord}
                        onChange={(e) =>
                          updateTruckData(index, "tNord", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-10"
                        value={truck.stock}
                        onChange={(e) =>
                          updateTruckData(index, "stock", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-10"
                        value={truck.total}
                        onChange={(e) =>
                          updateTruckData(index, "total", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-10"
                        value={truck.hour}
                        onChange={(e) =>
                          updateTruckData(index, "hour", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        className="w-10"
                        value={truck.location}
                        onChange={(e) =>
                          updateTruckData(index, "location", e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <Button onClick={addTruck}>Add Truck</Button>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary">Enregistrer</Button>
          <Button>Soumettre</Button>
        </div>
      </CardContent>
    </Card>
  );
}
