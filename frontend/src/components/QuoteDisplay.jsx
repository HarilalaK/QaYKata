import React, { useState } from 'react';
import { Download, Printer, Eye } from 'lucide-react';
import { generateQuotePDF, downloadPDF, previewPDF } from '../utils/pdfGenerator';

/**
 * Composant d'affichage du devis avec option d'export PDF
 */
function QuoteDisplay({ quoteData, showActions = true }) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!quoteData) {
    return null;
  }

  const { quote, company, client, items, totals, notes, termsConditions } = quoteData;

  // Générer et télécharger le PDF
  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      const doc = generateQuotePDF(quoteData);
      downloadPDF(doc, `Devis-${quote.number}`);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Aperçu du PDF
  const handlePreviewPDF = () => {
    setIsGenerating(true);
    try {
      const doc = generateQuotePDF(quoteData);
      previewPDF(doc);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Impression directe
  const handlePrint = () => {
    window.print();
  };

  // Formatage des prix en Ariary
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('MGA', 'Ar');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Actions bar - cachée à l'impression */}
      {showActions && (
        <div className="no-print p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-slate-800">
            Devis N° {quote.number}
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={handlePreviewPDF}
              disabled={isGenerating}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Aperçu
            </button>
            
            <button
              onClick={handlePrint}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </button>
            
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Génération...' : 'PDF'}
            </button>
          </div>
        </div>
      )}

      {/* Contenu du devis - optimisé pour impression */}
      <div className="p-6 print:p-0">
        {/* En-tête */}
        <div className="mb-8 pb-6 border-b-2 border-primary-500 print:border-black">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 print:text-black">
                {company.name}
              </h1>
              <p className="text-sm text-slate-600 print:text-gray-600 mt-1">
                {company.address}
              </p>
              <p className="text-sm text-slate-600 print:text-gray-600">
                Tél: {company.phone} | Email: {company.email}
              </p>
            </div>
            
            <div className="text-right">
              <h2 className="text-xl font-bold text-primary-600 print:text-black">
                DEVIS
              </h2>
              <p className="text-sm text-slate-600 print:text-gray-600 mt-2">
                N° <span className="font-semibold">{quote.number}</span>
              </p>
              <p className="text-sm text-slate-600 print:text-gray-600">
                Date: {quote.date}
              </p>
              <p className="text-sm text-slate-600 print:text-gray-600">
                Validité: {quote.validity} jours
              </p>
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-700 print:text-black uppercase mb-2">
            Client
          </h3>
          <div className="bg-slate-50 print:bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-slate-800 print:text-black">{client.name}</p>
            {client.address && (
              <p className="text-sm text-slate-600 print:text-gray-600">{client.address}</p>
            )}
            {client.phone && (
              <p className="text-sm text-slate-600 print:text-gray-600">Tél: {client.phone}</p>
            )}
            {client.email && (
              <p className="text-sm text-slate-600 print:text-gray-600">Email: {client.email}</p>
            )}
            {client.project && (
              <p className="text-sm text-slate-600 print:text-gray-600 mt-2">
                Projet: <span className="capitalize">{client.project.replace(/_/g, ' ')}</span>
              </p>
            )}
          </div>
        </div>

        {/* Tableau des éléments */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-50 print:bg-gray-100 border-b-2 border-primary-500 print:border-black">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 print:text-black">
                  Désignation
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700 print:text-black">
                  Qté
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700 print:text-black">
                  Unité
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700 print:text-black">
                  P.U. HT
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700 print:text-black">
                  TVA
                </th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700 print:text-black">
                  Total HT
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr 
                  key={index}
                  className={`border-b border-slate-100 print:border-gray-200 ${
                    index % 2 === 0 ? 'bg-white print:bg-white' : 'bg-slate-50 print:bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4 text-slate-800 print:text-black">
                    {item.description}
                    {item.details && (
                      <p className="text-xs text-slate-500 print:text-gray-500 mt-1">
                        {typeof item.details === 'object' 
                          ? Object.entries(item.details).map(([k, v]) => `${k}: ${v}`).join(', ')
                          : item.details
                        }
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 print:text-gray-600">
                    {item.quantity.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 print:text-gray-600">
                    {item.unit}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 print:text-gray-600">
                    {formatPrice(item.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 print:text-gray-600">
                    {item.taxRate}%
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-800 print:text-black">
                    {formatPrice(item.totalHt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="mb-8 flex justify-end">
          <div className="w-64 print:w-48">
            <div className="flex justify-between py-2 border-b border-slate-200 print:border-gray-300">
              <span className="text-slate-600 print:text-gray-600">Total HT:</span>
              <span className="font-medium text-slate-800 print:text-black">
                {formatPrice(totals.subtotalHt)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 print:border-gray-300">
              <span className="text-slate-600 print:text-gray-600">Total TVA:</span>
              <span className="font-medium text-slate-800 print:text-black">
                {formatPrice(totals.totalTax)}
              </span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between py-2 border-b border-slate-200 print:border-gray-300 text-red-600 print:text-red-700">
                <span>Remise:</span>
                <span>-{formatPrice(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 bg-primary-50 print:bg-gray-100 px-3 rounded mt-2">
              <span className="font-bold text-primary-700 print:text-black">Net TTC:</span>
              <span className="font-bold text-lg text-primary-700 print:text-black">
                {formatPrice(totals.totalTtc)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes et conditions */}
        {(notes || termsConditions) && (
          <div className="mt-8 pt-6 border-t border-slate-200 print:border-gray-300">
            {notes && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-700 print:text-black uppercase mb-2">
                  Notes
                </h4>
                <p className="text-sm text-slate-600 print:text-gray-600 whitespace-pre-line">
                  {notes}
                </p>
              </div>
            )}
            
            {termsConditions && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 print:text-black uppercase mb-2">
                  Conditions
                </h4>
                <p className="text-sm text-slate-600 print:text-gray-600 whitespace-pre-line">
                  {termsConditions}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pied de page */}
        <div className="mt-8 pt-4 border-t border-slate-200 print:border-gray-300 text-center">
          <p className="text-xs text-slate-400 print:text-gray-400">
            Document généré par Smart-Métré Quincaillerie
          </p>
        </div>
      </div>
    </div>
  );
}

export default QuoteDisplay;
