/**
 * Routes pour la gestion des calculs BTP
 */

const express = require('express');
const router = express.Router();
const { runQuery, getOne, getAll } = require('../config/database');
const btpCalculator = require('../utils/btpCalculator');

/**
 * POST /api/calculations/maconnerie - Calculer les besoins en maçonnerie
 */
router.post('/maconnerie', async (req, res) => {
  try {
    const { longueur, hauteur, epaisseur = 0.20, marge = 5, projectId } = req.body;
    
    if (!longueur || !hauteur) {
      return res.status(400).json({
        success: false,
        error: 'Longueur et hauteur sont requises'
      });
    }
    
    const result = btpCalculator.calculerMaconnerie({
      longueur,
      hauteur,
      epaisseur,
      marge
    });
    
    // Sauvegarder le calcul si projectId est fourni
    if (projectId) {
      await runQuery(`
        INSERT INTO btp_calculations (project_id, calculation_type, input_data, result_data)
        VALUES (?, 'maconnerie', ?, ?)
      `, [projectId, JSON.stringify({ longueur, hauteur, epaisseur, marge }), JSON.stringify(result)]);
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/calculations/beton - Calculer les besoins en béton
 */
router.post('/beton', async (req, res) => {
  try {
    const { type, longueur, largeur, hauteur, dosageCiment = 350, projectId } = req.body;
    
    if (!type || !longueur || !largeur || !hauteur) {
      return res.status(400).json({
        success: false,
        error: 'Type, longueur, largeur et hauteur sont requis'
      });
    }
    
    const result = btpCalculator.calculerBetonArme({
      type,
      longueur,
      largeur,
      hauteur,
      dosageCiment
    });
    
    if (projectId) {
      await runQuery(`
        INSERT INTO btp_calculations (project_id, calculation_type, input_data, result_data)
        VALUES (?, 'beton', ?, ?)
      `, [projectId, JSON.stringify({ type, longueur, largeur, hauteur, dosageCiment }), JSON.stringify(result)]);
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/calculations/fers - Calculer les besoins en fers à béton
 */
router.post('/fers', async (req, res) => {
  try {
    const { surface, longueur, largeur, diametre = '10', espacement = 20, nappes = 2, projectId } = req.body;
    
    if (!surface || !longueur || !largeur) {
      return res.status(400).json({
        success: false,
        error: 'Surface, longueur et largeur sont requis'
      });
    }
    
    const result = btpCalculator.calculerFersBetont({
      surface,
      longueur,
      largeur,
      diametre,
      espacement,
      nappes
    });
    
    if (projectId) {
      await runQuery(`
        INSERT INTO btp_calculations (project_id, calculation_type, input_data, result_data)
        VALUES (?, 'fers', ?, ?)
      `, [projectId, JSON.stringify({ surface, longueur, largeur, diametre, espacement, nappes }), JSON.stringify(result)]);
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/calculations/toiture - Calculer les besoins pour toiture
 */
router.post('/toiture', async (req, res) => {
  try {
    const { longueur, largeur, pente = 0, longueurTole = 3, debord = 0.5, projectId } = req.body;
    
    if (!longueur || !largeur) {
      return res.status(400).json({
        success: false,
        error: 'Longueur et largeur sont requises'
      });
    }
    
    const result = btpCalculator.calculerToiture({
      longueur,
      largeur,
      pente,
      longueurTole,
      debord
    });
    
    if (projectId) {
      await runQuery(`
        INSERT INTO btp_calculations (project_id, calculation_type, input_data, result_data)
        VALUES (?, 'toiture', ?, ?)
      `, [projectId, JSON.stringify({ longueur, largeur, pente, longueurTole, debord }), JSON.stringify(result)]);
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/calculations/peinture - Calculer les besoins en peinture
 */
router.post('/peinture', async (req, res) => {
  try {
    const { surface, pouvoirCouvrant = 10, couches = 2, conditionnement = 20, projectId } = req.body;
    
    if (!surface) {
      return res.status(400).json({
        success: false,
        error: 'La surface est requise'
      });
    }
    
    const result = btpCalculator.calculerPeinture({
      surface,
      pouvoirCouvrant,
      couches,
      conditionnement
    });
    
    if (projectId) {
      await runQuery(`
        INSERT INTO btp_calculations (project_id, calculation_type, input_data, result_data)
        VALUES (?, 'peinture', ?, ?)
      `, [projectId, JSON.stringify({ surface, pouvoirCouvrant, couches, conditionnement }), JSON.stringify(result)]);
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/calculations/carrelage - Calculer les besoins pour carrelage
 */
router.post('/carrelage', async (req, res) => {
  try {
    const { surface, rendementColle = 5, projectId } = req.body;
    
    if (!surface) {
      return res.status(400).json({
        success: false,
        error: 'La surface est requise'
      });
    }
    
    const result = btpCalculator.calculerCarrelage({
      surface,
      rendementColle
    });
    
    if (projectId) {
      await runQuery(`
        INSERT INTO btp_calculations (project_id, calculation_type, input_data, result_data)
        VALUES (?, 'carrelage', ?, ?)
      `, [projectId, JSON.stringify({ surface, rendementColle }), JSON.stringify(result)]);
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/calculations/projet-complet - Calcul complet pour un projet
 */
router.post('/projet-complet', async (req, res) => {
  try {
    const projet = req.body;
    
    const result = btpCalculator.calculProjetComplet(projet);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/calculations/history/:projectId - Historique des calculs pour un projet
 */
router.get('/history/:projectId', async (req, res) => {
  try {
    const calculations = await getAll(
      'SELECT * FROM btp_calculations WHERE project_id = ? ORDER BY created_at DESC',
      [req.params.projectId]
    );
    
    res.json({
      success: true,
      count: calculations.length,
      data: calculations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
