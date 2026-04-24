/**
 * routes/projects.js — Routes API pour les chantiers BTP
 *
 * Ce module définit les routes Express pour la gestion des projets :
 * - GET /api/projects       → Liste tous les chantiers
 * - GET /api/projects/:id   → Détail d'un chantier avec le compte de tâches par statut
 */

const express = require('express');
const router = express.Router();

/**
 * Middleware : injection de la base de données dans les requêtes.
 * La base est attachée à req.app.locals.db par server.js au démarrage.
 */

/**
 * Fonction utilitaire : transforme le résultat sql.js en tableau d'objets.
 * sql.js retourne { columns: [...], values: [[...], ...] }
 * On convertit en [{ col1: val1, col2: val2 }, ...]
 *
 * @param {Array} result - Résultat d'une requête sql.js (db.exec)
 * @returns {Array<Object>} Tableau d'objets clé-valeur
 */
function resultToObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

/**
 * GET /api/projects
 * Retourne la liste de tous les projets avec le nombre total de tâches pour chacun.
 * Utilisé par la page "Projets / Chantiers" pour afficher les cartes.
 */
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;

    // Requête avec sous-requête pour compter les tâches associées à chaque projet
    const result = db.exec(`
      SELECT
        p.*,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'termine') AS completed_count
      FROM projects p
      ORDER BY p.id ASC
    `);

    res.json(resultToObjects(result));
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/projects/:id
 * Retourne le détail d'un projet spécifique, avec le décompte de tâches par statut.
 * Utilisé par la page Kanban pour afficher les infos du chantier.
 */
router.get('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Récupération du projet
    const projectResult = db.exec('SELECT * FROM projects WHERE id = ?', [Number(id)]);
    const projects = resultToObjects(projectResult);

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const project = projects[0];

    // Comptage des tâches par statut pour ce projet
    const countResult = db.exec(`
      SELECT status, COUNT(*) AS count
      FROM tasks
      WHERE project_id = ?
      GROUP BY status
    `, [Number(id)]);

    // Transformation en objet { a_faire: 3, en_cours: 2, ... }
    const counts = {};
    const countRows = resultToObjects(countResult);
    for (const row of countRows) {
      counts[row.status] = row.count;
    }

    res.json({ ...project, statusCounts: counts });
  } catch (error) {
    console.error('Erreur lors de la récupération du projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
