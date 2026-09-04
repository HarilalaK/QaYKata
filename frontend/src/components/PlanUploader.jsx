import React, { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { visionService } from '../services/api';

/**
 * Composant d'upload et d'analyse de plans par IA
 */
function PlanUploader({ projectId, onAnalysisComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Gestion de la sélection de fichier
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validation du type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez JPEG, PNG, GIF ou PDF.');
      return;
    }
    
    // Validation de la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux. Maximum 10MB.');
      return;
    }
    
    setError(null);
    setSelectedFile(file);
    
    // Création de l'URL de prévisualisation
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Conversion fichier en base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Upload et analyse du plan
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Conversion en base64 pour l'analyse
      const base64Image = await fileToBase64(selectedFile);
      
      // Analyse avec l'IA Vision
      setIsAnalyzing(true);
      const response = await visionService.analyzeUpload(
        base64Image.split(',')[1], // Enlever le prefix data:image/...
        projectId,
        'gpt-4o'
      );
      
      setAnalysisResult(response.data);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }
      
    } catch (err) {
      console.error('Erreur lors de l\'analyse:', err);
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'analyse');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Analyse de Plan par IA
      </h3>
      
      {/* Zone d'upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Télécharger un plan ou une photo de chantier
        </label>
        
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-primary-500 transition-colors cursor-pointer bg-slate-50">
          <div className="space-y-1 text-center">
            {previewUrl ? (
              <div className="relative">
                {selectedFile?.type.includes('pdf') ? (
                  <FileText className="mx-auto h-32 w-24 text-slate-400" />
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Aperçu" 
                    className="mx-auto h-48 object-contain rounded"
                  />
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600 justify-center">
                  <span className="relative cursor-pointer bg-slate-50 rounded-md font-medium text-primary-600 hover:text-primary-500">
                    Téléverser un fichier
                  </span>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-slate-500">
                  PNG, JPG, GIF jusqu'à 10MB
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="sr-only"
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            disabled={isUploading || isAnalyzing}
          />
        </div>
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {/* Bouton d'analyse */}
      {selectedFile && !analysisResult && (
        <button
          onClick={handleUploadAndAnalyze}
          disabled={isUploading || isAnalyzing}
          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyse en cours...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Analyser le plan avec l'IA</span>
            </>
          )}
        </button>
      )}
      
      {/* Résultat de l'analyse */}
      {analysisResult && analysisResult.success && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Analyse terminée avec succès</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Type de plan:</span>
              <p className="font-medium text-slate-800 capitalize">
                {analysisResult.data.planType?.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <span className="text-slate-600">Confiance IA:</span>
              <p className="font-medium text-slate-800">
                {(analysisResult.data.confidence * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <span className="text-slate-600">Pièces détectées:</span>
              <p className="font-medium text-slate-800">
                {analysisResult.data.pieces?.length || 0}
              </p>
            </div>
            <div>
              <span className="text-slate-600">Surface toiture:</span>
              <p className="font-medium text-slate-800">
                {analysisResult.data.toiture?.surface_reelle || 'N/A'} m²
              </p>
            </div>
          </div>
          
          {analysisResult.data.notes_et_hypotheses?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-slate-600 font-medium mb-2">Notes de l'IA:</p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                {analysisResult.data.notes_et_hypotheses.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PlanUploader;
