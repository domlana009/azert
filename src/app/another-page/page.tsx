"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AnotherPage() {
  return (
    <div className="min-h-screen bg-f5f7fa">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Card className="bg-white rounded-lg p-6 mb-6">
          <CardHeader className="flex flex-col items-center pb-4 space-y-0">
            <CardTitle className="text-xl font-bold text-gray-800">
              Job Reporting - Another Page
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ENTREE</TableHead>
                    <TableHead>SECTEUR</TableHead>
                    <TableHead>RAPPORT (R°)</TableHead>
                    <TableHead>MACHINE / ENGINS</TableHead>
                    <TableHead>S.A</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>UNITE</TableCell>
                    <TableCell>INDEX COMPTEUR</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>1er D</TableCell>
                    <TableCell>2eme D</TableCell>
                    <TableCell>3eme D</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>6H30 F</TableCell>
                    <TableCell>14H30 F</TableCell>
                    <TableCell>22H30 F</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VENTILATION</TableHead>
                    <TableHead>TOTAUX</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>EXTERIEURS</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>121 ARRET CARREAU INDUSTRIEL</TableCell>
                    <TableCell>121</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      122 COUPURE GENERALE DU COURANT 7 15 23
                    </TableCell>
                    <TableCell>122</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>123 GREVE</TableCell>
                    <TableCell>123</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>124 INTEMPERIES</TableCell>
                    <TableCell>124</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>125 STOCKS PLEINS</TableCell>
                    <TableCell>125</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>126 J. FRERES OU HEBDOMADAIRES 8 16 24</TableCell>
                    <TableCell>126</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>128 ARRET PAR LA CENTRALE (ENERGIE)</TableCell>
                    <TableCell>128</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>230 CONTROLE</TableCell>
                    <TableCell>230</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>231 DEFAUT ELEC. (C. CRAME, RESEAU)</TableCell>
                    <TableCell>231</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>232 PANNE MECANIQUE 1</TableCell>
                    <TableCell>232</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>233 PANNE ELECTRIQUE</TableCell>
                    <TableCell>233</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>234 INTERVENTION ATELIER PNEUMATIQUE</TableCell>
                    <TableCell>234</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>235 ENTRETIEN SYSTEMATIQUE</TableCell>
                    <TableCell>235</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>236 APPOINT (HUILE, GAZOL, EAU) 10 18 2</TableCell>
                    <TableCell>236</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>237 GRAISSAGE</TableCell>
                    <TableCell>237</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>MATERIEL</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>238 ARRET ELEC. INSTALLATION FIXES</TableCell>
                    <TableCell>238</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>239 MANQUE CAMIONS</TableCell>
                    <TableCell>239</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>240 MANQUE BULL 11 19 3</TableCell>
                    <TableCell>240</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>241 MANQUE MECANICIEN</TableCell>
                    <TableCell>241</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>242 MANQUE OUTILS DE TRAVAIL</TableCell>
                    <TableCell>242</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>243 MACHINE A L'ARRET</TableCell>
                    <TableCell>243</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>244 PANNE ENGIN DEVANT MACHINE 12 20 4</TableCell>
                    <TableCell>244</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>EXPLOITATION</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>442 RELEVE</TableCell>
                    <TableCell>442</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>443 EXECUTION PLATE FORME</TableCell>
                    <TableCell>443</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>444 DEPLACEMENT</TableCell>
                    <TableCell>444</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>445 TIR ET SAUTAGE 13 21 5</TableCell>
                    <TableCell>445</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>446 MOUV. DE CABLE</TableCell>
                    <TableCell>446</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>448 ARRET DECIDE</TableCell>
                    <TableCell>448</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>449 MANQUE CONDUCTEUR</TableCell>
                    <TableCell>449</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>450 BRIQUET</TableCell>
                    <TableCell>450</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>451 PERTES (INTEMPERIES EXCLUES) 14 22 6</TableCell>
                    <TableCell>451</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>452 ARRETS MECA. INSTALLATIONS FIXES</TableCell>
                    <TableCell>452</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>453 TELESCOPAGE 15 23 7</TableCell>
                    <TableCell>453</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>452 EXCAVATION PURE</TableCell>
                    <TableCell>452</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>453 TERRASSEMENT PUR</TableCell>
                    <TableCell>453</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mb-6">
              <label className="block text-gray-600 text-sm mb-1">
                TOTAL
              </label>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>510 HEURES COMPTEUR</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>610 METRAGE FORE</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>620 NOMBRE DE TROUS FORES</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>630 NOMBRE DE VOYAGES</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>640 N° DECAPAGES</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>650 TONNAGE</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>660 NOMBRE T.K.J</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mb-6">
              <label className="block text-gray-600 text-sm mb-1">
                CONDUCTEUR | GRAISSEUR | MATRICULES
              </label>
              <Input type="text" />
            </div>

            <div className="mb-6">
              <label className="block text-gray-600 text-sm mb-1">
                REPARTITION DU TEMPS DE TRAVAIL PUR
              </label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>1er Poste</TableHead>
                    <TableHead>CHANTIER</TableHead>
                    <TableHead>TEMPS</TableHead>
                    <TableHead>IMPUTATION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell><Input type="text" /></TableCell>
                    <TableCell><Input type="text" /></TableCell>
                    <TableCell><Input type="text" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>2eme Poste</TableHead>
                    <TableHead>CHANTIER</TableHead>
                    <TableHead>TEMPS</TableHead>
                    <TableHead>IMPUTATION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell><Input type="text" /></TableCell>
                    <TableCell><Input type="text" /></TableCell>
                    <TableCell><Input type="text" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>3eme Poste</TableHead>
                    <TableHead>CHANTIER</TableHead>
                    <TableHead>TEMPS</TableHead>
                    <TableHead>IMPUTATION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell><Input type="text" /></TableCell>
                    <TableCell><Input type="text" /></TableCell>
                    <TableCell><Input type="text" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mb-6">
              <label className="block text-gray-600 text-sm mb-1">
                SUIVI CONSOMMATION TRICONE
              </label>
              <p className="text-gray-700">
                POSÉ | DÉPOSÉ | CAUSE DE DÉPOSÉ :
              </p>
              <p className="text-gray-700">
                T1 CORPS USE T2 MOLLETTES USEES T3 MOLLETTES PERDUES T4
                ROULEMENT CASSE T5 CORPS FISSURE T6 ROULEMENT COINCE T7 FILAGE
                ABIME T8 TRICONE PERDU
              </p>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>MARQUE</TableCell>
                    <TableCell><Input type="text" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>N° DE SERIE</TableCell>
                    <TableCell><Input type="text" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TYPE</TableCell>
                    <TableCell><Input type="text" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>DIAMETRE</TableCell>
                    <TableCell><Input type="text" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>INDEX COMPTEUR : _________</TableCell>
                    <TableCell><Input type="text" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mb-6">
              <label className="block text-gray-600 text-sm mb-1">GASOIL</label>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>LIEU D'APPOINT : _________</TableCell>
                    <TableCell><Input type="text" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>INDEX COMPTEUR : _________</TableCell>
                    <TableCell><Input type="text" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>QUANTITE DELIVREE : _________</TableCell>
                    <TableCell><Input type="text" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
