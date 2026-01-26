# 🍽️ Mes Menus

Application web de gestion de menus et de liste de courses, développée avec React et conçue pour simplifier la planification des repas et les courses.

## ✨ Fonctionnalités

### 🥕 Gestion des Ingrédients
- Créer, modifier et supprimer des ingrédients
- Recherche et filtrage en temps réel
- Validation pour éviter la suppression d'ingrédients utilisés dans des plats
- Interface responsive avec icônes personnalisées

### 🍳 Gestion des Plats
- Composer des plats à partir d'ingrédients
- Sélection multiple d'ingrédients avec filtrage
- Modification et suppression de plats
- Recherche par nom de plat
- Tri alphabétique des ingrédients

### 📅 Planification des Menus
- Créer des menus pour le midi et le soir
- Mélanger plats et ingrédients librement
- Deux modes de visualisation :
    - **Vue Liste** : Affichage détaillé jour par jour
    - **Vue Calendrier** : Aperçu hebdomadaire compact
- Historique préservé même après modification/suppression d'ingrédients ou plats
- Recherche par date

### 🛒 Liste de Courses Automatique
- Génération automatique basée sur une période sélectionnée
- Agrégation intelligente des ingrédients :
    - Ingrédients directs des menus
    - Ingrédients composant les plats sélectionnés
- Compteur d'occurrences (ex: "Tomates x3")
- Cases à cocher pour suivre vos achats
- Fonction d'impression
- Tri alphabétique

## 🎨 Caractéristiques Techniques

### Stack Technique
- **Framework** : React 18
- **Gestion d'état** : useReducer (pattern Redux)
- **Styling** : Tailwind CSS (CDN)
- **Icônes** : Lucide React + icônes personnalisées
- **Persistance** : localStorage
- **Backend ready** : Prêt pour intégration Spring Boot

### Architecture
- Pattern Redux avec actions et reducers
- Composants React fonctionnels avec hooks
- Responsive design (mobile-first)
- PWA ready (configuration préparée)

### Fonctionnalités UX/UI
- Navigation responsive avec menu hamburger sur mobile
- Modales personnalisées pour les alertes
- Animations et transitions fluides
- Zones tactiles optimisées pour mobile (44x44px min)
- Charte graphique cohérente (cyan-800/teal)
- Fond d'écran personnalisable avec overlay transparent

## 🚀 Installation

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn

### Étapes

```bash
# Cloner le repository
git clone https://github.com/votre-username/mes-menus.git
cd mes-menus

# Installer les dépendances
npm install

# Lancer l'application en développement
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 📦 Build pour Production

```bash
# Créer le build optimisé
npm run build

# Le dossier build/ contiendra l'application prête à déployer
```

## 🗄️ Structure du Projet

```
src/
├── actions/
│   ├── dishActions.js
│   ├── ingredientActions.js
│   └── menuActions.js
├── components/
│   ├── DishesPage.jsx
│   ├── HomePage.jsx
│   ├── IngredientsPage.jsx
│   ├── MenusPage.jsx
│   ├── Navigation.jsx
│   └── ShoppingListPage.jsx
├── reducers/
│   ├── dishesReducer.js
│   ├── ingredientsReducer.js
│   └── menusReducer.js
├── icons/
│   └── [icônes personnalisées]
├── App.jsx
├── App.css
└── index.js
```

## 🔮 Prochaines Étapes

- [ ] Intégration avec backend Spring Boot
- [ ] Connexion à base de données MySQL
- [ ] Authentification utilisateur
- [ ] Partage de recettes
- [ ] Export PDF de la liste de courses
- [ ] Mode hors ligne complet (PWA)
- [ ] Notifications pour les courses

## 🎯 Utilisation

1. **Créer vos ingrédients** : Ajoutez tous les ingrédients que vous utilisez régulièrement
2. **Composer vos plats** : Créez vos recettes favorites en sélectionnant les ingrédients
3. **Planifier vos menus** : Organisez vos repas du midi et du soir pour la semaine
4. **Générer votre liste** : Sélectionnez une période et obtenez automatiquement votre liste de courses avec les quantités

## 💾 Persistance des Données

Actuellement, les données sont stockées en **localStorage**. Elles persistent entre les sessions mais restent locales au navigateur.

Une intégration backend est prévue pour :
- Synchronisation multi-appareils
- Sauvegarde sécurisée
- Partage de recettes
- Historique illimité

## 🎨 Personnalisation

### Changer la Couleur Principale

Dans `src/App.css`, modifiez la variable CSS :
```css
:root {
  --custom-blue: #3a6b7a; /* Votre couleur */
}
```

### Changer le Fond d'Écran

Remplacez `src/background.png` par votre image (recommandé : 1080x1920px minimum).

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests

## 👏 Remerciements

Application développée avec l'assistance de **Claude** (Anthropic), qui a contribué à l'architecture, au design et à l'implémentation des fonctionnalités.

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.

---

Fait avec ❤️ pour simplifier la vie en cuisine !