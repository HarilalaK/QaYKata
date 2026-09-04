/**
 * Smart-Métré Quincaillerie - Moteur de Calcul BTP
 * Module de calcul des matériaux de construction
 * 
 * Ce module contient les formules exactes pour le calcul des besoins en matériaux
 * selon les standards du BTP.
 */

/**
 * Constantes et coefficients techniques BTP
 */
const BTP_CONSTANTS = {
  // Maçonnerie - Parpaings standards 20x20x40 cm
  PARPAING: {
    LONGUEUR: 0.40, // mètres
    HAUTEUR: 0.20, // mètres
    EPAISSEUR: 0.20, // mètres
    JOINT_MORTIER: 0.015, // épaisseur du joint en mètres
    PARPAINGS_PAR_M2: 12.5, // parpaings/m² (avec joints)
  },
  
  // Mortier de maçonnerie
  MORTIER: {
    DOSAGE_CIMENT_KG_M3: 350, // kg de ciment par m³ de mortier
    DENSITE_CIMENT: 1.5, // rapport volume ciment/sable
    SABLE_M3_PAR_M3_MORTIER: 0.8, // m³ de sable par m³ de mortier
    VOLUME_MORTIER_PAR_M2: 0.015, // m³ de mortier par m² de mur (joints + enduit)
  },
  
  // Béton armé - Dosages standards
  BETON: {
    DOSAGE_CIMENT_KG_M3: 350, // kg/m³ pour béton standard
    DOSAGE_SABLE_M3_M3: 0.4, // m³ de sable par m³ de béton
    DOSAGE_GRAVIER_M3_M3: 0.6, // m³ de gravier par m³ de béton
    POIDS_VOLUMIQUE_BETON: 2400, // kg/m³
  },
  
  // Fers à béton
  FER_BETON: {
    POIDS_PAR_ML: {
      '6': 0.222, // kg/ml pour diamètre 6mm
      '8': 0.395, // kg/ml pour diamètre 8mm
      '10': 0.617, // kg/ml pour diamètre 10mm
      '12': 0.888, // kg/ml pour diamètre 12mm
      '14': 1.21, // kg/ml pour diamètre 14mm
      '16': 1.58, // kg/ml pour diamètre 16mm
    },
    ENROBAGE_MIN: 0.03, // 3cm d'enrobage minimum
    RECouvreMENT: 0.50, // 50cm de recouvrement entre barres
  },
  
  // Toiture - Tôles ondulées standards
  TOITURE: {
    TOLE_LARGEUR_UTILE: 1.0, // mètre (largeur utile après recouvrement)
    TOLE_LONGUEUR_STANDARD: [2, 3, 4], // mètres
    RECOUVREMENT_TOLE: 0.15, // 15% de recouvrement
    CHEVRONS_ENTRAXE: 0.60, // 60cm entre chevrons
    POINTES_PAR_M2: 8, // nombre de pointes/vis par m²
  },
  
  // Peinture - Pouvoirs couvrants standards
  PEINTURE: {
    POUVOIR_COUVRANT_STANDARD: 10, // m²/L pour une couche
    COUCHES_RECOMMANDEES: 2, // nombre de couches recommandées
    ENDUIT_RENDEMENT_M2_KG: 2, // m²/kg pour enduit de lissage
  },
  
  // Colle à carrelage
  CARRELAGE: {
    COLLE_RENDEMENT_M2_SAC_25KG: 5, // m² par sac de 25kg
    JOINT_RENDEMENT_M2_KG: 0.5, // kg/m² pour joints
  },
};

/**
 * Interface TypeScript pour les résultats de calcul
 */
// @ts-check
/**
 * @typedef {Object} MasonryResult
 * @property {number} surfaceMur - Surface du mur en m²
 * @property {number} nombreParpaings - Nombre de parpaings nécessaires
 * @property {number} volumeMortier - Volume de mortier en m³
 * @property {number} sacsCiment - Nombre de sacs de ciment (50kg)
 * @property {number} volumeSable - Volume de sable en m³
 * @property {number} margePourcentage - Marge technique appliquée (5%)
 */

