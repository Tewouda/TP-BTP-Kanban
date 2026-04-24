# 🏗️ BTP Kanban — Suivi de chantiers

Application web de suivi de chantiers BTP sous forme de tableau Kanban.
Permet de visualiser rapidement l'état des projets, les tâches en cours, les blocages et les étapes terminées.

## 📋 Fonctionnalités

### Terminées ✅
- **Page d'accueil** : présentation de l'application avec liens de navigation
- **Page Chantiers** : liste des projets sous forme de cartes avec barre de progression
- **Tableau Kanban** : 4 colonnes (À faire, En cours, Bloqué, Terminé) pour chaque chantier
- **Drag & Drop** : déplacement fluide des tâches entre les colonnes avec `vuedraggable`
- **Détail de tâche** : page complète avec toutes les informations d'une tâche et gestion de notes/commentaires
- **Formulaire d'ajout & édition** : création et modification de tâches avec validation (v-model)
- **Filtres avancés** : recherche textuelle, filtre par statut, priorité, responsable et tri (échéance, priorité)
- **Gestion du cycle de vie** : ajout, modification, archivage et suppression avec confirmation
- **Sélecteur de chantiers** : navigation rapide entre les projets depuis le Kanban
- **Indicateurs visuels** : mise en évidence des tâches en retard et des priorités hautes
- **2 profils métier** : Chef de projet (Marc Dupont) et Conductrice de travaux (Sophie Martin)
- **3 chantiers réalistes** : construction, rénovation, extension
- **20 tâches métier BTP** réparties sur les 4 statuts
- **API REST complète** : GET, POST, PATCH et DELETE pour projets et tâches
- **Navigation Vue Router** : /, /projects, /kanban/:id, /tasks/:id

### Limites connues ⚠️
- Pas d'authentification utilisateur (sessions fictives basées sur les filtres)
- Base de données SQLite fichier (pas de serveur de base de données distant)
- Pas de tests unitaires automatisés

### Prochaines étapes 🔮
- Mettre en place l'authentification (JWT)
- Ajouter des notifications en temps réel (WebSocket)
- Implémenter l'upload de documents (plans, photos) par tâche
- Déployer l'application (Docker / Vercel + Railway)

## 🏗️ Arborescence du projet

```
TP-BTP-Kanban/
├── client/                          # Frontend Vue.js 3 (Vite)
│   ├── src/
│   │   ├── assets/
│   │   │   └── main.css             # Design system BTP (gris, bleu, orange, blanc)
│   │   ├── components/
│   │   │   ├── Navbar.vue           # Barre de navigation
│   │   │   ├── ProjectCard.vue      # Carte de chantier
│   │   │   ├── KanbanColumn.vue     # Colonne du tableau Kanban
│   │   │   ├── TaskCard.vue         # Carte de tâche
│   │   │   └── TaskForm.vue         # Formulaire d'ajout (v-model + validation)
│   │   ├── views/
│   │   │   ├── HomeView.vue         # Page d'accueil
│   │   │   ├── ProjectsView.vue     # Liste des chantiers
│   │   │   ├── KanbanView.vue       # Tableau Kanban d'un chantier
│   │   │   └── TaskDetailView.vue   # Détail d'une tâche
│   │   ├── services/
│   │   │   └── api.js               # Appels API centralisés
│   │   ├── router/
│   │   │   └── index.js             # Routes Vue Router
│   │   ├── App.vue                  # Composant racine
│   │   └── main.js                  # Point d'entrée
│   ├── index.html
│   └── package.json
├── server/                          # Backend Express.js
│   ├── db/
│   │   ├── database.js              # Connexion SQLite (sql.js)
│   │   └── seed.js                  # Données initiales réalistes
│   ├── routes/
│   │   ├── projects.js              # Routes API projets
│   │   └── tasks.js                 # Routes API tâches (avec filtres)
│   ├── server.js                    # Point d'entrée Express
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Lancement

### Prérequis
- **Node.js** v18+ (testé avec v24.13.1)
- **npm** v8+

### Installation et démarrage

```bash
# 1. Cloner le dépôt
git clone https://github.com/Tewouda/TP-BTP-Kanban.git
cd TP-BTP-Kanban

# 2. Installer les dépendances du serveur
cd server
npm install

# 3. Initialiser la base de données avec les données de test
npm run seed

# 4. Démarrer le serveur backend (port 3000)
npm start

# 5. Dans un NOUVEAU terminal, installer et démarrer le frontend
cd ../client
npm install
npm run dev
```

### Accès
- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:3000/api

## 🔌 API REST

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/projects` | Liste tous les chantiers |
| `GET` | `/api/projects/:id` | Détail d'un chantier |
| `GET` | `/api/projects/:id/tasks` | Tâches d'un chantier (filtres: `?status=`, `?priority=`, `?search=`) |
| `GET` | `/api/tasks/:id` | Détail d'une tâche |
| `POST` | `/api/projects/:id/tasks` | Créer une tâche |
| `PATCH` | `/api/tasks/:id` | Modifier une tâche |

## 🎨 Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Vue.js 3 + Vite |
| Routage | Vue Router 4 |
| Backend | Express.js 4 |
| Base de données | SQLite (sql.js) |
| Styles | CSS vanilla (design system BTP) |

## 👥 Données de test

### Chantiers
1. **Résidence Les Érables** — Construction immeuble (Toulouse)
2. **Pont du Canal** — Rénovation ouvrage d'art (Bordeaux)
3. **École Jean Jaurès** — Extension école (Lyon)

### Profils
- **Marc Dupont** — Chef de projet
- **Sophie Martin** — Conductrice de travaux
