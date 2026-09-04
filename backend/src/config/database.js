/**
 * Configuration de la base de données SQLite
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Chemin vers la base de données
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/smart_metre.db');

// S'assurer que le dossier data existe
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Création de la connexion à la base de données
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.message);
  } else {
    console.log('Connecté à la base de données SQLite:', DB_PATH);
    initializeDatabase();
  }
});

/**
 * Initialiser la base de données avec le schéma SQL
 */
function initializeDatabase() {
  const schemaPath = path.join(__dirname, '../prisma/schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('Fichier de schéma SQL introuvable:', schemaPath);
    return;
  }
  
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  
  // Exécuter le schéma SQL
  db.exec(schemaSQL, (err) => {
    if (err) {
      console.error('Erreur lors de l\'initialisation du schéma:', err.message);
    } else {
      console.log('Base de données initialisée avec succès');
    }
  });
}

/**
 * Fonction utilitaire pour exécuter des requêtes
 * @param {string} sql - Requête SQL
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise} Promesse avec le résultat
 */
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Fonction utilitaire pour récupérer une ligne
 * @param {string} sql - Requête SQL
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise} Promesse avec la ligne
 */
function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Fonction utilitaire pour récupérer plusieurs lignes
 * @param {string} sql - Requête SQL
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise} Promesse avec les lignes
 */
function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  db,
  runQuery,
  getOne,
  getAll,
  DB_PATH,
};
