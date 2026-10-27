# MenuApp Frontend

## Stack
- React 18 (JSX, pas TypeScript) + Create React App (react-scripts 5)
- Tailwind CSS 4
- lucide-react pour les icones
- Pas de Redux externe : gestion d'etat maison (actions + reducers)

## Structure `src/`
- `components/` — pages React : `HomePage`, `DishesPage`, `IngredientsPage`, `MenusPage`, `SettingsPage`, `ShoppingListPage`, `Navigation`
- `actions/` — `dishActions.js`, `ingredientActions.js`, `menuActions.js`
- `reducers/` — `dishesReducer.js`, `ingredientsReducer.js`, `menusReducer.js`
- `services/apiService.js` — appels HTTP vers le backend (ingredientsAPI, dishesAPI, menusAPI, shoppingListAPI)
- `App.jsx` — composant racine + routing
- `index.js` — point d'entree

## Commandes utiles
```bash
npm start    # dev (port 3000)
npm run build
npm test
```

## Notes importantes
- Backend attendu sur `http://localhost:8080` (voir `apiService.js`, URL configurable dans les settings)
- Icones custom dans `src/icons/` (PNG)
- Pas de TypeScript, pas d'ESLint custom (config react-app par defaut)
- Image de fond : `src/background.png` (chargée dans `App.jsx` via `require`)
- Les données sont rechargées à chaque changement de page (pages : `ingredients`, `dishes`, `menus`, `shopping`)

## Feature Shopping List

Liste de courses générée depuis les menus sur une période choisie. `ShoppingListPage` permet de :
- Sélectionner une période (date de début / date de fin)
- Cocher les ingrédients qu'on n'a pas à la maison
- Envoyer la sélection vers la liste de courses backend via `shoppingListAPI.addItems(names)`
  - Les items déjà en liste sont pré-cochés au chargement et affichent un badge "En liste" (green)
  - Le bouton "Ajouter à la liste" n'envoie que les items cochés et pas encore en liste
- Imprimer la liste via `window.print()`

### Widget "Ma liste de courses"

Toujours visible en bas de `ShoppingListPage`, indépendamment de la période sélectionnée. Il :
- Affiche les articles actuellement en liste (`shoppingQueue`) sous forme de tags (bg-green-100)
- Porte le bouton "Vider la liste" qui appelle `shoppingListAPI.consumeItems()` (DELETE /shopping-list)
- Se rafraîchit automatiquement après chaque ajout via `refreshShoppingQueue()`

## Feature HomePage — Widget menu du jour

`HomePage` reçoit `menus` en prop et affiche un widget "Menu du jour" qui met en avant les repas midi/soir du jour courant.

## Feature MenusPage

- Deux modes d'affichage : **liste** (`ListView`) et **calendrier** (`CalendarView`), basculables via les icônes en haut à droite
- Scroll automatique vers le menu du jour (ou le prochain menu à venir) au chargement de la vue
- En mode édition : boutons Valider/Annuler **sticky en bas de l'écran** (mobile-friendly)
- Recherche par date (filtre normalisé sans accents)
- `MenuMealSelector` : liste unifiée plats + ingrédients marqués `isDish`, triée alphabétiquement
