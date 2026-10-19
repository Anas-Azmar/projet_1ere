# Games Manager API

API REST développée en TypeScript et Node.js pour la gestion complète de compétitions sportives (équipes, joueurs, matchs et terrains).

## Fonctionnalités
* **Architecture en couches :** Découplage Controllers, Services, Mappers et modèles DTO / DBO.
* **Sécurité & Contrôle d'accès (RBAC) :** Authentification par jetons JWT et gestion des droits par rôles (Administrateur, Coach, Joueur).
* **Opérations CRUD & Soft Delete :** Gestion des données avec persistance et suppression logique.
* **Tests :** Scénarios de tests d'intégration HTTP via fichiers `.http` (REST Client).

## Stack Technique
* **Langages & Runtime :** TypeScript, Node.js
* **Sécurité :** JSON Web Tokens (JWT), bcrypt / hachage
* **Architecture :** REST API, Middlewares / Guards, DTO/DBO Mapping

## Installation et Utilisation

```bash
# 1. Installation des dépendances
npm install

# 2. Initialisation des données de test
npm run demo:seed

# 3. Lancer en mode développement
npm run dev

# 4. Compiler pour la production
npm run build

# 5. Démarrer en production
npm start
```