/**
 * Calculer les besoins en matériaux pour un mur en parpaings
 * @param {Object} params - Paramètres du mur
 * @param {number} params.longueur - Longueur du mur en mètres
 * @param {number} params.hauteur - Hauteur du mur en mètres
 * @param {number} params.epaisseur - Épaisseur du mur en mètres (optionnel, défaut 0.20)
 * @param {number} params.marge - Marge de sécurité en % (optionnel, défaut 5)
 * @returns {MasonryResult} Résultats du calcul
 */
function calculerMaconnerie({ longueur, hauteur, epaisseur = 0.20, marge = 5 }) {
  // Calcul de la surface du mur
  const surfaceMur = longueur * hauteur;
  
  // Nombre de parpaings (12.5 parpaings/m² standard)
  const nombreParpaingsBrut = surfaceMur * BTP_CONSTANTS.PARPAING.PARPAINGS_PAR_M2;
  const nombreParpaings = Math.ceil(nombreParpaingsBrut * (1 + marge / 100));
  
  // Volume de mortier nécessaire (joints + pose)
  const volumeMortier = surfaceMur * BTP_CONSTANTS.MORTIER.VOLUME_MORTIER_PAR_M2;
  
  // Calcul du ciment (350 kg/m³ de mortier)
  const poidsCimentKg = volumeMortier * BTP_CONSTANTS.MORTIER.DOSAGE_CIMENT_KG_M3;
  const sacsCiment = Math.ceil(poidsCimentKg / 50); // Sac de 50kg
  
  // Volume de sable (0.8 m³ de sable par m³ de mortier)
  const volumeSable = volumeMortier * BTP_CONSTANTS.MORTIER.SABLE_M3_PAR_M3_MORTIER;
  
  return {
    surfaceMur: Math.round(surfaceMur * 100) / 100,
    nombreParpaings,
    volumeMortier: Math.round(volumeMortier * 1000) / 1000,
    sacsCiment,
    volumeSable: Math.round(volumeSable * 100) / 100,
    margePourcentage: marge,
  };
}

/**
 * @typedef {Object} BetonResult
 * @property {number} volumeBeton - Volume de béton en m³
 * @property {number} poidsCimentKg - Poids de ciment en kg
 * @property {number} sacsCiment - Nombre de sacs de ciment (50kg)
 * @property {number} volumeSable - Volume de sable en m³
 * @property {number} volumeGravier - Volume de gravier en m³
 * @property {string} typeElement - Type d'élément (dalle, poteau, semelle)
 */

/**
 * Calculer les besoins en béton armé
 * @param {Object} params - Paramètres
 * @param {string} params.type - Type d'élément: 'dalle', 'poteau', 'semelle', 'poutre'
 * @param {number} params.longueur - Longueur en mètres
 * @param {number} params.largeur - Largeur en mètres
 * @param {number} params.hauteur - Hauteur/Épaisseur en mètres
 * @param {number} params.dosageCiment - Dosage en ciment kg/m³ (optionnel, défaut 350)
 * @returns {BetonResult} Résultats du calcul
 */
