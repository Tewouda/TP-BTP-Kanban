<!--
  TaskForm.vue — Formulaire d'ajout de tâche

  Composant réutilisable permettant de créer une nouvelle tâche pour un chantier.
  Utilise v-model pour la liaison bidirectionnelle des champs du formulaire
  et inclut une validation minimale (titre obligatoire).

  Champs du formulaire :
  - Titre (obligatoire)
  - Description
  - Priorité (haute, moyenne, basse)
  - Responsable (sélection parmi les profils existants)
  - Date d'échéance

  Props :
  - projectId : identifiant du projet pour lequel créer la tâche

  Événements émis :
  - task-created : émis quand la tâche est créée avec succès (payload: la nouvelle tâche)
  - close        : émis quand l'utilisateur ferme le formulaire
-->

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <!-- Header du modal -->
      <div class="modal__header">
        <h2>{{ isEditMode ? '✏️ Modifier la tâche' : '➕ Nouvelle tâche' }}</h2>
        <button class="modal__close" @click="$emit('close')">&times;</button>
      </div>

      <!-- Corps du modal : formulaire -->
      <div class="modal__body">
        <form class="form" @submit.prevent="submitForm">

          <!-- Titre de la tâche (obligatoire) -->
          <div class="form__group">
            <label class="form__label" for="task-title">Titre *</label>
            <input
              id="task-title"
              type="text"
              class="form__input"
              v-model="form.title"
              placeholder="Ex: Pose des cloisons sèches"
              required
            />
            <!-- Message d'erreur si le titre est vide -->
            <span v-if="errors.title" class="form__error">{{ errors.title }}</span>
          </div>

          <!-- Description -->
          <div class="form__group">
            <label class="form__label" for="task-description">Description</label>
            <textarea
              id="task-description"
              class="form__textarea"
              v-model="form.description"
              placeholder="Détails de la tâche..."
              rows="3"
            ></textarea>
          </div>

          <!-- Notes / Commentaires -->
          <div class="form__group">
            <label class="form__label" for="task-notes">Notes de chantier</label>
            <textarea
              id="task-notes"
              class="form__textarea"
              v-model="form.notes"
              placeholder="Commentaires, compte-rendu d'avancement..."
              rows="2"
            ></textarea>
          </div>

          <!-- Ligne double : Priorité + Responsable -->
          <div class="form__row">
            <!-- Priorité -->
            <div class="form__group">
              <label class="form__label" for="task-priority">Priorité</label>
              <select id="task-priority" class="form__select" v-model="form.priority">
                <option value="haute">🔴 Haute</option>
                <option value="moyenne" selected>🟡 Moyenne</option>
                <option value="basse">🟢 Basse</option>
              </select>
            </div>

            <!-- Responsable -->
            <div class="form__group">
              <label class="form__label" for="task-assigned">Responsable</label>
              <select id="task-assigned" class="form__select" v-model="selectedPerson">
                <option value="">— Sélectionner —</option>
                <option value="Marc Dupont|chef_de_projet">Marc Dupont (Chef de projet)</option>
                <option value="Sophie Martin|conducteur_de_travaux">Sophie Martin (Conductrice de travaux)</option>
              </select>
            </div>
          </div>

          <!-- Date d'échéance -->
          <div class="form__group">
            <label class="form__label" for="task-due-date">Date d'échéance</label>
            <input
              id="task-due-date"
              type="date"
              class="form__input"
              v-model="form.due_date"
            />
          </div>

          <!-- Boutons d'action -->
          <div class="form__actions">
            <button type="submit" class="btn btn--primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Enregistrer les modifications' : 'Créer la tâche') }}
            </button>
            <button type="button" class="btn btn--outline" @click="$emit('close')">
              Annuler
            </button>
          </div>

          <!-- Message d'erreur global -->
          <p v-if="errors.global" class="form__error" style="margin-top: 12px;">
            {{ errors.global }}
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { createTask, updateTask } from '../services/api'

export default {
  name: 'TaskForm',

  props: {
    /** Identifiant du projet pour lequel créer la tâche */
    projectId: {
      type: [Number, String],
      required: true
    },
    /** Tâche existante à modifier (mode édition) */
    existingTask: {
      type: Object,
      default: null
    }
  },

  emits: ['task-saved', 'close'],

  data() {
    return {
      /**
       * Données du formulaire liées avec v-model.
       * Le statut initial est toujours "a_faire" (défini côté backend).
       */
      form: {
        title: '',
        description: '',
        notes: '',
        priority: 'moyenne',
        due_date: ''
      },
      /** Valeur combinée "nom|rôle" pour le sélecteur de responsable */
      selectedPerson: '',
      /** Erreurs de validation */
      errors: {},
      /** État de soumission (pour désactiver le bouton) */
      isSubmitting: false
    }
  },

  computed: {
    isEditMode() {
      return !!this.existingTask
    }
  },

  mounted() {
    // Si on est en mode édition, préremplir le formulaire
    if (this.existingTask) {
      this.form = {
        title: this.existingTask.title || '',
        description: this.existingTask.description || '',
        notes: this.existingTask.notes || '',
        priority: this.existingTask.priority || 'moyenne',
        due_date: this.existingTask.due_date ? this.existingTask.due_date.split(' ')[0] : ''
      }
      if (this.existingTask.assigned_to) {
        this.selectedPerson = `${this.existingTask.assigned_to}|${this.existingTask.role || ''}`
      }
    }
  },

  methods: {
    /**
     * Valide le formulaire et soumet la tâche à l'API.
     * Validation minimale : le titre est obligatoire.
     */
    async submitForm() {
      // Réinitialisation des erreurs
      this.errors = {}

      // Validation : titre obligatoire
      if (!this.form.title.trim()) {
        this.errors.title = 'Le titre est obligatoire.'
        return
      }

      // Extraction du nom et du rôle depuis la valeur combinée
      let assigned_to = ''
      let role = ''
      if (this.selectedPerson) {
        const parts = this.selectedPerson.split('|')
        assigned_to = parts[0]
        role = parts[1]
      }

      // Construction de l'objet tâche à envoyer
      const taskData = {
        ...this.form,
        assigned_to,
        role
      }

      this.isSubmitting = true

      try {
        let savedTask;
        if (this.isEditMode) {
          // Appel API pour modifier la tâche
          savedTask = await updateTask(this.existingTask.id, taskData)
        } else {
          // Appel API pour créer la tâche
          savedTask = await createTask(this.projectId, taskData)
        }

        // Émission de l'événement pour informer le parent
        this.$emit('task-saved', savedTask)
      } catch (error) {
        this.errors.global = error.message || 'Une erreur est survenue.'
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>
