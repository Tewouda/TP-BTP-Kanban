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
      <!-- En-tête avec informations du chantier et sélecteur -->
      <div v-if="successMessage" class="success-message" style="background-color: #10b981; color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; text-align: center; font-weight: 500;">
        ✅ {{ successMessage }}
      </div>

      <div class="page__header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
        <div>
          <h1 class="page__title">🏗️ {{ project.name }}</h1>
          <p class="page__subtitle">
            📍 {{ project.location }} · 📅 {{ formatDate(project.start_date) }} → {{ formatDate(project.end_date) }}
          </p>
        </div>
        
        <!-- Sélecteur de projet rapide -->
        <div class="project-selector" style="min-width: 250px;">
          <label style="display: block; font-size: 0.8rem; color: var(--color-text-light); margin-bottom: 4px;">Changer de chantier :</label>
          <select class="form__select" v-model="selectedProjectId" @change="switchProject">
            <option v-for="p in allProjects" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
        </div>
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

        <!-- Filtre par responsable -->
        <select
          class="form__select filters__select"
          v-model="filters.assigned_to"
          @change="applyFilters"
        >
          <option value="">Tous les responsables</option>
          <option value="Marc Dupont">Marc Dupont</option>
          <option value="Sophie Martin">Sophie Martin</option>
        </select>

        <!-- Tri -->
        <select
          class="form__select filters__select"
          v-model="filters.sort"
          @change="applyFilters"
        >
          <option value="">Tri par défaut (création)</option>
          <option value="due_date_asc">Échéance la plus proche</option>
          <option value="due_date_desc">Échéance la plus lointaine</option>
          <option value="priority_desc">Priorité (Haute → Basse)</option>
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
          @task-status-changed="handleTaskStatusChanged"
        />
      </div>

      <!-- Modal du formulaire d'ajout de tâche -->
      <TaskForm
        v-if="showTaskForm"
        :project-id="projectId"
        @task-saved="onTaskCreated"
        @close="showTaskForm = false"
      />
    </template>
  </div>
</template>

<script>
import KanbanColumn from '../components/KanbanColumn.vue'
import TaskForm from '../components/TaskForm.vue'
import { fetchProject, fetchTasks, fetchProjects, updateTask } from '../services/api'

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
      /** Liste de tous les projets pour le sélecteur */
      allProjects: [],
      /** ID du projet sélectionné dans le menu déroulant */
      selectedProjectId: null,
      /** État de chargement */
      loading: true,
      /** Message d'erreur */
      error: null,
      /** Message de succès temporaire */
      successMessage: null,
      /** Affichage du formulaire d'ajout de tâche */
      showTaskForm: false,

      /**
       * Filtres actifs pour la recherche de tâches.
       * Liés avec v-model aux champs de la barre de filtres.
       */
      filters: {
        search: '',
        status: '',
        priority: '',
        assigned_to: '',
        sort: ''
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
      this.selectedProjectId = this.projectId
      try {
        // Chargement en parallèle du projet, de ses tâches et de tous les projets
        const [project, tasks, projectsList] = await Promise.all([
          fetchProject(this.projectId),
          fetchTasks(this.projectId, this.filters),
          fetchProjects()
        ])
        this.project = project
        this.tasks = tasks
        this.allProjects = projectsList
      } catch (err) {
        this.error = 'Impossible de charger le chantier. Vérifiez que le serveur est démarré.'
      } finally {
        this.loading = false
      }
    },

    /**
     * Change de chantier et navigue vers sa route Kanban.
     */
    switchProject() {
      if (this.selectedProjectId && this.selectedProjectId !== this.projectId) {
        this.$router.push(`/kanban/${this.selectedProjectId}`)
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
     * Met à jour le statut d'une tâche via l'API et en local.
     * Appelé par l'événement de drag&drop dans KanbanColumn.
     */
    async handleTaskStatusChanged({ taskId, newStatus }) {
      // Trouver et mettre à jour la tâche localement pour une UI fluide
      const taskIndex = this.tasks.findIndex(t => t.id === taskId)
      if (taskIndex !== -1) {
        this.tasks[taskIndex].status = newStatus
      }

      // Mettre à jour côté serveur
      try {
        await updateTask(taskId, { status: newStatus })
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche :', error)
        this.error = "Erreur lors du déplacement de la tâche."
        // En cas d'erreur on pourrait annuler le changement local ici
      }
    },

    /**
     * Callback appelé quand une tâche est créée ou modifiée via le TaskForm.
     * Recharge toutes les tâches pour appliquer les filtres et tris correctement.
     *
     * @param {Object} savedTask - La tâche nouvellement créée ou modifiée
     */
    async onTaskCreated(savedTask) {
      this.showTaskForm = false
      this.successMessage = 'Tâche enregistrée avec succès !'
      setTimeout(() => {
        this.successMessage = null
      }, 3000)
      await this.applyFilters()
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
