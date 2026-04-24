<!--
  TaskCard.vue — Carte de tâche pour le tableau Kanban

  Composant réutilisable affichant les informations résumées d'une tâche :
  - Titre de la tâche
  - Badge de priorité (haute, moyenne, basse) avec bordure gauche colorée
  - Responsable et son rôle
  - Date d'échéance

  Clic sur la carte → navigation vers la page de détail (/tasks/:id)

  Props :
  - task : objet tâche { id, title, priority, assigned_to, role, due_date, status }
-->

<template>
  <router-link :to="`/tasks/${task.id}`" class="task-card" :class="`task-card--${task.priority}`">
    <!-- Titre de la tâche -->
    <div class="task-card__title">{{ task.title }}</div>

    <!-- Métadonnées de la tâche -->
    <div class="task-card__meta">
      <!-- Badge de priorité -->
      <span class="badge" :class="`badge--${task.priority}`">
        {{ priorityLabel }}
      </span>

      <!-- Responsable -->
      <span class="task-card__meta-item" v-if="task.assigned_to">
        👤 {{ task.assigned_to }}
      </span>

      <!-- Date d'échéance -->
      <span class="task-card__meta-item" v-if="task.due_date">
        📅 {{ formatDate(task.due_date) }}
      </span>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'TaskCard',

  props: {
    /**
     * Objet tâche à afficher.
     * Doit contenir : id, title, priority, assigned_to, role, due_date, status
     */
    task: {
      type: Object,
      required: true
    }
  },

  computed: {
    /**
     * Retourne le libellé lisible de la priorité.
     */
    priorityLabel() {
      const labels = {
        'haute': 'Haute',
        'moyenne': 'Moyenne',
        'basse': 'Basse'
      }
      return labels[this.task.priority] || this.task.priority
    }
  },

  methods: {
    /**
     * Formate une date ISO en format français (DD/MM/YYYY).
     * @param {string} dateStr - Date au format YYYY-MM-DD
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
