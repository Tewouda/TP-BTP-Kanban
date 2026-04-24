/**
 * services/api.js — Service centralisé pour les appels API
 *
 * Ce module fournit des fonctions pour communiquer avec le backend Express.
 * Toutes les requêtes passent par ce service pour centraliser :
 * - L'URL de base de l'API
 * - La gestion des headers
 * - La transformation des réponses JSON
 *
 * URL de base : http://localhost:3000/api
 */

// URL de base du backend Express
const API_BASE = 'http://localhost:3000/api'

/**
 * Récupère la liste de tous les projets (chantiers).
 * Chaque projet inclut le nombre total de tâches et le nombre de tâches terminées.
 *
 * @returns {Promise<Array>} Liste des projets
 */
export async function fetchProjects() {
  const response = await fetch(`${API_BASE}/projects`)
  if (!response.ok) throw new Error('Erreur lors du chargement des projets')
  return response.json()
}

/**
 * Récupère le détail d'un projet spécifique par son ID.
 * Inclut le décompte des tâches par statut (statusCounts).
 *
 * @param {number} id - Identifiant du projet
 * @returns {Promise<Object>} Détail du projet
 */
export async function fetchProject(id) {
  const response = await fetch(`${API_BASE}/projects/${id}`)
  if (!response.ok) throw new Error('Projet non trouvé')
  return response.json()
}

/**
 * Récupère les tâches d'un projet, avec filtres optionnels.
 *
 * @param {number} projectId - Identifiant du projet
 * @param {Object} filters - Filtres optionnels { status, priority, search }
 * @returns {Promise<Array>} Liste des tâches filtrées
 */
export async function fetchTasks(projectId, filters = {}) {
  // Construction de la query string à partir des filtres non vides
  const params = new URLSearchParams()
  if (filters.status) params.append('status', filters.status)
  if (filters.priority) params.append('priority', filters.priority)
  if (filters.search) params.append('search', filters.search)

  const queryString = params.toString()
  const url = `${API_BASE}/projects/${projectId}/tasks${queryString ? '?' + queryString : ''}`

  const response = await fetch(url)
  if (!response.ok) throw new Error('Erreur lors du chargement des tâches')
  return response.json()
}

/**
 * Récupère le détail complet d'une tâche par son ID.
 * Inclut le nom et la localisation du chantier associé.
 *
 * @param {number} id - Identifiant de la tâche
 * @returns {Promise<Object>} Détail de la tâche
 */
export async function fetchTask(id) {
  const response = await fetch(`${API_BASE}/tasks/${id}`)
  if (!response.ok) throw new Error('Tâche non trouvée')
  return response.json()
}

/**
 * Crée une nouvelle tâche pour un projet.
 *
 * @param {number} projectId - Identifiant du projet
 * @param {Object} taskData - Données de la tâche { title, description, priority, assigned_to, role, due_date }
 * @returns {Promise<Object>} La tâche créée
 */
export async function createTask(projectId, taskData) {
  const response = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erreur lors de la création de la tâche')
  }
  return response.json()
}

/**
 * Met à jour partiellement une tâche (PATCH).
 * Utilisé notamment pour le changement de statut via le Kanban.
 *
 * @param {number} id - Identifiant de la tâche
 * @param {Object} updates - Champs à modifier { status, title, ... }
 * @returns {Promise<Object>} La tâche mise à jour
 */
export async function updateTask(id, updates) {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour de la tâche')
  return response.json()
}
