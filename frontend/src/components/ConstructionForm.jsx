import React, { useState } from 'react';
import { Plus, Trash2, Package, Hammer, PaintBucket, Home } from 'lucide-react';

/**
 * Formulaire dynamique de saisie des données de chantier
 */
function ConstructionForm({ projectId, onCalculationsComplete }) {
  const [activeTab, setActiveTab] = useState('maconnerie');
  const [calculations, setCalculations] = useState({
    maconnerie: [],
    beton: [],
    fers: [],
    toiture: null,
    peinture: null,
    carrelage: null,
  });

  // États pour les formulaires
  const [murForm, setMurForm] = useState({ longueur: '', hauteur: epaisseur: '0.20', marge: '5' });
  const [betonForm, setBetonForm] = useState({ type: 'dalle', longueur: '', largeur: '', hauteur: '' });
  const [fersForm, setFersForm] = useState({ surface: '', longueur: '', largeur: '', diametre: '10', espacement: '20', nappes: '2' });
  const [toitureForm, setToitureForm] = useState({ longueur: '', largeur: '', pente: '0', longueurTole: '3', debord: '0.5' });
  const [peintureForm, setPeintureForm] = useState({ surface: '', pouvoirCouvrant: '10', couches: '2' });
  const [carrelageForm, setCarrelageForm] = useState({ surface: '', rendementColle: '5' });

  const tabs = [
    { id: 'maconnerie', label: 'Maçonnerie', icon: Package },
    { id: 'beton', label: 'Béton', icon: Hammer },
    { id: 'fers', label: 'Fers à Béton', icon: Package },
    { id: 'toiture', label: 'Toiture', icon: Home },
    { id: 'peinture', label: 'Peinture', icon: PaintBucket },
    { id: 'carrelage', label: 'Carrelage', icon: Package },
  ];

  // Calculer maçonnerie
  const handleCalculerMaconnerie = async () => {
    if (!murForm.longueur || !murForm.hauteur) return;
    
    try {
      const response = await fetch('/api/calculations/maconnerie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...murForm,
          longueur: parseFloat(murForm.longueur),
          hauteur: parseFloat(murForm.hauteur),
          epaisseur: parseFloat(murForm.epaisseur),
          marge: parseFloat(murForm.marge),
          projectId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCalculations(prev => ({
          ...prev,
          maconnerie: [...prev.maconnerie, data.data]
        }));
        setMurForm({ longueur: '', hauteur: '', epaisseur: '0.20', marge: '5' });
      }
    } catch (error) {
      console.error('Erreur calcul maçonnerie:', error);
    }
  };

  // Calculer béton
  const handleCalculerBeton = async () => {
    if (!betonForm.longueur || !betonForm.largeur || !betonForm.hauteur) return;
    
    try {
      const response = await fetch('/api/calculations/beton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...betonForm,
          longueur: parseFloat(betonForm.longueur),
          largeur: parseFloat(betonForm.largeur),
          hauteur: parseFloat(betonForm.hauteur),
          projectId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCalculations(prev => ({
          ...prev,
          beton: [...prev.beton, data.data]
        }));
        setBetonForm({ type: 'dalle', longueur: '', largeur: '', hauteur: '' });
      }
    } catch (error) {
      console.error('Erreur calcul béton:', error);
    }
  };

  // Supprimer un calcul
  const removeCalculation = (category, index) => {
    setCalculations(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Saisie des Données de Chantier
      </h3>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-[300px]">
        {/* Maçonnerie */}
        {activeTab === 'maconnerie' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Longueur (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={murForm.longueur}
                  onChange={(e) => setMurForm({ ...murForm, longueur: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: 5.50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hauteur (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={murForm.hauteur}
                  onChange={(e) => setMurForm({ ...murForm, hauteur: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: 3.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Épaisseur (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={murForm.epaisseur}
                  onChange={(e) => setMurForm({ ...murForm, epaisseur: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Marge (%)
                </label>
                <input
                  type="number"
                  value={murForm.marge}
                  onChange={(e) => setMurForm({ ...murForm, marge: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="5"
                />
              </div>
            </div>
            
            <button
              onClick={handleCalculerMaconnerie}
              className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Calculer les besoins
            </button>

            {/* Résultats */}
            {calculations.maconnerie.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-slate-700">Murs calculés:</h4>
                {calculations.maconnerie.map((result, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Surface:</span>
                          <p className="font-medium">{result.surfaceMur} m²</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Parpaings:</span>
                          <p className="font-medium">{result.nombreParpaings} pcs</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Ciment:</span>
                          <p className="font-medium">{result.sacsCiment} sacs</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Sable:</span>
                          <p className="font-medium">{result.volumeSable} m³</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCalculation('maconnerie', idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Béton */}
        {activeTab === 'beton' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={betonForm.type}
                  onChange={(e) => setBetonForm({ ...betonForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="dalle">Dalle</option>
                  <option value="poteau">Poteau</option>
                  <option value="semelle">Semelle</option>
                  <option value="poutre">Poutre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Longueur (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={betonForm.longueur}
                  onChange={(e) => setBetonForm({ ...betonForm, longueur: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Largeur (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={betonForm.largeur}
                  onChange={(e) => setBetonForm({ ...betonForm, largeur: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hauteur (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={betonForm.hauteur}
                  onChange={(e) => setBetonForm({ ...betonForm, hauteur: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
            </div>
            
            <button
              onClick={handleCalculerBeton}
              className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
            >
              Calculer le béton
            </button>
          </div>
        )}

        {/* Autres onglets - à implémenter de manière similaire */}
        {['fers', 'toiture', 'peinture', 'carrelage'].includes(activeTab) && (
          <div className="text-center py-12 text-slate-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Module en cours de développement</p>
            <p className="text-sm mt-2">Utilisez le calculateur backend via l'API</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConstructionForm;
