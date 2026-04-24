<!--
  TaskDetailView.vue — Page de détail d'une tâche

  Affiche toutes les informations d'une tâche spécifique :
  - Titre, description
  - Chantier associé (avec lien vers le Kanban)
  - Statut, priorité
  - Responsable et rôle
  - Date d'échéance et date de création

  Données chargées depuis l'API : GET /api/tasks/:id

  Route : /tasks/:id
-->

<template>
  <div class="page">
    <!-- État de chargement -->
    <div v-if="loading" class="loading">
      <div class="loading__spinner"></div>
      Chargement de la tâche...
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" style="color: var(--color-bloque); text-align: center; padding: 32px;">
      ⚠️ {{ error }}
    </div>

    <!-- Contenu du détail de la tâche -->
    <div v-else class="task-detail">
      <!-- En-tête : titre + badges -->
      <div class="task-detail__header">
        <h1 class="task-detail__title">{{ task.title }}</h1>
        <div class="task-detail__badges">
          <!-- Badge de statut -->
          <span class="badge" :class="`badge--${task.status}`">{{ statusLabel }}</span>
          <!-- Badge de priorité -->
          <span class="badge" :class="`badge--${task.priority}`">{{ priorityLabel }}</span>
        </div>
      </div>

      <!-- Section : Chantier associé -->
      <div class="task-detail__section">
        <h3>Chantier</h3>
        <p>
          <router-link :to="`/kanban/${task.project_id}`">
            🏗️ {{ task.project_name }}
          </router-link>
          <span v-if="task.project_location"> — 📍 {{ task.project_location }}</span>
        </p>
      </div>

      <!-- Section : Description -->
      <div class="task-detail__section" v-if="task.description">
        <h3>Description</h3>
        <p>{{ task.description }}</p>
      </div>

      <!-- Section : Informations détaillées (grille 2 colonnes) -->
      <div class="task-detail__section">
        <h3>Informations</h3>
        <div class="task-detail__grid">
          <!-- Responsable -->
          <div class="task-detail__field">
            <label>Responsable</label>
            <span>👤 {{ task.assigned_to || 'Non assigné' }}</span>
          </div>

          <!-- Rôle -->
          <div class="task-detail__field">
            <label>Rôle</label>
            <span>{{ roleLabel }}</span>
          </div>

          <!-- Échéance -->
          <div class="task-detail__field">
            <label>Échéance</label>
            <span>📅 {{ formatDate(task.due_date) }}</span>
          </div>

          <!-- Date de création -->
          <div class="task-detail__field">
            <label>Créée le</label>
            <span>{{ formatDate(task.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Bouton retour vers le Kanban -->
      <div class="task-detail__back">
        <router-link :to="`/kanban/${task.project_id}`" class="btn btn--outline">
          ← Retour au Kanban
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchTask } from '../services/api'

export default {
  name: 'TaskDetailView',

  data() {
    return {
      /** Données de la tâche chargées depuis l'API */
      task: {},
      /** État de chargement */
      loading: true,
      /** Message d'erreur */
      error: null
    }
  },

  computed: {
    /**
     * Retourne le libellé lisible du statut Kanban.
     */
    statusLabel() {
      const labels = {
        'a_faire': 'À faire',
        'en_cours': 'En cours',
        'bloque': 'Bloqué',
        'termine': 'Terminé'
      }
      return labels[this.task.status] || this.task.status
    },

    /**
     * Retourne le libellé lisible de la priorité.
     */
    priorityLabel() {
      const labels = {
        'haute': 'Priorité haute',
        'moyenne': 'Priorité moyenne',
        'basse': 'Priorité basse'
      }
      return labels[this.task.priority] || this.task.priority
    },

    /**
     * Retourne le libellé lisible du rôle du responsable.
     */
    roleLabel() {
      const labels = {
        'chef_de_projet': 'Chef de projet',
        'conducteur_de_travaux': 'Conducteur de travaux'
      }
      return labels[this.task.role] || this.task.role || '—'
    }
  },

  /**
   * Chargement de la tâche au montage du composant.
   * Récupère le détail via GET /api/tasks/:id.
   */
  async mounted() {
    try {
      const id = this.$route.params.id
      this.task = await fetchTask(id)
    } catch (err) {
      this.error = 'Impossible de charger la tâche. Vérifiez que le serveur est démarré.'
    } finally {
      this.loading = false
    }
  },

  methods: {
    /**
     * Formate une date ISO en format français (DD/MM/YYYY).
     * Gère aussi le format datetime SQLite (YYYY-MM-DD HH:MM:SS).
     *
     * @param {string} dateStr - Date au format ISO
     * @returns {string} Date formatée
     */
    formatDate(dateStr) {
      if (!dateStr) return '—'
      // Extraire la partie date (avant l'espace éventuel)
      const datePart = dateStr.split(' ')[0]
      const [year, month, day] = datePart.split('-')
      return `${day}/${month}/${year}`
    }
  }
}
</script>
