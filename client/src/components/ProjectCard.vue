<!--
  ProjectCard.vue — Carte de chantier

  Composant réutilisable affichant les informations résumées d'un chantier :
  - Nom du chantier
  - Statut global (en cours, en attente, terminé)
  - Localisation (ville)
  - Dates de début et fin
  - Description résumée
  - Barre de progression (tâches terminées / total)

  Props :
  - project : objet projet contenant { id, name, description, location, start_date, end_date, status, task_count, completed_count }

  Émet : clic pour naviguer vers le Kanban du chantier (/kanban/:id)
-->

<template>
  <router-link :to="`/kanban/${project.id}`" class="project-card">
    <!-- En-tête avec nom du chantier et badge statut -->
    <div class="project-card__header">
      <span class="project-card__name">{{ project.name }}</span>
      <span class="badge" :class="statusBadgeClass">{{ statusLabel }}</span>
    </div>

    <!-- Corps de la carte -->
    <div class="project-card__body">
      <!-- Description du chantier -->
      <p class="project-card__description">{{ project.description }}</p>

      <!-- Métadonnées : localisation et dates -->
      <div class="project-card__meta">
        <div class="project-card__meta-item">
          📍 {{ project.location }}
        </div>
        <div class="project-card__meta-item">
          📅 {{ formatDate(project.start_date) }} → {{ formatDate(project.end_date) }}
        </div>
        <div class="project-card__meta-item">
          📋 {{ project.task_count }} tâches ({{ project.completed_count }} terminées)
        </div>
      </div>

      <!-- Barre de progression -->
      <div class="project-card__progress">
        <small>Avancement : {{ progressPercent }}%</small>
        <div class="progress-bar">
          <div class="progress-bar__fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'ProjectCard',

  props: {
    /**
     * Objet projet à afficher.
     * Doit contenir : id, name, description, location, start_date, end_date, status, task_count, completed_count
     */
    project: {
      type: Object,
      required: true
    }
  },

  computed: {
    /**
     * Calcule le pourcentage d'avancement du chantier
     * basé sur le nombre de tâches terminées / total.
     */
    progressPercent() {
      if (!this.project.task_count) return 0
      return Math.round((this.project.completed_count / this.project.task_count) * 100)
    },

    /**
     * Retourne la classe CSS pour le badge de statut du projet.
     */
    statusBadgeClass() {
      const statusMap = {
        'en_cours': 'badge--en_cours_project',
        'en_attente': 'badge--en_attente',
        'termine': 'badge--termine'
      }
      return statusMap[this.project.status] || 'badge--en_cours_project'
    },

    /**
     * Retourne le libellé lisible du statut du projet.
     */
    statusLabel() {
      const labels = {
        'en_cours': 'En cours',
        'en_attente': 'En attente',
        'termine': 'Terminé'
      }
      return labels[this.project.status] || this.project.status
    }
  },

  methods: {
    /**
     * Formate une date ISO (YYYY-MM-DD) en format français (DD/MM/YYYY).
     * @param {string} dateStr - Date au format ISO
     * @returns {string} Date formatée
     */
    formatDate(dateStr) {
      if (!dateStr) return '—'
      const [year, month, day] = dateStr.split('-')
      return `${day}/${month}/${year}`
    }
  }
}
</script>
