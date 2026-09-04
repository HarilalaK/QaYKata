/**
 * Routes pour la gestion des projets/chantiers
 */

const express = require('express');
const router = express.Router();
const { db, runQuery, getOne, getAll } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/plans');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'plan-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image (JPEG, PNG, GIF) et PDF sont autorisés'));
    }
  }
});

/**
 * GET /api/projects - Récupérer tous les projets
 */
router.get('/', async (req, res) => {
  try {
    const { status, type, limit = 50, offset = 0 } = req.query;
    
    let sql = 'SELECT * FROM projects WHERE 1=1';
    const params = [];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    if (type) {
      sql += ' AND project_type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const projects = await getAll(sql, params);
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/projects/:id - Récupérer un projet par ID
 */
router.get('/:id', async (req, res) => {
  try {
    const project = await getOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Projet non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/projects - Créer un nouveau projet
 */
router.post('/', async (req, res) => {
  try {
    const {
      client_name,
      client_phone,
      client_email,
      project_address,
      project_type,
      notes
    } = req.body;
    
    if (!client_name) {
      return res.status(400).json({
        success: false,
        error: 'Le nom du client est requis'
      });
    }
    
    const sql = `
      INSERT INTO projects (client_name, client_phone, client_email, project_address, project_type, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'draft')
    `;
    
    const result = await runQuery(sql, [
      client_name,
      client_phone || null,
      client_email || null,
      project_address || null,
      project_type || 'general',
      notes || null
    ]);
    
    const newProject = await getOne('SELECT * FROM projects WHERE id = ?', [result.lastID]);
    
    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      data: newProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/projects/:id - Mettre à jour un projet
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      client_name,
      client_phone,
      client_email,
      project_address,
      project_type,
      status,
      plan_image_url,
      extracted_data,
      notes
    } = req.body;
    
    const sql = `
      UPDATE projects 
      SET client_name = COALESCE(?, client_name),
          client_phone = COALESCE(?, client_phone),
          client_email = COALESCE(?, client_email),
          project_address = COALESCE(?, project_address),
          project_type = COALESCE(?, project_type),
          status = COALESCE(?, status),
          plan_image_url = COALESCE(?, plan_image_url),
          extracted_data = COALESCE(?, extracted_data),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await runQuery(sql, [
      client_name,
      client_phone,
      client_email,
      project_address,
      project_type,
      status,
      plan_image_url,
      extracted_data ? JSON.stringify(extracted_data) : null,
      notes,
      req.params.id
    ]);
    
    const updatedProject = await getOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Projet mis à jour avec succès',
      data: updatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/projects/:id - Supprimer un projet
 */
router.delete('/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM projects WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Projet supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/projects/:id/upload-plan - Upload d'un plan pour un projet
 */
router.post('/:id/upload-plan', upload.single('plan'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier uploadé'
      });
    }
    
    const planUrl = `/uploads/plans/${req.file.filename}`;
    
    await runQuery(
      'UPDATE projects SET plan_image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [planUrl, req.params.id]
    );
    
    const project = await getOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Plan uploadé avec succès',
      data: {
        project,
        planUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
