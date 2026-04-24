/**
 * router/index.js — Configuration du routeur Vue Router
 *
 * Définit les 4 routes principales de l'application :
 * - /            → Page d'accueil (HomeView)
 * - /projects    → Liste des chantiers (ProjectsView)
 * - /kanban/:id  → Tableau Kanban d'un chantier (KanbanView)
 * - /tasks/:id   → Détail d'une tâche (TaskDetailView)
 */

import { createRouter, createWebHistory } from 'vue-router'

// Import lazy des vues pour un chargement optimisé
const HomeView = () => import('../views/HomeView.vue')
const ProjectsView = () => import('../views/ProjectsView.vue')
const KanbanView = () => import('../views/KanbanView.vue')
const TaskDetailView = () => import('../views/TaskDetailView.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Accueil — BTP Kanban' }
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView,
    meta: { title: 'Chantiers — BTP Kanban' }
  },
  {
    path: '/kanban/:id',
    name: 'kanban',
    component: KanbanView,
    meta: { title: 'Kanban — BTP Kanban' }
  },
  {
    path: '/tasks/:id',
    name: 'taskDetail',
    component: TaskDetailView,
    meta: { title: 'Détail tâche — BTP Kanban' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Mise à jour dynamique du titre de la page
router.afterEach((to) => {
  document.title = to.meta.title || 'BTP Kanban'
})

export default router
