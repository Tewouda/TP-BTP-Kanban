/**
 * seed.js — Insertion des données initiales dans la base de données
 *
 * Ce script peuple la base avec des données réalistes du secteur BTP :
 * - 3 chantiers avec des localisations et descriptions crédibles
 * - 2 profils métier : chef de projet et conducteur de travaux
 * - ~20 tâches réparties sur les 4 statuts Kanban
 *
 * Usage : npm run seed (ou node db/seed.js)
 */

const { getDatabase, saveDatabase } = require('./database');

async function seed() {
  const db = await getDatabase();

  // ============================================================
  // Nettoyage des données existantes avant le re-seed
  // ============================================================
  db.run('DELETE FROM tasks');
  db.run('DELETE FROM projects');
  console.log('🧹 Tables nettoyées.');

  // ============================================================
  // Insertion des projets (chantiers BTP)
  // ============================================================

  /**
   * Les 3 chantiers représentent des types de projets BTP courants :
   * 1. Construction neuve (résidentiel)
   * 2. Rénovation d'ouvrage d'art
   * 3. Extension de bâtiment public
   */
  const projects = [
    {
      name: 'Résidence Les Érables',
      description: "Construction d'un immeuble résidentiel de 24 logements (R+4) avec parking souterrain. Livraison prévue fin 2026.",
      location: 'Toulouse',
      start_date: '2026-01-15',
      end_date: '2026-12-20',
      status: 'en_cours'
    },
    {
      name: 'Pont du Canal',
      description: "Rénovation complète d'un pont en béton armé datant de 1975. Remplacement des garde-corps, reprise de l'étanchéité et renforcement structurel.",
      location: 'Bordeaux',
      start_date: '2026-03-01',
      end_date: '2026-09-30',
      status: 'en_cours'
    },
    {
      name: 'École Jean Jaurès',
      description: "Extension d'une école primaire : ajout de 4 salles de classe, d'un réfectoire et d'une cour couverte. Travaux durant les vacances scolaires.",
      location: 'Lyon',
      start_date: '2026-06-01',
      end_date: '2027-02-28',
      status: 'en_attente'
    }
  ];

  // Insertion de chaque projet
  const projectIds = [];
  for (const p of projects) {
    db.run(
      `INSERT INTO projects (name, description, location, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [p.name, p.description, p.location, p.start_date, p.end_date, p.status]
    );
    // Récupérer l'ID du dernier projet inséré
    const result = db.exec('SELECT last_insert_rowid() AS id');
    const id = result[0].values[0][0];
    projectIds.push(id);
    console.log(`📁 Projet inséré : ${p.name} (ID: ${id})`);
  }

  // ============================================================
  // Insertion des tâches de chantier
  // ============================================================

  /**
   * Deux profils métier utilisés pour l'assignation des tâches :
   * - Marc Dupont      → Chef de projet (planification, coordination, suivi)
   * - Sophie Martin    → Conductrice de travaux (exécution terrain, contrôle qualité)
   */
  const tasks = [
    // ── Projet 1 : Résidence Les Érables (Toulouse) ──
    { pid: 0, title: 'Terrassement général', desc: 'Décapage de la terre végétale et excavation pour les fondations. Volume estimé : 2500 m³.', status: 'termine', priority: 'haute', who: 'Sophie Martin', role: 'conducteur_de_travaux', due: '2026-02-15' },
    { pid: 0, title: 'Coulage des fondations', desc: 'Réalisation des semelles filantes et du radier. Béton C25/30.', status: 'termine', priority: 'haute', who: 'Sophie Martin', role: 'conducteur_de_travaux', due: '2026-03-10' },
    { pid: 0, title: 'Élévation des murs porteurs (RDC)', desc: 'Montage des murs porteurs du rez-de-chaussée en parpaings de 20 cm.', status: 'en_cours', priority: 'haute', who: 'Sophie Martin', role: 'conducteur_de_travaux', due: '2026-05-01' },
    { pid: 0, title: 'Commande des menuiseries extérieures', desc: "Commande des fenêtres PVC double vitrage et portes d'entrée sécurisées.", status: 'en_cours', priority: 'moyenne', who: 'Marc Dupont', role: 'chef_de_projet', due: '2026-05-15' },
    { pid: 0, title: 'Installation réseau électrique', desc: 'Passage des gaines et câblage conforme NF C 15-100.', status: 'a_faire', priority: 'moyenne', who: 'Marc Dupont', role: 'chef_de_projet', due: '2026-07-01' },
    { pid: 0, title: 'Pose de la charpente', desc: 'Installation de la charpente bois lamellé-collé sur le dernier niveau.', status: 'a_faire', priority: 'haute', who: 'Sophie Martin', role: 'conducteur_de_travaux', due: '2026-08-15' },
    { pid: 0, title: "Attente validation bureau d'études", desc: "En attente du rapport du bureau d'études structure pour le parking souterrain.", status: 'bloque', priority: 'haute', who: 'Marc Dupont', role: 'chef_de_projet', due: '2026-04-30' },

    // ── Projet 2 : Pont du Canal (Bordeaux) ──
    { pid: 1, title: 'Diagnostic structurel', desc: "Inspection complète de l'ouvrage : carottages, mesures de carbonatation, relevé des fissures.", status: 'termine', priority: 'haute', who: 'Marc Dupont', role: 'chef_de_projet', due: '2026-03-20' },
    { pid: 1, title: 'Mise en place des échafaudages', desc: 'Installation des échafaudages sur toute la longueur du pont (45 m).', status: 'termine', priority: 'haute', who: 'Sophie Martin', role: 'conducteur_de_travaux', due: '2026-04-01' },
    { pid: 1, title: 'Reprise du béton dégradé', desc: 'Purge du béton carbonaté, traitement des armatures et ragréage.', status: 'en_cours', priority: 'haute', who: 'Sophie Martin', role: 'conducteur_de_travaux', due: '2026-05-30' },
    { pid: 1, title: 'Remplacement des garde-corps', desc: 'Dépose des anciens garde-corps et pose de garde-corps conformes NF P 98-405.', status: 'a_faire', priority: 'moyenne', who: 'Sophie Martin', role: 'conducteur_de_travaux', due: '2026-06-30' },
    { pid: 1, title: 'Étanchéité du tablier', desc: "Application d'une membrane d'étanchéité bitumineuse sur le tablier du pont.", status: 'a_faire', priority: 'moyenne', who: 'Sophie Martin', role: 'conducteur_de_travaux', due: '2026-07-15' },
    { pid: 1, title: 'Autorisation préfectorale en attente', desc: 'Dossier déposé pour la déviation de circulation. Réponse attendue de la préfecture.', status: 'bloque', priority: 'haute', who: 'Marc Dupont', role: 'chef_de_projet', due: '2026-04-15' },
    { pid: 1, title: 'Coordination avec la mairie', desc: 'Réunion de suivi avec les services techniques municipaux pour le planning des travaux.', status: 'en_cours', priority: 'basse', who: 'Marc Dupont', role: 'chef_de_projet', due: '2026-05-10' },

    // ── Projet 3 : École Jean Jaurès (Lyon) ──
    { pid: 2, title: 'Étude de sol', desc: "Sondages géotechniques pour valider la portance du terrain d'extension.", status: 'termine', priority: 'haute', who: 'Marc Dupont', role: 'chef_de_projet', due: '2026-04-01' },
    { pid: 2, title: 'Dépôt du permis de construire', desc: 'Constitution et dépôt du dossier de permis de construire en mairie.', status: 'en_cours', priority: 'haute', who: 'Marc Dupont', role: 'chef_de_projet', due: '2026-05-01' },
    { pid: 2, title: 'Consultation des entreprises', desc: "Lancement des appels d'offres pour les lots gros œuvre, charpente et couverture.", status: 'a_faire', priority: 'moyenne', who: 'Marc Dupont', role: 'chef_de_projet', due: '2026-06-01' },
    { pid: 2, title: 'Préparation du chantier', desc: 'Installation de la base vie, clôture de chantier, branchements provisoires.', status: 'a_faire', priority: 'moyenne', who: 'Sophie Martin', role: 'conducteur_de_travaux', due: '2026-07-01' },
    { pid: 2, title: 'Démolition partielle', desc: "Démolition du préau existant pour libérer l'emprise de l'extension.", status: 'a_faire', priority: 'basse', who: 'Sophie Martin', role: 'conducteur_de_travaux', due: '2026-07-15' },
    { pid: 2, title: "Avis de l'architecte des bâtiments de France", desc: "En attente de l'avis de l'ABF car le site est en zone protégée.", status: 'bloque', priority: 'haute', who: 'Marc Dupont', role: 'chef_de_projet', due: '2026-05-15' }
  ];

  // Insertion de toutes les tâches
  for (const t of tasks) {
    db.run(
      `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, role, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectIds[t.pid], t.title, t.desc, t.status, t.priority, t.who, t.role, t.due]
    );
  }

  // Sauvegarde de la base sur le disque
  saveDatabase(db);

  console.log(`✅ ${tasks.length} tâches insérées avec succès.`);
  console.log('🎉 Base de données initialisée !');
}

// Exécution du seed
seed().catch(err => {
  console.error('Erreur lors du seed :', err);
  process.exit(1);
});