function calculerBetonArme({ type, longueur, largeur, hauteur, dosageCiment = 350 }) {
  // Calcul du volume de béton
  let volumeBeton;
  
  switch (type.toLowerCase()) {
    case 'dalle':
    case 'plancher':
      volumeBeton = longueur * largeur * hauteur;
      break;
    case 'poteau':
    case 'pilier':
      volumeBeton = largeur * largeur * hauteur; // Section carrée
      break;
    case 'semelle':
      volumeBeton = longueur * largeur * hauteur;
      break;
    case 'poutre':
      volumeBeton = longueur * largeur * hauteur;
      break;
    default:
      volumeBeton = longueur * largeur * hauteur;
  }
  
  // Ajout d'une marge de 5% pour pertes et serrage
  const volumeBetonAvecMarge = volumeBeton * 1.05;
  
  // Calcul des matériaux
  const poidsCimentKg = volumeBetonAvecMarge * dosageCiment;
  const sacsCiment = Math.ceil(poidsCimentKg / 50);
  
  const volumeSable = volumeBetonAvecMarge * BTP_CONSTANTS.BETON.DOSAGE_SABLE_M3_M3;
  const volumeGravier = volumeBetonAvecMarge * BTP_CONSTANTS.BETON.DOSAGE_GRAVIER_M3_M3;
  
  return {
    volumeBeton: Math.round(volumeBetonAvecMarge * 100) / 100,
    poidsCimentKg: Math.round(poidsCimentKg),
    sacsCiment,
    volumeSable: Math.round(volumeSable * 100) / 100,
    volumeGravier: Math.round(volumeGravier * 100) / 100,
    typeElement: type,
  };
}

/**
 * @typedef {Object} FerBetontResult
 * @property {number} longueurTotale - Longueur totale de fer en mètres linéaires
 * @property {number} poidsTotal - Poids total en kg
 * @property {number} nombreBarres - Nombre de barres (longueur standard 12m)
 * @property {string} diametre - Diamètre du fer
 */

/**
 * Calculer les besoins en fers à béton pour une dalle
 * @param {Object} params - Paramètres
 * @param {number} params.surface - Surface de la dalle en m²
 * @param {number} params.longueur - Longueur de la dalle en mètres
 * @param {number} params.largeur - Largeur de la dalle en mètres
 * @param {string} params.diametre - Diamètre du fer ('8', '10', '12')
 * @param {number} params.espacement - Espacement des fers en cm (défaut 20cm)
 * @param {number} params.nappes - Nombre de nappes (1 ou 2, défaut 2)
 * @returns {FerBetontResult} Résultats du calcul
 */
function calculerFersBetont({ surface, longueur, largeur, diametre = '10', espacement = 20, nappes = 2 }) {
  const espacementM = espacement / 100; // Conversion en mètres
  
  // Calcul du nombre de barres dans chaque direction
  const nombreBarresLongueur = Math.ceil(largeur / espacementM) + 1;
  const nombreBarresLargeur = Math.ceil(longueur / espacementM) + 1;
  
  // Longueur totale avec recouvrement
  const longueurTotaleDirection1 = nombreBarresLongueur * (longueur + BTP_CONSTANTS.FER_BETON.RECouvreMENT);
  const longueurTotaleDirection2 = nombreBarresLargeur * (largeur + BTP_CONSTANTS.FER_BETON.RECouvreMENT);
  
  // Total pour une nappe
  const longueurTotaleUneNappe = longueurTotaleDirection1 + longueurTotaleDirection2;
  
  // Total pour toutes les nappes
  const longueurTotale = longueurTotaleUneNappe * nappes;
  
  // Calcul du poids
  const poidsParMl = BTP_CONSTANTS.FER_BETON.POIDS_PAR_ML[diametre] || 0.617; // Default 10mm
  const poidsTotal = longueurTotale * poidsParMl;
  
  // Nombre de barres (longueur standard 12m)
  const nombreBarres = Math.ceil(longueurTotale / 12);
  
  return {
    longueurTotale: Math.round(longueurTotale * 10) / 10,
    poidsTotal: Math.round(poidsTotal * 10) / 10,
    nombreBarres,
    diametre: `${diametre}mm`,
    nappes,
  };
}

/**
 * @typedef {Object} ToitureResult
 * @property {number} surfaceToiture - Surface de toiture en m²
 * @property {nombre} nombreToles - Nombre de tôles nécessaires
 * @property {number} longueurChevrons - Longueur totale de chevrons en mètres
 * @property {number} nombreChevrons - Nombre de chevrons
 * @property {number} poidsPointes - Poids des pointes/vis en kg
 */

