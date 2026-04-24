<!--
  KanbanView.vue — Tableau Kanban d'un chantier

  Page principale de suivi d'un chantier, affichant les tâches
  réparties dans 4 colonnes Kanban :
  - À faire (a_faire)
  - En cours (en_cours)
  - Bloqué (bloque)
  - Terminé (termine)

  Fonctionnalités :
  - Chargement des tâches depuis l'API avec filtres
  - Barre de filtres (recherche texte, priorité, statut)
  - Bouton d'ajout de tâche (ouvre le TaskForm en modal)
  - Informations du chantier en en-tête

  Route : /kanban/:id
-->

<template>
  <div class="page">
    <!-- État de chargement -->
    <div v-if="loading" class="loading">
      <div class="loading__spinner"></div>
      Chargement du chantier...
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" style="color: var(--color-bloque); text-align: center; padding: 32px;">
      ⚠️ {{ error }}
    </div>

    <template v-else>
      <!-- En-tête avec informations du chantier -->
      <div class="page__header">
        <h1 class="page__title">🏗️ {{ project.name }}</h1>
        <p class="page__subtitle">
          📍 {{ project.location }} · 📅 {{ formatDate(project.start_date) }} → {{ formatDate(project.end_date) }}
        </p>
      </div>

      <!-- Barre de filtres et bouton d'ajout -->
      <div class="filters">
        <!-- Recherche textuelle -->
        <input
          type="text"
          class="form__input filters__search"
          v-model="filters.search"
          placeholder="🔍 Rechercher une tâche..."
          @input="applyFilters"
        />

        <!-- Filtre par statut -->
        <select
          class="form__select filters__select"
          v-model="filters.status"
          @change="applyFilters"
        >
          <option value="">Tous les statuts</option>
          <option value="a_faire">À faire</option>
          <option value="en_cours">En cours</option>
          <option value="bloque">Bloqué</option>
          <option value="termine">Terminé</option>
        </select>

        <!-- Filtre par priorité -->
        <select
          class="form__select filters__select"
          v-model="filters.priority"
          @change="applyFilters"
        >
          <option value="">Toutes priorités</option>
          <option value="haute">🔴 Haute</option>
          <option value="moyenne">🟡 Moyenne</option>
          <option value="basse">🟢 Basse</option>
        </select>

        <!-- Bouton pour ajouter une tâche -->
        <button class="btn btn--primary" @click="showTaskForm = true">
          ➕ Nouvelle tâche
        </button>
      </div>

      <!-- Tableau Kanban : 4 colonnes -->
      <div class="kanban">
        <KanbanColumn
          v-for="col in columns"
          :key="col.status"
          :status="col.status"
          :label="col.label"
          :tasks="getTasksByStatus(col.status)"
        />
      </div>

      <!-- Modal du formulaire d'ajout de tâche -->
      <TaskForm
        v-if="showTaskForm"
        :project-id="projectId"
        @task-created="onTaskCreated"
        @close="showTaskForm = false"
      />
    </template>
  </div>
</template>

<script>
import KanbanColumn from '../components/KanbanColumn.vue'
import TaskForm from '../components/TaskForm.vue'
import { fetchProject, fetchTasks } from '../services/api'

export default {
  name: 'KanbanView',

  components: {
    KanbanColumn,
    TaskForm
  },

  data() {
    return {
      /** Informations du projet courant */
      project: {},
      /** Liste des tâches du projet (avec filtres appliqués) */
      tasks: [],
      /** État de chargement */
      loading: true,
      /** Message d'erreur */
      error: null,
      /** Affichage du formulaire d'ajout de tâche */
      showTaskForm: false,

      /**
       * Filtres actifs pour la recherche de tâches.
       * Liés avec v-model aux champs de la barre de filtres.
       */
      filters: {
        search: '',
        status: '',
        priority: ''
      },

      /**
       * Définition des 4 colonnes Kanban.
       * Chaque colonne a un identifiant de statut et un libellé affiché.
       */
      columns: [
        { status: 'a_faire', label: 'À faire' },
        { status: 'en_cours', label: 'En cours' },
        { status: 'bloque', label: 'Bloqué' },
        { status: 'termine', label: 'Terminé' }
      ]
    }
  },

  computed: {
    /**
     * Récupère l'ID du projet depuis les paramètres de la route.
     * @returns {string} L'identifiant du projet
     */
    projectId() {
      return this.$route.params.id
    }
  },

  /**
   * Chargement des données au montage du composant :
   * - Détail du projet (nom, localisation, dates)
   * - Liste des tâches du projet
   */
  async mounted() {
    await this.loadData()
  },

  /**
   * Surveillance du changement de route (quand on change de chantier).
   * Recharge les données si l'ID du projet change.
   */
  watch: {
    '$route.params.id'() {
      this.loadData()
    }
  },

  methods: {
    /**
     * Charge le projet et ses tâches depuis l'API.
     * Appelé au montage et lors d'un changement de route.
     */
    async loadData() {
      this.loading = true
      this.error = null
      try {
        // Chargement en parallèle du projet et de ses tâches
        const [project, tasks] = await Promise.all([
          fetchProject(this.projectId),
          fetchTasks(this.projectId)
        ])
        this.project = project
        this.tasks = tasks
      } catch (err) {
        this.error = 'Impossible de charger le chantier. Vérifiez que le serveur est démarré.'
      } finally {
        this.loading = false
      }
    },

    /**
     * Applique les filtres en rechargeant les tâches depuis l'API.
     * Appelé à chaque modification d'un champ de filtre.
     */
    async applyFilters() {
      try {
        this.tasks = await fetchTasks(this.projectId, this.filters)
      } catch (err) {
        console.error('Erreur lors du filtrage :', err)
      }
    },

    /**
     * Filtre les tâches pour une colonne Kanban donnée.
     * Si un filtre par statut est actif et ne correspond pas, retourne un tableau vide.
     *
     * @param {string} status - Le statut de la colonne (a_faire, en_cours, etc.)
     * @returns {Array} Les tâches correspondant au statut
     */
    getTasksByStatus(status) {
      return this.tasks.filter(task => task.status === status)
    },

    /**
     * Callback appelé quand une tâche est créée via le TaskForm.
     * Ajoute la tâche à la liste et ferme le modal.
     *
     * @param {Object} newTask - La tâche nouvellement créée
     */
    onTaskCreated(newTask) {
      this.tasks.push(newTask)
      this.showTaskForm = false
    },

    /**
     * Formate une date ISO en format français.
     * @param {string} dateStr - Date au format YYYY-MM-DD
     * @returns {string} Date formatée DD/MM/YYYY
     */
    formatDate(dateStr) {
      if (!dateStr) return '—'
      const [year, month, day] = dateStr.split('-')
      return `${day}/${month}/${year}`
    }
  }
}
</script>
