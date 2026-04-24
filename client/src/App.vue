<!--
  App.vue — Composant racine de l'application BTP Kanban

  Ce composant contient :
  - La barre de navigation (Navbar) présente sur toutes les pages
  - Le <router-view> qui affiche la page courante selon la route

  La Navbar et le router-view sont les deux éléments structurants
  de l'interface utilisateur.
-->

<template>
  <!-- Barre de navigation globale -->
  <Navbar />

  <!-- Zone d'affichage de la page courante (gérée par Vue Router) -->
  <main>
    <router-view />
  </main>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>
