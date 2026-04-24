<!--
  ProjectsView.vue — Page listant les chantiers

  Affiche tous les chantiers sous forme de cartes cliquables.
  Chaque carte utilise le composant ProjectCard.
  Un clic sur une carte redirige vers le tableau Kanban du chantier.

  Données chargées depuis l'API : GET /api/projects

  Route : /projects
-->

<template>
  <div class="page">
    <!-- En-tête de la page -->
    <div class="page__header">
      <h1 class="page__title">📁 Chantiers en cours</h1>
      <p class="page__subtitle">Sélectionnez un chantier pour accéder à son tableau Kanban.</p>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="loading">
      <div class="loading__spinner"></div>
      Chargement des chantiers...
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" style="color: var(--color-bloque); text-align: center; padding: 32px;">
      ⚠️ {{ error }}
    </div>

    <!-- Grille de cartes de chantiers -->
    <div v-else class="projects-grid">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>

<script>
import ProjectCard from '../components/ProjectCard.vue'
import { fetchProjects } from '../services/api'

export default {
  name: 'ProjectsView',

  components: {
    ProjectCard
  },

  data() {
    return {
      /** Liste des projets récupérés depuis l'API */
      projects: [],
      /** État de chargement */
      loading: true,
      /** Message d'erreur éventuel */
      error: null
    }
  },

  /**
   * Chargement des projets au montage du composant.
   * Appelle l'API GET /api/projects via le service api.js.
   */
  async mounted() {
    try {
      this.projects = await fetchProjects()
    } catch (err) {
      this.error = 'Impossible de charger les chantiers. Vérifiez que le serveur est démarré.'
    } finally {
      this.loading = false
    }
  }
}
</script>
