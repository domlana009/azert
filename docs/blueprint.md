# **App Name**: ReportZen

## Core Features:

- Tabbed Navigation: Tab-based navigation to switch between Daily Report, Activity Report, and Truck Tracking sections.
- Daily Report Form: Form input and display for daily reports including dropdowns, text inputs, and tables for data entry.
- Dynamic Data Tables: Interactive tables for activity and truck tracking reports, allowing dynamic addition/removal of entries.

## Style Guidelines:

- Primary color: Use the existing blue (#3498db) for main interactive elements and the header.
- Secondary color: Keep the green (#2ecc71) for secondary actions and success indicators.
- Accent color: A muted gold (#E5B843) can provide a touch of sophistication.
- Maintain the current font ('Segoe UI', Tahoma, Geneva, Verdana, sans-serif) for consistency and readability.
- Ensure a responsive layout that adapts well to different screen sizes, maintaining the container's max-w-3xl on larger screens.
- Continue using Font Awesome icons for a consistent and recognizable visual language.

## Original User Request:
edit thet

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Reporting App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #3498db;
            --secondary: #2ecc71;
            --dark: #2c3e50;
            --light: #ecf0f1;
            --danger: #e74c3c;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
        }
        
        .nav-tab.active {
            border-bottom: 3px solid var(--primary);
            color: var(--primary);
            font-weight: 600;
        }
        
        .card {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }
        
        .card:hover {
            transform: translateY(-2px);
        }
        
        .btn-primary {
            background-color: var(--primary);
            color: white;
        }
        
        .btn-secondary {
            background-color: var(--secondary);
            color: white;
        }
        
        .badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
        
        .badge-primary {
            background-color: var(--primary);
            color: white;
        }
        
        .badge-danger {
            background-color: var(--danger);
            color: white;
        }
        
        .table-responsive {
            overflow-x: auto;
        }
        
        .sticky-header {
            position: sticky;
            top: 0;
            background-color: white;
            z-index: 10;
        }
        
        .form-control {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 8px 12px;
        }
        
        .select-control {
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 10px center;
            background-size: 1em;
        }
    </style>
</head>
<body class="min-h-screen">
    <div class="container mx-auto px-4 py-6 max-w-3xl">
        <!-- Header -->
        <header class="mb-8">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Job Reporting</h1>
                    <p class="text-gray-600">Application de rapport quotidien</p>
                </div>
                <div class="flex items-center space-x-4">
                    <button class="p-2 rounded-full bg-gray-200 text-gray-700">
                        <i class="fas fa-bell"></i>
                    </button>
                    <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        <span>JD</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Navigation Tabs -->
        <div class="flex border-b mb-6">
            <button class="nav-tab active px-4 py-2 font-medium" data-tab="daily-report">
                <i class="fas fa-file-alt mr-2"></i>Rapport Journalier
            </button>
            <button class="nav-tab px-4 py-2 font-medium" data-tab="activity-report">
                <i class="fas fa-chart-line mr-2"></i>Activité TNB
            </button>
            <button class="nav-tab px-4 py-2 font-medium" data-tab="truck-tracking">
                <i class="fas fa-truck mr-2"></i>Pointage Camions
            </button>
        </div>

        <!-- Tab Content -->
        <div id="tab-content">
            <!-- Daily Report Tab -->
            <div id="daily-report" class="tab-panel active">
                <div class="card bg-white rounded-lg p-6 mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-gray-800">RAPPORT JOURNALIER</h2>
                        <span class="text-sm text-gray-500">31/01/2025</span>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Site</label>
                        <select class="form-control select-control w-full">
                            <option>USINE SUD</option>
                            <option>USINE NORD</option>
                            <option>USINE CENTRALE</option>
                        </select>
                    </div>
                    
                    <div class="mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="font-medium text-gray-700">Module 1</h3>
                            <button class="text-blue-500 text-sm"><i class="fas fa-plus mr-1"></i>Ajouter Arrêt</button>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="w-full border-collapse">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">Durée</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">Nature</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">HM</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">HA</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="border-b">
                                        <td class="p-2"><input type="text" class="form-control w-20" value="A1·20"></td>
                                        <td class="p-2"><input type="text" class="form-control" value="Marque produit d'agissant steril"></td>
                                        <td class="p-2"><input type="text" class="form-control w-20" value="6H·20"></td>
                                        <td class="p-2"><input type="text" class="form-control w-20" value="A1·40"></td>
                                        <td class="p-2"><button class="text-red-500"><i class="fas fa-trash"></i></button></td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="p-2"><input type="text" class="form-control w-20" value="A2·20"></td>
                                        <td class="p-2"><input type="text" class="form-control"></td>
                                        <td class="p-2"><input type="text" class="form-control w-20"></td>
                                        <td class="p-2"><input type="text" class="form-control w-20"></td>
                                        <td class="p-2"><button class="text-red-500"><i class="fas fa-trash"></i></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="font-medium text-gray-700">Module 2</h3>
                            <button class="text-blue-500 text-sm"><i class="fas fa-plus mr-1"></i>Ajouter Arrêt</button>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="w-full border-collapse">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">Durée</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">Nature</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">HM</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">HA</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="border-b">
                                        <td class="p-2"><input type="text" class="form-control w-20" value="σ·40"></td>
                                        <td class="p-2"><input type="text" class="form-control" value="Lancement Vol. G3"></td>
                                        <td class="p-2"><input type="text" class="form-control w-20" value="A6·H·5.5"></td>
                                        <td class="p-2"><input type="text" class="form-control w-20" value="σ·5.5"></td>
                                        <td class="p-2"><button class="text-red-500"><i class="fas fa-trash"></i></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-medium text-gray-700 mb-3">Totaux</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">Module 1 HM</label>
                                <input type="text" class="form-control" value="σ·6·H·20">
                            </div>
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">Module 1 HA</label>
                                <input type="text" class="form-control" value="A7·H·40">
                            </div>
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">Module 2 HM</label>
                                <input type="text" class="form-control" value="A6·H·5.5">
                            </div>
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">Module 2 HA</label>
                                <input type="text" class="form-control" value="σ·7·H·0.5">
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex justify-end space-x-3">
                        <button class="btn-secondary px-4 py-2 rounded-lg">
                            <i class="fas fa-save mr-2"></i>Enregistrer
                        </button>
                        <button class="btn-primary px-4 py-2 rounded-lg">
                            <i class="fas fa-paper-plane mr-2"></i>Soumettre
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Activity Report Tab -->
            <div id="activity-report" class="tab-panel hidden">
                <div class="card bg-white rounded-lg p-6 mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-gray-800">RAPPORT D'ACTIVITÉ TNB</h2>
                        <span class="text-sm text-gray-500">31/01/2025</span>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="font-medium text-gray-700 mb-2">Arrêts</h3>
                        <div class="table-responsive">
                            <table class="w-full border-collapse">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">Durée</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">Nature</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">HM</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">HA</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="border-b">
                                        <td class="p-2"><input type="text" class="form-control w-20" value="4:1o"></td>
                                        <td class="p-2"><input type="text" class="form-control" value="Manque Produit"></td>
                                        <td class="p-2"><input type="text" class="form-control w-20" value="66H"></td>
                                        <td class="p-2"><input type="text" class="form-control w-20" value="17H"></td>
                                        <td class="p-2"><button class="text-red-500"><i class="fas fa-trash"></i></button></td>
                                    </tr>
                                    <tr class="border-b">
                                        <td class="p-2"><input type="text" class="form-control w-20" value="4:1v"></td>
                                        <td class="p-2"><input type="text" class="form-control" value="Attent Saturation SiCo"></td>
                                        <td class="p-2"><input type="text" class="form-control w-20" value="55"></td>
                                        <td class="p-2"><input type="text" class="form-control w-20" value="15H"></td>
                                        <td class="p-2"><button class="text-red-500"><i class="fas fa-trash"></i></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <button class="text-blue-500 text-sm mt-2"><i class="fas fa-plus mr-1"></i>Ajouter Arrêt</button>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="font-medium text-gray-700 mb-2">Compteurs Vibreurs</h3>
                        <div class="table-responsive">
                            <table class="w-full border-collapse">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">Poste</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">Début</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">Fin</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600">Total</th>
                                        <th class="p-2 text-left text-sm font-medium text-gray-600"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="border-b">
                                        <td class="p-2"><input type="text" class="form-control" value="Poste3"></td>
                                        <td class="p-2"><input type="text" class="form-control" value="93h41r"></td>
                                        <td class="p-2"><input type="text" class="form-control" value="9395,30"></td>
                                        <td class="p-2"><input type="text" class="form-control" value="0:45"></td>
                                        <td class="p-2"><button class="text-red-500"><i class="fas fa-trash"></i></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-2 flex justify-between items-center">
                            <button class="text-blue-500 text-sm"><i class="fas fa-plus mr-1"></i>Ajouter Vibreur</button>
                            <div class="flex items-center">
                                <span class="text-sm text-gray-600 mr-2">Total Vibreurs:</span>
                                <input type="text" class="form-control w-24" value="06H55">
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="font-medium text-gray-700 mb-2">Stock</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <h4 class="font-medium text-gray-700 mb-2">PARK 1</h4>
                                <div class="grid grid-cols-3 gap-2">
                                    <div>
                                        <label class="block text-gray-600 text-xs mb-1">NORMAL</label>
                                        <input type="text" class="form-control">
                                    </div>
                                    <div>
                                        <label class="block text-gray-600 text-xs mb-1">OCEANE</label>
                                        <input type="text" class="form-control">
                                    </div>
                                    <div>
                                        <label class="block text-gray-600 text-xs mb-1">PB30</label>
                                        <input type="text" class="form-control">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <h4 class="font-medium text-gray-700 mb-2">PARK 2</h4>
                                <div class="grid grid-cols-3 gap-2">
                                    <div>
                                        <label class="block text-gray-600 text-xs mb-1">NORMAL</label>
                                        <input type="text" class="form-control">
                                    </div>
                                    <div>
                                        <label class="block text-gray-600 text-xs mb-1">OCEANE</label>
                                        <input type="text" class="form-control">
                                    </div>
                                    <div>
                                        <label class="block text-gray-600 text-xs mb-1">PB30</label>
                                        <input type="text" class="form-control">
                                    </div>
                                </div>
                                <div class="mt-2">
                                    <label class="block text-gray-600 text-xs mb-1">Poste</label>
                                    <input type="text" class="form-control" value="3+1+2">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex justify-end space-x-3">
                        <button class="btn-secondary px-4 py-2 rounded-lg">
                            <i class="fas fa-save mr-2"></i>Enregistrer
                        </button>
                        <button class="btn-primary px-4 py-2 rounded-lg">
                            <i class="fas fa-paper-plane mr-2"></i>Soumettre
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Truck Tracking Tab -->
            <div id="truck-tracking" class="tab-panel hidden">
                <div class="card bg-white rounded-lg p-6 mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-gray-800">POINTAGE DES CAMIONS</h2>
                        <span class="text-sm text-gray-500">31/01/2025</span>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="font-medium text-gray-700 mb-3">Informations Générales</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">Direction</label>
                                <input type="text" class="form-control" value="phosboucraa">
                            </div>
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">Division</label>
                                <input type="text" class="form-control" value="Extraction">
                            </div>
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">OIB/EE</label>
                                <input type="text" class="form-control">
                            </div>
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">Mine</label>
                                <input type="text" class="form-control">
                            </div>
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">Sortie</label>
                                <input type="text" class="form-control">
                            </div>
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">Distance</label>
                                <input type="text" class="form-control">
                            </div>
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">Qualité</label>
                                <input type="text" class="form-control">
                            </div>
                            <div>
                                <label class="block text-gray-600 text-sm mb-1">Machine ou Engins</label>
                                <input type="text" class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="font-medium text-gray-700 mb-3">Tableau de Pointage</h3>
                        <div class="table-responsive">
                            <table class="w-full border-collapse">
                                <thead class="bg-gray-100 sticky-header">
                                    <tr>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">N° Camion</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">Conducteur</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">1</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">2</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">3</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">4</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">5</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">6</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">7</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">8</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">9</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">10</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">11</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">12</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">13</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">14</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">15</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">T.sud</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">T.nord</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">Stock</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">Total</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">Heure</th>
                                        <th class="p-2 text-center text-sm font-medium text-gray-600">Lieu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="border-b">
                                        <td class="p-2"><input type="text" class="form-control w-16"></td>
                                        <td class="p-2"><input type="text" class="form-control"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td class="p-2"><input type="text" class="form-control w-10"></td>
                                        <td
</html>
  