/**
 * Calculer les besoins pour une toiture
 * @param {Object} params - Paramètres
 * @param {number} params.longueur - Longueur du bâtiment en mètres
 * @param {number} params.largeur - Largeur du bâtiment en mètres
 * @param {number} params.pente - Pente de toit en % (optionnel)
 * @param {number} params.longueurTole - Longueur des tôles en mètres (2, 3, 4)
 * @param {number} params.debord - Débord de toit en mètres (optionnel, défaut 0.5)
 * @returns {ToitureResult} Résultats du calcul
 */
function calculerToiture({ longueur, largeur, pente = 0, longueurTole = 3, debord = 0.5 }) {
  // Surface au sol avec débords
  const longueurAvecDebord = longueur + (2 * debord);
  const largeurAvecDebord = largeur + (2 * debord);
  const surfaceAuSol = longueurAvecDebord * largeurAvecDebord;
  
  // Coefficient de pente (Pythagore)
  const coefficientPente = pente > 0 ? Math.sqrt(1 + Math.pow(pente / 100, 2)) : 1.05; // Minimum 5% pour écoulement
  
  // Surface réelle de toiture
  const surfaceToiture = surfaceAuSol * coefficientPente;
  
  // Nombre de tôles (largeur utile 1m après recouvrement)
  const largeurUtilesTole = BTP_CONSTANTS.TOITURE.TOLE_LARGEUR_UTILE;
  const nombreTolesLigne = Math.ceil(largeurAvecDebord / largeurUtilesTole);
  const nombreRangs = Math.ceil(longueurAvecDebord / longueurTole);
  const nombreToles = nombreTolesLigne * nombreRangs;
  
  // Chevrons (entraxe 60cm)
  const nombreChevrons = Math.ceil(longueurAvecDebord / BTP_CONSTANTS.TOITURE.CHEVRONS_ENTRAXE) + 1;
  const longueurChevrons = nombreChevrons * largeurAvecDebord;
  
  // Pointes/vis (8 par m²)
  const nombrePointes = Math.ceil(surfaceToiture * BTP_CONSTANTS.TOITURE.POINTES_PAR_M2);
  const poidsPointes = nombrePointes * 0.05; // ~50g par pointe
  
  return {
    surfaceToiture: Math.round(surfaceToiture * 100) / 100,
    nombreToles,
    longueurToleUnite: longueurTole,
    longueurChevrons: Math.round(longueurChevrons * 10) / 10,
    nombreChevrons,
    poidsPointes: Math.round(poidsPointes * 10) / 10,
    nombrePointes,
  };
}

/**
 * @typedef {Object} PeintureResult
 * @property {number} surfaceAPeindre - Surface à peindre en m²
 * @property {number} volumePeinture - Volume de peinture en litres
 * @property {number} nombrePot - Nombre de pots (selon conditionnement)
 * @property {number} couches - Nombre de couches
 */

/**
 * Calculer les besoins en peinture
 * @param {Object} params - Paramètres
 * @param {number} params.surface - Surface à peindre en m²
 * @param {number} params.pouvoirCouvrant - Pouvoir couvrant en m²/L (défaut 10)
 * @param {number} params.couches - Nombre de couches (défaut 2)
 * @param {number} params.conditionnement - Conditionnement en L (défaut 20L)
 * @returns {PeintureResult} Résultats du calcul
 */
function calculerPeinture({ surface, pouvoirCouvrant = 10, couches = 2, conditionnement = 20 }) {
  // Volume total nécessaire
  const volumeNecessaire = (surface * couches) / pouvoirCouvrant;
  
  // Ajout de 10% de marge pour pertes
  const volumeAvecMarge = volumeNecessaire * 1.10;
  
  // Nombre de pots
  const nombrePot = Math.ceil(volumeAvecMarge / conditionnement);
  
  return {
    surfaceAPeindre: Math.round(surface * 100) / 100,
    volumePeinture: Math.round(volumeAvecMarge * 10) / 10,
    nombrePot,
    conditionnementLitres: conditionnement,
    couches,
  };
}

