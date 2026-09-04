/**
 * Smart-Métré Quincaillerie - Backend Express
 * Point d'entrée principal de l'application backend
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import des routes
const projectsRoutes = require('./src/routes/projects.routes');
const quotesRoutes = require('./src/routes/quotes.routes');
const productsRoutes = require('./src/routes/products.routes');
const calculationsRoutes = require('./src/routes/calculations.routes');
const visionRoutes = require('./src/routes/vision.routes');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' })); // Limite augmentée pour les images base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/projects', projectsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/calculations', calculationsRoutes);
app.use('/api/vision', visionRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Smart-Métré Quincaillerie API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'Smart-Métré Quincaillerie API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: 'GET /api/health',
      projects: 'POST/GET /api/projects',
      quotes: 'POST/GET /api/quotes',
      products: 'GET /api/products',
      calculations: 'POST /api/calculations',
      vision: 'POST /api/vision/analyze',
    }
  });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Une erreur est survenue' 
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Démarrage du serveur
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║         SMART-MÉTRÉ QUINCAILLERIE - API SERVER            ║
╠═══════════════════════════════════════════════════════════╣
║  Serveur démarré sur le port: ${PORT}                      ║
║  Mode: ${process.env.NODE_ENV || 'development'}                              ║
║  URL: http://localhost:${PORT}                            ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
