import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Package, Calculator, Upload } from 'lucide-react';

// Import des composants (à créer)
const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-slate-800 mb-6">Tableau de Bord</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            <FileText className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Devis en cours</p>
            <p className="text-2xl font-bold text-slate-800">12</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Package className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Projets actifs</p>
            <p className="text-2xl font-bold text-slate-800">8</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Calculator className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Calculs ce mois</p>
            <p className="text-2xl font-bold text-slate-800">45</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProjectsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Projets</h1></div>;
const QuotesPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Devis</h1></div>;
const ProductsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Catalogue Produits</h1></div>;
const CalculationsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Calculateur BTP</h1></div>;

function App() {
  const navigation = [
    { name: 'Tableau de Bord', href: '/', icon: LayoutDashboard },
    { name: 'Projets', href: '/projects', icon: FileText },
    { name: 'Devis', href: '/quotes', icon: FileText },
    { name: 'Produits', href: '/products', icon: Package },
    { name: 'Calculateur', href: '/calculations', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - cachée sur mobile */}
      <aside className="no-print fixed inset-y-0 left-0 w-64 bg-slate-900 text-white hidden lg:block">
        <div className="p-6">
          <h1 className="text-xl font-bold">Smart-Métré</h1>
          <p className="text-xs text-slate-400 mt-1">Quincaillerie BTP</p>
        </div>
        
        <nav className="mt-6 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Navigation mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="flex justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex flex-col items-center py-2 px-3 text-xs text-slate-600 hover:text-primary-600"
              >
                <Icon className="h-5 w-5 mb-1" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="lg:ml-64 pb-20 lg:pb-6">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800 lg:hidden">Smart-Métré</h2>
            <div className="flex items-center gap-4 ml-auto">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Nouveau Projet</span>
              </button>
            </div>
          </div>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/calculations" element={<CalculationsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
