# Smart-Métré Quincaillerie

Application Full-Stack pour la génération automatique de devis et listes de matériaux BTP à partir de plans ou mesures de chantier.

## 🏗️ Architecture du Projet

```
smart-metre-quincaillerie/
├── backend/                 # API Node.js/Express
│   ├── prisma/
│   │   └── schema.sql      # Schéma de base de données SQLite
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js # Configuration DB
│   │   ├── routes/         # Routes API
│   │   ├── utils/          # Utilitaires (calculs BTP, IA Vision)
│   │   └── index.js        # Point d'entrée
│   ├── uploads/            # Fichiers uploadés
│   └── package.json
│
└── frontend/               # Application React + Tailwind CSS
    ├── src/
    │   ├── components/     # Composants React
    │   ├── services/       # Services API
    │   ├── utils/          # Utilitaires (génération PDF)
    │   ├── App.jsx         # Composant principal
    │   └── main.jsx        # Point d'entrée
    └── package.json
```

## 🚀 Fonctionnalités Principales

### 1. Analyse de Plans par IA Vision
- Upload de photos/plans de chantier
- Extraction automatique des dimensions par IA (GPT-4o Vision)
- Détection des pièces, surfaces, murs, toiture

### 2. Moteur de Calcul BTP
- **Maçonnerie**: Parpaings, ciment, sable, mortier
- **Béton armé**: Dalles, poteaux, semelles, poutres
- **Fers à béton**: Calcul des longueurs et poids selon diamètres
- **Toiture**: Tôles, chevrons, pointes de fixation
- **Peinture**: Litrage selon pouvoir couvrant
- **Carrelage**: Colle et jointoiement

### 3. Gestion des Devis
- Catalogue de produits de quincaillerie
- Génération de devis avec calculs automatiques
- Export PDF professionnel
- Suivi des statuts (brouillon, envoyé, accepté, refusé)

### 4. Base de Données
- Tables: `categories`, `products`, `projects`, `quotes`, `quote_items`, `btp_calculations`
- Données de démonstration incluses

## 📦 Installation

### Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env et ajouter votre clé API OpenAI
# OPENAI_API_KEY=votre_cle_ici

# Initialiser la base de données
npm run init-db

# Démarrer le serveur
npm run dev
```

Le serveur sera disponible sur `http://localhost:3001`

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer l'application
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🔧 Configuration Requise

- Node.js 18+ 
- npm ou yarn
- Clé API OpenAI (pour l'analyse de plans par IA)

## 📡 Endpoints API Principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/projects` | Liste des projets |
| POST | `/api/projects` | Créer un projet |
| POST | `/api/projects/:id/upload-plan` | Upload de plan |
| POST | `/api/vision/analyze` | Analyser un plan par IA |
| POST | `/api/calculations/maconnerie` | Calcul maçonnerie |
| POST | `/api/calculations/beton` | Calcul béton |
| POST | `/api/calculations/toiture` | Calcul toiture |
| GET | `/api/products` | Catalogue produits |
| POST | `/api/quotes` | Créer un devis |
| GET | `/api/quotes/:id/pdf-data` | Données pour PDF |

## 🤖 Prompt IA Vision

Le prompt système complet pour l'analyse de plans se trouve dans:
`backend/src/utils/visionPrompt.js`

Il est configuré pour:
- Retourner uniquement du JSON structuré
- Extraire toutes les dimensions en mètres
- Identifier les pièces, murs, toitures, dalles
- Inclure un score de confiance
- Noter les hypothèses et incertitudes

## 📄 Génération PDF

Le module de génération PDF (`frontend/src/utils/pdfGenerator.js`) utilise:
- jsPDF pour la création du document
- jspdf-autotable pour les tableaux
- Mise en page professionnelle avec en-tête, totaux, conditions

## 🎨 Interface Utilisateur

Composants React principaux:
- `PlanUploader`: Upload et analyse de plans
- `ConstructionForm`: Saisie manuelle des dimensions
- `QuoteDisplay`: Affichage et export de devis
- Navigation responsive (sidebar desktop, bottom nav mobile)

## 📝 Licence

Projet développé pour Smart-Métré Quincaillerie

---

**Développé avec:** React, Tailwind CSS, Node.js, Express, SQLite, OpenAI Vision API
