/**
 * routes/tasks.js — Routes API pour les tâches de chantier
 *
 * Ce module définit les routes Express pour la gestion des tâches :
 * - GET    /api/projects/:projectId/tasks  → Liste les tâches d'un chantier (avec filtres)
 * - POST   /api/projects/:projectId/tasks  → Crée une nouvelle tâche
 * - GET    /api/tasks/:id                  → Détail d'une tâche
 * - PATCH  /api/tasks/:id                  → Met à jour une tâche (statut, etc.)
 */

const express = require('express');
const router = express.Router();
const { saveDatabase } = require('../db/database');

/**
 * Fonction utilitaire : transforme le résultat sql.js en tableau d'objets.
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
 * GET /api/projects/:projectId/tasks
 * Retourne les tâches d'un projet, avec possibilité de filtrer par :
 * - status   : filtre par statut Kanban (a_faire, en_cours, bloque, termine)
 * - priority : filtre par priorité (haute, moyenne, basse)
 * - search   : recherche textuelle dans le titre ou la description
 *
 * Exemple : GET /api/projects/1/tasks?status=en_cours&priority=haute
 */
router.get('/projects/:projectId/tasks', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { projectId } = req.params;
    const { status, priority, search } = req.query;

    // Construction dynamique de la requête SQL avec filtres optionnels
    let query = 'SELECT * FROM tasks WHERE project_id = ?';
    const params = [Number(projectId)];

    // Filtre par statut Kanban
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Filtre par niveau de priorité
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    // Recherche textuelle dans le titre ou la description
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at ASC';

    const result = db.exec(query, params);
    res.json(resultToObjects(result));
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/tasks/:id
 * Retourne le détail complet d'une tâche, incluant le nom du chantier associé.
 * Utilisé par la page de détail d'une tâche (/tasks/:id).
 */
router.get('/tasks/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Jointure avec la table projects pour obtenir le nom du chantier
    const result = db.exec(`
      SELECT t.*, p.name AS project_name, p.location AS project_location
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `, [Number(id)]);

    const tasks = resultToObjects(result);

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    res.json(tasks[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de la tâche :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/projects/:projectId/tasks
 * Crée une nouvelle tâche pour un chantier.
 * Corps attendu (JSON) : { title, description, priority, assigned_to, role, due_date }
 * Le statut initial est toujours "a_faire".
 */
router.post('/projects/:projectId/tasks', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { projectId } = req.params;
    const { title, description, priority, assigned_to, role, due_date } = req.body;

    // Validation minimale : le titre est obligatoire
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Le titre de la tâche est obligatoire.' });
    }

    // Vérification que le projet existe
    const projectResult = db.exec('SELECT id FROM projects WHERE id = ?', [Number(projectId)]);
    if (resultToObjects(projectResult).length === 0) {
      return res.status(404).json({ error: 'Projet non trouvé.' });
    }

    // Insertion de la nouvelle tâche avec le statut "a_faire" par défaut
    db.run(
      `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, role, due_date)
       VALUES (?, ?, ?, 'a_faire', ?, ?, ?, ?)`,
      [Number(projectId), title.trim(), description || '', priority || 'moyenne', assigned_to || '', role || '', due_date || null]
    );

    // Sauvegarde de la base sur le disque après écriture
    saveDatabase(db);

    // Récupération de la tâche créée pour la retourner au client
    const newTaskResult = db.exec('SELECT * FROM tasks WHERE id = last_insert_rowid()');
    const newTask = resultToObjects(newTaskResult)[0];

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Erreur lors de la création de la tâche :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PATCH /api/tasks/:id
 * Met à jour une tâche existante (un ou plusieurs champs).
 * Utilisé notamment pour le changement de statut lors du drag-and-drop Kanban.
 * Corps attendu (JSON) : champs à modifier parmi { title, description, status, priority, assigned_to, role, due_date }
 */
router.patch('/tasks/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Vérification que la tâche existe
    const existingResult = db.exec('SELECT * FROM tasks WHERE id = ?', [Number(id)]);
    const existing = resultToObjects(existingResult);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée.' });
    }

    // Liste des champs modifiables
    const allowedFields = ['title', 'description', 'status', 'priority', 'assigned_to', 'role', 'due_date'];
    const updates = [];
    const values = [];

    // Construction dynamique de la requête UPDATE
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    // Si aucun champ à mettre à jour, retourner la tâche telle quelle
    if (updates.length === 0) {
      return res.json(existing[0]);
    }

    values.push(Number(id));

    db.run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);

    // Sauvegarde de la base sur le disque après écriture
    saveDatabase(db);

    // Retourner la tâche mise à jour
    const updatedResult = db.exec('SELECT * FROM tasks WHERE id = ?', [Number(id)]);
    res.json(resultToObjects(updatedResult)[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
