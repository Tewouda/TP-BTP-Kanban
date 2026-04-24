/**
 * server.js — Point d'entrée du serveur Express
 *
 * Ce fichier configure et démarre le serveur backend de l'application
 * Kanban BTP. Il initialise la base de données, monte les routes API
 * et lance l'écoute sur le port 3000.
 *
 * Routes montées :
 * - /api/projects  → CRUD des chantiers (routes/projects.js)
 * - /api           → CRUD des tâches (routes/tasks.js)
 */

const express = require('express');
const cors = require('cors');
const { getDatabase } = require('./db/database');

// Import des routes
const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');

const PORT = 3000;
const app = express();

// ============================================================
// Middlewares globaux
// ============================================================

// CORS : autorise les requêtes depuis le frontend (port 5173 par défaut avec Vite)
app.use(cors());

// Parsing du JSON dans le corps des requêtes POST/PATCH
app.use(express.json());

// ============================================================
// Démarrage asynchrone (nécessaire pour initialiser sql.js)
// ============================================================
async function start() {
  // Initialisation de la base de données
  const db = await getDatabase();

  // Stockage de la base dans app.locals pour accès depuis les routes
  app.locals.db = db;

  console.log('📦 Base de données connectée.');

  // ============================================================
  // Montage des routes API
  // ============================================================

  // Routes pour les projets : /api/projects
  app.use('/api/projects', projectsRouter);

  // Routes pour les tâches : /api/projects/:id/tasks et /api/tasks/:id
  app.use('/api', tasksRouter);

  // ============================================================
  // Route de test / santé du serveur
  // ============================================================
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Serveur BTP Kanban opérationnel' });
  });

  // ============================================================
  // Démarrage du serveur
  // ============================================================
  app.listen(PORT, () => {
    console.log(`🚀 Serveur BTP Kanban démarré sur http://localhost:${PORT}`);
    console.log(`📋 API disponible sur http://localhost:${PORT}/api`);
  });
}

// Lancement du serveur
start().catch(err => {
  console.error('❌ Erreur au démarrage du serveur :', err);
  process.exit(1);
});
