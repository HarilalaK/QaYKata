/**
 * Routes pour l'analyse de plans par IA Vision
 */

const express = require('express');
const router = express.Router();
const { runQuery, getOne } = require('../config/database');
const { createVisionRequestPayload, validateVisionResponse } = require('../utils/visionPrompt');

// Vérifier si la clé API est configurée
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * POST /api/vision/analyze - Analyser un plan avec l'IA Vision
 */
router.post('/analyze', async (req, res) => {
  try {
    const { imageUrl, projectId, model = 'gpt-4o' } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'L\'URL de l\'image est requise'
      });
    }
    
    // Vérifier que la clé API est configurée
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Clé API OpenAI non configurée. Veuillez définir OPENAI_API_KEY dans vos variables d\'environnement.'
      });
    }
    
    // Créer le payload pour l'API OpenAI
    const payload = createVisionRequestPayload(imageUrl, model);
    
    // Appel à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erreur lors de l\'appel à l\'API OpenAI');
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Valider et parser la réponse JSON
    const parsedResult = validateVisionResponse(content);
    
    if (!parsedResult) {
      throw new Error('La réponse de l\'IA n\'est pas au format JSON valide');
    }
    
    // Si projectId est fourni, mettre à jour le projet avec les données extraites
    if (projectId && parsedResult.success) {
      await runQuery(`
        UPDATE projects 
        SET extracted_data = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [JSON.stringify(parsedResult), projectId]);
    }
    
    res.json({
      success: true,
      message: 'Plan analysé avec succès',
      data: parsedResult,
      rawResponse: content,
      modelUsed: model,
      usage: data.usage
    });
    
  } catch (error) {
    console.error('Erreur analyse vision:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/vision/analyze-upload - Upload et analyse d'un plan en une seule étape
 */
router.post('/analyze-upload', async (req, res) => {
  try {
    const { imageBase64, projectId, model = 'gpt-4o' } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'L\'image en base64 est requise'
      });
    }
    
    // Vérifier que la clé API est configurée
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Clé API OpenAI non configurée'
      });
    }
    
    // Convertir base64 en URL data pour OpenAI
    let imageUrl = imageBase64;
    if (!imageUrl.startsWith('data:image')) {
      imageUrl = `data:image/jpeg;base64,${imageBase64}`;
    }
    
    // Créer le payload pour l'API OpenAI
    const payload = createVisionRequestPayload(imageUrl, model);
    
    // Appel à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erreur lors de l\'appel à l\'API OpenAI');
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Valider et parser la réponse JSON
    const parsedResult = validateVisionResponse(content);
    
    if (!parsedResult) {
      throw new Error('La réponse de l\'IA n\'est pas au format JSON valide');
    }
    
    // Si projectId est fourni, mettre à jour le projet
    if (projectId && parsedResult.success) {
      await runQuery(`
        UPDATE projects 
        SET extracted_data = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [JSON.stringify(parsedResult), projectId]);
    }
    
    res.json({
      success: true,
      message: 'Plan analysé avec succès',
      data: parsedResult,
      modelUsed: model,
      usage: data.usage
    });
    
  } catch (error) {
    console.error('Erreur analyse vision upload:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/vision/test-prompt - Retourne le prompt système pour test
 */
router.get('/test-prompt', (req, res) => {
  const { VISION_ANALYSIS_SYSTEM_PROMPT } = require('../utils/visionPrompt');
  
  res.json({
    success: true,
    prompt: VISION_ANALYSIS_SYSTEM_PROMPT,
    promptLength: VISION_ANALYSIS_SYSTEM_PROMPT.length
  });
});

module.exports = router;