/**
 * @typedef {Object} CarrelageResult
 * @property {number} surfaceCarreler - Surface à carreler en m²
 * @property {number} nombreSacsColle - Nombre de sacs de colle
 * @property {number} poidsJoint - Poids de joint en kg
 */

/**
 * Calculer les besoins pour carrelage
 * @param {Object} params - Paramètres
 * @param {number} params.surface - Surface à carreler en m²
 * @param {number} params.rendementColle - Rendement colle en m²/sac 25kg (défaut 5)
 * @returns {CarrelageResult} Résultats du calcul
 */
function calculerCarrelage({ surface, rendementColle = 5 }) {
  // Marge de 10% pour découpes
  const surfaceAvecMarge = surface * 1.10;
  
  // Colle à carrelage
  const nombreSacsColle = Math.ceil(surfaceAvecMarge / rendementColle);
  
  // Jointoiement (0.5 kg/m²)
  const poidsJoint = Math.ceil(surfaceAvecMarge * BTP_CONSTANTS.CARRELAGE.JOINT_RENDEMENT_M2_KG);
  
  return {
    surfaceCarreler: Math.round(surfaceAvecMarge * 100) / 100,
    nombreSacsColle,
    poidsJoint,
  };
}

/**
 * Calcul complet pour un projet de construction
 * @param {Object} projet - Données complètes du projet
 * @returns {Object} Résultats complets
 */
function calculProjetComplet(projet) {
  const resultats = {
    resume: {
      dateCalcul: new Date().toISOString(),
      typeProjet: projet.type || 'general',
    },
    maconnerie: [],
    beton: [],
    fers: [],
    toiture: null,
    peinture: null,
    carrelage: null,
    totalMateriaux: {
      cimentSacs: 0,
      sableM3: 0,
      gravierM3: 0,
      parpaings: 0,
      fersKg: 0,
    },
  };
  
  // Calculs maçonnerie
  if (projet.murs && Array.isArray(projet.murs)) {
    projet.murs.forEach(mur => {
      const resultat = calculerMaconnerie(mur);
      resultats.maconnerie.push(resultat);
      resultats.totalMateriaux.cimentSacs += resultat.sacsCiment;
      resultats.totalMateriaux.sableM3 += resultat.volumeSable;
      resultats.totalMateriaux.parpaings += resultat.nombreParpaings;
    });
  }
  
  // Calculs béton
  if (projet.betons && Array.isArray(projet.betons)) {
    projet.betons.forEach(beton => {
      const resultat = calculerBetonArme(beton);
      resultats.beton.push(resultat);
      resultats.totalMateriaux.cimentSacs += resultat.sacsCiment;
      resultats.totalMateriaux.sableM3 += resultat.volumeSable;
      resultats.totalMateriaux.gravierM3 += resultat.volumeGravier;
    });
  }
  
  // Calculs fers à béton
  if (projet.fers && Array.isArray(projet.fers)) {
    projet.fers.forEach(fers => {
      const resultat = calculerFersBetont(fers);
      resultats.fers.push(resultat);
      resultats.totalMateriaux.fersKg += resultat.poidsTotal;
    });
  }
  
  // Calcul toiture
  if (projet.toiture) {
    resultats.toiture = calculerToiture(projet.toiture);
  }
  
  // Calcul peinture
  if (projet.peinture) {
    resultats.peinture = calculerPeinture(projet.peinture);
  }
  
  // Calcul carrelage
  if (projet.carrelage) {
    resultats.carrelage = calculerCarrelage(projet.carrelage);
  }
  
  return resultats;
}

// Export des fonctions et constantes
module.exports = {
  BTP_CONSTANTS,
  calculerMaconnerie,
  calculerBetonArme,
  calculerFersBetont,
  calculerToiture,
  calculerPeinture,
  calculerCarrelage,
  calculProjetComplet,
};
