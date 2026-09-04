/**
 * Routes pour la gestion des produits du catalogue
 */

const express = require('express');
const router = express.Router();
const { runQuery, getOne, getAll } = require('../config/database');

/**
 * GET /api/products - Récupérer tous les produits
 */
router.get('/', async (req, res) => {
  try {
    const { category, active, search, limit = 100, offset = 0 } = req.query;
    
    let sql = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (category) {
      sql += ' AND (p.category_id = ? OR c.name LIKE ?)';
      params.push(category, `%${category}%`);
    }
    
    if (active !== undefined) {
      sql += ' AND p.is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }
    
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY p.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const products = await getAll(sql, params);
    
    // Parser les spécifications JSON
    const parsedProducts = products.map(p => ({
      ...p,
      specifications: p.specifications ? JSON.parse(p.specifications) : null
    }));
    
    res.json({
      success: true,
      count: parsedProducts.length,
      data: parsedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/products/categories - Récupérer toutes les catégories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await getAll('SELECT * FROM categories ORDER BY name ASC');
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/products/:id - Récupérer un produit par ID
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await getOne(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }
    
    product.specifications = product.specifications ? JSON.parse(product.specifications) : null;
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/products - Créer un nouveau produit
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      category_id,
      unit,
      price_unit,
      cost_price,
      stock_quantity,
      min_stock,
      tax_rate,
      margin_rate,
      specifications
    } = req.body;
    
    if (!name || !unit || !price_unit) {
      return res.status(400).json({
        success: false,
        error: 'Nom, unité et prix unitaire sont requis'
      });
    }
    
    const sql = `
      INSERT INTO products (name, category_id, unit, price_unit, cost_price, stock_quantity, min_stock, tax_rate, margin_rate, specifications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await runQuery(sql, [
      name,
      category_id || null,
      unit,
      price_unit,
      cost_price || 0,
      stock_quantity || 0,
      min_stock || 0,
      tax_rate || 20.00,
      margin_rate || 0,
      specifications ? JSON.stringify(specifications) : null
    ]);
    
    const newProduct = await getOne('SELECT * FROM products WHERE id = ?', [result.lastID]);
    
    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/products/:id - Mettre à jour un produit
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      category_id,
      unit,
      price_unit,
      cost_price,
      stock_quantity,
      min_stock,
      tax_rate,
      margin_rate,
      is_active,
      specifications
    } = req.body;
    
    const sql = `
      UPDATE products 
      SET name = COALESCE(?, name),
          category_id = COALESCE(?, category_id),
          unit = COALESCE(?, unit),
          price_unit = COALESCE(?, price_unit),
          cost_price = COALESCE(?, cost_price),
          stock_quantity = COALESCE(?, stock_quantity),
          min_stock = COALESCE(?, min_stock),
          tax_rate = COALESCE(?, tax_rate),
          margin_rate = COALESCE(?, margin_rate),
          is_active = COALESCE(?, is_active),
          specifications = COALESCE(?, specifications),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await runQuery(sql, [
      name,
      category_id,
      unit,
      price_unit,
      cost_price,
      stock_quantity,
      min_stock,
      tax_rate,
      margin_rate,
      is_active,
      specifications ? JSON.stringify(specifications) : specifications,
      req.params.id
    ]);
    
    const updatedProduct = await getOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/products/:id - Supprimer un produit
 */
router.delete('/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/products/:id/stock - Mettre à jour le stock d'un produit
 */
router.patch('/:id/stock', async (req, res) => {
  try {
    const { quantity, operation = 'set' } = req.body; // 'set', 'add', 'remove'
    
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'La quantité est requise'
      });
    }
    
    let sql;
    let params;
    
    if (operation === 'add') {
      sql = 'UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      params = [quantity, req.params.id];
    } else if (operation === 'remove') {
      sql = 'UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      params = [quantity, req.params.id];
    } else {
      sql = 'UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      params = [quantity, req.params.id];
    }
    
    await runQuery(sql, params);
    
    const updatedProduct = await getOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Stock mis à jour avec succès',
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
