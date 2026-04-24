<!--
  HomeView.vue — Page d'accueil de l'application

  Cette page présente l'application BTP Kanban, son objectif
  et fournit des liens de navigation clairs vers les autres pages.

  Contenu :
  - Section héro avec titre et description
  - Boutons d'action vers la page des chantiers
  - Cartes de fonctionnalités pour expliquer l'outil

  Route : /
-->

<template>
  <div class="page">
    <!-- Section héro : présentation de l'application -->
    <section class="hero">
      <h1>🏗️ BTP Kanban</h1>
      <p>
        Suivez l'avancement de vos chantiers en un coup d'œil.
        Organisez vos tâches, identifiez les blocages et
        gardez le contrôle sur chaque étape de vos projets BTP.
      </p>

      <!-- Boutons de navigation rapide -->
      <div class="hero__actions">
        <router-link to="/projects" class="btn btn--primary">
          📋 Voir les chantiers
        </router-link>
        <a href="#features" class="btn btn--secondary">
          ℹ️ En savoir plus
        </a>
      </div>
    </section>

    <!-- Section fonctionnalités -->
    <section id="features">
      <h2 style="margin-bottom: 24px; text-align: center;">Pourquoi BTP Kanban ?</h2>

      <div class="features">
        <!-- Carte 1 : Suivi visuel -->
        <div class="feature-card">
          <div class="feature-card__icon">📊</div>
          <h3>Suivi visuel</h3>
          <p>
            Visualisez instantanément l'état de chaque chantier grâce au
            tableau Kanban : tâches à faire, en cours, bloquées ou terminées.
          </p>
        </div>

        <!-- Carte 2 : Gestion des priorités -->
        <div class="feature-card">
          <div class="feature-card__icon">🎯</div>
          <h3>Priorités claires</h3>
          <p>
            Identifiez rapidement les tâches critiques grâce aux
            codes couleurs de priorité : haute, moyenne et basse.
          </p>
        </div>

        <!-- Carte 3 : Collaboration -->
        <div class="feature-card">
          <div class="feature-card__icon">👥</div>
          <h3>Suivi d'équipe</h3>
          <p>
            Assignez les tâches aux chefs de projet et conducteurs de travaux.
            Chacun sait ce qu'il doit faire et quand.
          </p>
        </div>

        <!-- Carte 4 : Blocages identifiés -->
        <div class="feature-card">
          <div class="feature-card__icon">🚧</div>
          <h3>Blocages identifiés</h3>
          <p>
            Repérez immédiatement les tâches bloquées pour anticiper
            les retards et prendre des décisions rapidement.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>
