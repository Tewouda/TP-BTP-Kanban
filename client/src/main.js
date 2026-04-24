/**
 * main.js — Point d'entrée de l'application Vue.js
 *
 * Ce fichier initialise l'application Vue avec :
 * - Le routeur (Vue Router)
 * - Les styles globaux
 * - Le montage sur l'élément #app
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Création et montage de l'application Vue
const app = createApp(App)

// Utilisation du routeur pour la navigation entre les pages
app.use(router)

// Montage de l'application sur l'élément #app dans index.html
app.mount('#app')
