# Games Manager API

API REST développée en TypeScript et Node.js pour la gestion complète de compétitions sportives (équipes, joueurs, matchs et terrains).

## 🚀 Fonctionnalités
* **Architecture en couches :** Découplage Controllers, Services, Mappers et DTO/DBO.
* **Sécurité & Contrôle d'accès (RBAC) :** Gestion des permissions selon les rôles (Administrateur, Coach, Joueur).
* **Opérations CRUD & Soft Delete :** Gestion des données avec persistance et suppression logique.
* **Tests :** Scénarios de tests d'intégration HTTP via fichiers `.http` (REST Client).

## 🛠️ Stack Technique
* **Runtime / Langage :** Node.js, TypeScript
* **Architecture :** RESTful API, Guards, Mappers

## 💻 Installation et Démarrage
```bash
# Installation des dépendances
npm install

# Initialisation des données de démo
npm run demo:seed

# Lancement en mode développement
npm run dev

# Initialisation des données de démo
npm run demo:seed

# Clear all data
npm run clear
```
