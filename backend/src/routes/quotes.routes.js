/**
 * Routes pour la gestion des devis
 */

const express = require('express');
const router = express.Router();
const { runQuery, getOne, getAll } = require('../config/database');

/**
 * Générer un numéro de devis unique
 */
function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DEV-${year}-${random}`;
}

/**
 * GET /api/quotes - Récupérer tous les devis
 */
router.get('/', async (req, res) => {
  try {
    const { status, project_id, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT q.*, p.client_name, p.project_type 
      FROM quotes q 
      LEFT JOIN projects p ON q.project_id = p.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      sql += ' AND q.status = ?';
      params.push(status);
    }
    
    if (project_id) {
      sql += ' AND q.project_id = ?';
      params.push(project_id);
    }
    
    sql += ' ORDER BY q.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const quotes = await getAll(sql, params);
    
    res.json({
      success: true,
      count: quotes.length,
      data: quotes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/quotes/:id - Récupérer un devis avec ses éléments
 */
router.get('/:id', async (req, res) => {
  try {
    const quote = await getOne(`
      SELECT q.*, p.client_name, p.client_phone, p.client_email, p.project_address, p.project_type
      FROM quotes q 
      LEFT JOIN projects p ON q.project_id = p.id 
      WHERE q.id = ?
    `, [req.params.id]);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Devis non trouvé'
      });
    }
    
    // Récupérer les éléments du devis
    const items = await getAll(
      'SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order ASC, category ASC',
      [req.params.id]
    );
    
    // Parser les items
    const parsedItems = items.map(item => ({
      ...item,
      specifications: item.description ? JSON.parse(item.description || '{}') : null
    }));
    
    res.json({
      success: true,
      data: {
        ...quote,
        items: parsedItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/quotes - Créer un nouveau devis
 */
router.post('/', async (req, res) => {
  try {
    const {
      project_id,
      title,
      validity_days = 30,
      notes,
      terms_conditions,
      items = []
    } = req.body;
    
    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: 'L\'ID du projet est requis'
      });
    }
    
    const quoteNumber = generateQuoteNumber();
    
    // Calculer les totaux
    let subtotal_ht = 0;
    let total_tax = 0;
    
    items.forEach(item => {
      const lineTotal = (item.quantity || 0) * (item.unit_price_ht || 0);
      const taxAmount = lineTotal * ((item.tax_rate || 20) / 100);
      subtotal_ht += lineTotal;
      total_tax += taxAmount;
    });
    
    const total_ttc = subtotal_ht + total_tax;
    
    // Créer le devis
    const sql = `
      INSERT INTO quotes (project_id, quote_number, title, validity_days, notes, terms_conditions, subtotal_ht, total_tax, total_ttc, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `;
    
    const result = await runQuery(sql, [
      project_id,
      quoteNumber,
      title || `Devis ${quoteNumber}`,
      validity_days,
      notes || null,
      terms_conditions || null,
      subtotal_ht,
      total_tax,
      total_ttc
    ]);
    
    // Insérer les éléments du devis
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const lineTotalHt = (item.quantity || 0) * (item.unit_price_ht || 0);
        const lineTotalTtc = lineTotalHt * (1 + ((item.tax_rate || 20) / 100));
        
        await runQuery(`
          INSERT INTO quote_items (quote_id, product_id, custom_name, description, category, quantity, unit, unit_price_ht, tax_rate, line_total_ht, line_total_ttc, is_material, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          result.lastID,
          item.product_id || null,
          item.custom_name || null,
          item.description ? JSON.stringify(item.description) : null,
          item.category || 'Divers',
          item.quantity || 0,
          item.unit || 'unité',
          item.unit_price_ht || 0,
          item.tax_rate || 20,
          lineTotalHt,
          lineTotalTtc,
          item.is_material !== undefined ? item.is_material : true,
          i
        ]);
      }
    }
    
    const newQuote = await getOne('SELECT * FROM quotes WHERE id = ?', [result.lastID]);
    
    res.status(201).json({
      success: true,
      message: 'Devis créé avec succès',
      data: newQuote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/quotes/:id - Mettre à jour un devis
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      status,
      validity_days,
      notes,
      terms_conditions,
      discount_amount
    } = req.body;
    
    const sql = `
      UPDATE quotes 
      SET title = COALESCE(?, title),
          status = COALESCE(?, status),
          validity_days = COALESCE(?, validity_days),
          notes = COALESCE(?, notes),
          terms_conditions = COALESCE(?, terms_conditions),
          discount_amount = COALESCE(?, discount_amount),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await runQuery(sql, [
      title,
      status,
      validity_days,
      notes,
      terms_conditions,
      discount_amount || 0,
      req.params.id
    ]);
    
    const updatedQuote = await getOne('SELECT * FROM quotes WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Devis mis à jour avec succès',
      data: updatedQuote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/quotes/:id/items - Ajouter un élément au devis
 */
router.post('/:id/items', async (req, res) => {
  try {
    const {
      product_id,
      custom_name,
      description,
      category,
      quantity,
      unit,
      unit_price_ht,
      tax_rate = 20,
      is_material = true
    } = req.body;
    
    if (!quantity || !unit_price_ht) {
      return res.status(400).json({
        success: false,
        error: 'Quantité et prix unitaire sont requis'
      });
    }
    
    // Obtenir le dernier sort_order
    const lastItem = await getOne(
      'SELECT MAX(sort_order) as max_order FROM quote_items WHERE quote_id = ?',
      [req.params.id]
    );
    const sortOrder = (lastItem?.max_order || 0) + 1;
    
    const lineTotalHt = quantity * unit_price_ht;
    const lineTotalTtc = lineTotalHt * (1 + (tax_rate / 100));
    
    await runQuery(`
      INSERT INTO quote_items (quote_id, product_id, custom_name, description, category, quantity, unit, unit_price_ht, tax_rate, line_total_ht, line_total_ttc, is_material, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.params.id,
      product_id || null,
      custom_name || null,
      description ? JSON.stringify(description) : null,
      category || 'Divers',
      quantity,
      unit || 'unité',
      unit_price_ht,
      tax_rate,
      lineTotalHt,
      lineTotalTtc,
      is_material,
      sortOrder
    ]);
    
    // Recalculer les totaux du devis
    const items = await getAll('SELECT * FROM quote_items WHERE quote_id = ?', [req.params.id]);
    
    let subtotal_ht = 0;
    let total_tax = 0;
    
    items.forEach(item => {
      subtotal_ht += item.line_total_ht;
      total_tax += (item.line_total_ttc - item.line_total_ht);
    });
    
    const total_ttc = subtotal_ht + total_tax;
    
    await runQuery(
      'UPDATE quotes SET subtotal_ht = ?, total_tax = ?, total_ttc = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [subtotal_ht, total_tax, total_ttc, req.params.id]
    );
    
    const updatedQuote = await getOne('SELECT * FROM quotes WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Élément ajouté au devis',
      data: updatedQuote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/quotes/:id - Supprimer un devis
 */
router.delete('/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM quotes WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Devis supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/quotes/:id/status - Changer le statut d'un devis
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}`
      });
    }
    
    await runQuery(
      'UPDATE quotes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, req.params.id]
    );
    
    const updatedQuote = await getOne('SELECT * FROM quotes WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: updatedQuote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/quotes/:id/pdf - Générer les données pour PDF (à intégrer avec un générateur PDF)
 */
router.get('/:id/pdf-data', async (req, res) => {
  try {
    const quote = await getOne(`
      SELECT q.*, p.client_name, p.client_phone, p.client_email, p.project_address, p.project_type
      FROM quotes q 
      LEFT JOIN projects p ON q.project_id = p.id 
      WHERE q.id = ?
    `, [req.params.id]);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Devis non trouvé'
      });
    }
    
    const items = await getAll(
      'SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order ASC, category ASC',
      [req.params.id]
    );
    
    // Formater les données pour génération PDF
    const pdfData = {
      quote: {
        number: quote.quote_number,
        date: new Date(quote.created_at).toLocaleDateString('fr-FR'),
        validity: quote.validity_days,
        title: quote.title,
        status: quote.status
      },
      company: {
        name: 'Smart-Métré Quincaillerie',
        address: 'Votre adresse ici',
        phone: '+261 XX XX XXX XX',
        email: 'contact@smart-metre.mg',
        nif: 'Votre NIF',
        stat: 'Votre STAT'
      },
      client: {
        name: quote.client_name,
        phone: quote.client_phone,
        email: quote.client_email,
        address: quote.project_address,
        project: quote.project_type
      },
      items: items.map(item => ({
        description: item.custom_name || item.category,
        details: item.description ? JSON.parse(item.description) : null,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unit_price_ht,
        taxRate: item.tax_rate,
        totalHt: item.line_total_ht,
        totalTtc: item.line_total_ttc
      })),
      totals: {
        subtotalHt: quote.subtotal_ht,
        totalTax: quote.total_tax,
        totalTtc: quote.total_ttc,
        discount: quote.discount_amount || 0
      },
      notes: quote.notes,
      termsConditions: quote.terms_conditions
    };
    
    res.json({
      success: true,
      data: pdfData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
