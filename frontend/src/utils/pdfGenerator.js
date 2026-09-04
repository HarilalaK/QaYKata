/**
 * Utilitaires pour la génération de PDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Générer un PDF de devis
 * @param {Object} pdfData - Données du devis formatées
 * @returns {jsPDF} Document PDF
 */
export function generateQuotePDF(pdfData) {
  const doc = new jsPDF();
  
  // En-tête de l'entreprise
  doc.setFillColor(14, 165, 233); // primary-500
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(pdfData.company.name, 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(pdfData.company.address, 15, 28);
  doc.text(`Tél: ${pdfData.company.phone}`, 15, 33);
  doc.text(`Email: ${pdfData.company.email}`, 15, 38);
  
  // Informations du devis
  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', 150, 20);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${pdfData.quote.number}`, 150, 28);
  doc.text(`Date: ${pdfData.quote.date}`, 150, 34);
  doc.text(`Validité: ${pdfData.quote.validity} jours`, 150, 40);
  
  // Informations client
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', 15, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(pdfData.client.name, 15, 62);
  if (pdfData.client.address) {
    doc.text(pdfData.client.address, 15, 68);
  }
  if (pdfData.client.phone) {
    doc.text(`Tél: ${pdfData.client.phone}`, 15, 74);
  }
  if (pdfData.client.email) {
    doc.text(`Email: ${pdfData.client.email}`, 15, 80);
  }
  
  // Tableau des éléments
  const tableColumn = ['Désignation', 'Qté', 'Unité', 'P.U. HT', 'TVA %', 'Total HT'];
  const tableRows = pdfData.items.map(item => [
    item.description,
    item.quantity.toFixed(2),
    item.unit,
    `${item.unitPrice.toFixed(2)} Ar`,
    `${item.taxRate}%`,
    `${item.totalHt.toFixed(2)} Ar`
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' }
    }
  });
  
  // Totaux
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Total HT:', 140, finalY);
  doc.text(`${pdfData.totals.subtotalHt.toFixed(2)} Ar`, 195, finalY, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.text('Total TVA:', 140, finalY + 7);
  doc.text(`${pdfData.totals.totalTax.toFixed(2)} Ar`, 195, finalY + 7, { align: 'right' });
  
  if (pdfData.totals.discount > 0) {
    doc.text('Remise:', 140, finalY + 14);
    doc.text(`-${pdfData.totals.discount.toFixed(2)} Ar`, 195, finalY + 14, { align: 'right' });
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(14, 165, 233);
  doc.text('Net TTC:', 140, finalY + 24);
  doc.text(`${pdfData.totals.totalTtc.toFixed(2)} Ar`, 195, finalY + 24, { align: 'right' });
  
  // Notes et conditions
  if (pdfData.notes) {
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 15, finalY + 40);
    
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(pdfData.notes, 180);
    doc.text(notesLines, 15, finalY + 47);
  }
  
  if (pdfData.termsConditions) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Conditions:', 15, finalY + 65);
    
    doc.setFont('helvetica', 'normal');
    const termsLines = doc.splitTextToSize(pdfData.termsConditions, 180);
    doc.text(termsLines, 15, finalY + 72);
  }
  
  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Document généré par Smart-Métré Quincaillerie', 105, 280, { align: 'center' });
  
  return doc;
}

/**
 * Télécharger le PDF
 * @param {jsPDF} doc - Document PDF
 * @param {string} filename - Nom du fichier
 */
export function downloadPDF(doc, filename) {
  doc.save(`${filename}.pdf`);
}

/**
 * Aperçu du PDF dans un nouvel onglet
 * @param {jsPDF} doc - Document PDF
 */
export function previewPDF(doc) {
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
}

export default {
  generateQuotePDF,
  downloadPDF,
  previewPDF
};
