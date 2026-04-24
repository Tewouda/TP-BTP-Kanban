/**
 * database.js — Connexion et initialisation de la base de données SQLite
 *
 * Ce module utilise sql.js (SQLite compilé en WebAssembly) pour gérer
 * la base de données sans dépendance native.
 *
 * Tables :
 * - projects : informations sur les chantiers (nom, lieu, dates, statut)
 * - tasks    : tâches associées à un chantier (titre, responsable, priorité, etc.)
 *
 * La base est persistée dans un fichier btp_kanban.db.
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de base de données
const DB_PATH = path.join(__dirname, '..', 'btp_kanban.db');

/**
 * Initialise et retourne l'instance de la base de données.
 * Si le fichier existe déjà, il est chargé ; sinon une nouvelle base est créée.
 *
 * @returns {Promise<Database>} Instance de la base de données sql.js
 */
async function getDatabase() {
  const SQL = await initSqlJs();

  let db;

  // Chargement de la base existante ou création d'une nouvelle
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Activation des clés étrangères pour garantir l'intégrité des données
  db.run('PRAGMA foreign_keys = ON');

  /**
   * Création de la table "projects" — Chantiers BTP
   * Champs :
   *   - id          : identifiant unique auto-incrémenté
   *   - name        : nom du chantier
   *   - description : description détaillée du chantier
   *   - location    : localisation du chantier (ville)
   *   - start_date  : date de début du chantier
   *   - end_date    : date de fin prévue
   *   - status      : statut global du chantier (en_cours, terminé, en_attente)
   */
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      description TEXT,
      location    TEXT,
      start_date  TEXT,
      end_date    TEXT,
      status      TEXT DEFAULT 'en_cours'
    )
  `);

  /**
   * Création de la table "tasks" — Tâches de chantier
   * Champs :
   *   - id          : identifiant unique auto-incrémenté
   *   - project_id  : référence au chantier (clé étrangère → projects.id)
   *   - title       : titre de la tâche
   *   - description : description détaillée
   *   - notes       : notes et commentaires de suivi
   *   - status      : statut Kanban (a_faire, en_cours, bloque, termine)
   *   - priority    : niveau de priorité (haute, moyenne, basse)
   *   - assigned_to : responsable de la tâche (nom)
   *   - role        : rôle du responsable (chef_de_projet, conducteur_de_travaux)
   *   - due_date    : date d'échéance
   *   - is_archived : booléen d'archivage (0 ou 1)
   *   - created_at  : date de création (auto-générée)
   */
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id  INTEGER NOT NULL,
      title       TEXT NOT NULL,
      description TEXT,
      notes       TEXT,
      status      TEXT DEFAULT 'a_faire',
      priority    TEXT DEFAULT 'moyenne',
      assigned_to TEXT,
      role        TEXT,
      due_date    TEXT,
      is_archived INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Sauvegarde de la base sur le disque
  saveDatabase(db);

  return db;
}

/**
 * Sauvegarde l'état actuel de la base de données dans le fichier.
 * Appelé après chaque opération d'écriture.
 *
 * @param {Database} db - Instance de la base de données sql.js
 */
function saveDatabase(db) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

module.exports = { getDatabase, saveDatabase, DB_PATH };
