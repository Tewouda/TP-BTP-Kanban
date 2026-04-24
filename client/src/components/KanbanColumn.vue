<!--
  KanbanColumn.vue — Colonne du tableau Kanban

  Composant réutilisable représentant une colonne du tableau Kanban.
  Affiche un header coloré avec le nom du statut et le nombre de tâches,
  puis la liste des TaskCards correspondantes.

  Props :
  - status    : identifiant du statut (a_faire, en_cours, bloque, termine)
  - label     : libellé affiché dans le header (ex: "À faire")
  - tasks     : tableau des tâches à afficher dans cette colonne
  - projectId : identifiant du projet (pour le lien vers le détail)
-->

<template>
  <div class="kanban-column" :class="`kanban-column--${status}`">
    <!-- Header de la colonne avec titre et compteur -->
    <div class="kanban-column__header">
      <span>{{ label }}</span>
      <span class="kanban-column__count">{{ tasks.length }}</span>
    </div>

    <!-- Corps de la colonne : liste des cartes de tâches -->
    <div class="kanban-column__body">
      <draggable
        v-model="localTasks"
        group="tasks"
        item-key="id"
        class="drag-area"
        @change="onDragChange"
      >
        <template #item="{ element }">
          <TaskCard :task="element" />
        </template>
      </draggable>

      <!-- Message si la colonne est vide -->
      <p v-if="tasks.length === 0" style="color: #9ca3af; font-size: 0.85rem; text-align: center; padding: 16px;">
        Aucune tâche
      </p>
    </div>
  </div>
</template>

<script>
import TaskCard from './TaskCard.vue'
import draggable from 'vuedraggable'

export default {
  name: 'KanbanColumn',

  components: {
    TaskCard,
    draggable
  },

  props: {
    /** Identifiant du statut : a_faire, en_cours, bloque, termine */
    status: {
      type: String,
      required: true
    },
    /** Libellé affiché dans le header de la colonne */
    label: {
      type: String,
      required: true
    },
    /** Tableau des tâches à afficher dans cette colonne */
    tasks: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  emits: ['task-status-changed'],

  computed: {
    localTasks: {
      get() {
        return this.tasks
      },
      set(value) {
        // Laissons le parent gérer la liste globale
      }
    }
  },

  methods: {
    /**
     * Gère les événements de drag & drop.
     * Lorsqu'une carte est ajoutée à cette colonne (drop), on émet le changement de statut au parent.
     */
    onDragChange(event) {
      if (event.added) {
        this.$emit('task-status-changed', {
          taskId: event.added.element.id,
          newStatus: this.status
        })
      }
    }
  }
}
</script>

<style scoped>
.drag-area {
  min-height: 100px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
