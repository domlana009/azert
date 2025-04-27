"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AnotherPage() {
  return (
    <div className="min-h-screen bg-f5f7fa">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Card className="bg-white rounded-lg p-6 mb-6">
          <CardHeader className="flex flex-col items-center pb-4 space-y-0">
            <CardTitle className="text-xl font-bold text-gray-800">
              Machine/Engins Report
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  ENTREE | SECTEUR | RAPPORT (R°) | MACHINE / ENGINS | S.A
                </label>
                <Input type="text" placeholder="Enter details" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  UNITE | INDEX COMPTEUR
                </label>
                <Input type="text" placeholder="Enter details" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  1er D | 6H30 F
                </label>
                <Input type="text" placeholder="Enter details" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  2eme D | 14H30 F
                </label>
                <Input type="text" placeholder="Enter details" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  3eme D | 22H30 F
                </label>
                <Input type="text" placeholder="Enter details" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  VENTILATION
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter ventilation details"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  TOTAUX EXTERIEURS
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter totals details"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  121 ARRET CARREAU INDUSTRIEL
                </label>
                <Input type="text" placeholder="Enter details" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  122 COUPURE GENERALE DU COURANT
                </label>
                <Input type="text" placeholder="Enter details" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  123 GREVE
                </label>
                <Input type="text" placeholder="Enter details" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                CONDUCTEUR | GRAISSEUR | MATRICULES
              </label>
              <Input type="text" placeholder="Enter details" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                REPARTITION DU TEMPS DE TRAVAIL PUR
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter repartition details"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                SUIVI CONSOMMATION TRICONE
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter suivi consommation details"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                GASOIL
              </label>
              <Input type="text" placeholder="Enter details" />
            </div>

            <div className="flex justify-end">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
              >
                Submit
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
