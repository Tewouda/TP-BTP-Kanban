<!--
  Navbar.vue — Barre de navigation principale

  Composant réutilisable présent sur toutes les pages.
  Contient :
  - Le logo / nom de l'application (lien vers l'accueil)
  - Les liens de navigation vers les pages principales

  Utilise router-link pour la navigation SPA sans rechargement.
  La classe .router-link-active est automatiquement appliquée
  par Vue Router sur le lien correspondant à la page courante.
-->

<template>
  <nav class="navbar">
    <!-- Logo et nom de l'application -->
    <router-link to="/" class="navbar__brand">
      <span class="icon">🏗️</span>
      BTP Kanban
    </router-link>

    <!-- Liens de navigation -->
    <ul class="navbar__links">
      <li>
        <router-link to="/">Accueil</router-link>
      </li>
      <li>
        <router-link to="/projects">Chantiers</router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Navbar'
}
</script>
