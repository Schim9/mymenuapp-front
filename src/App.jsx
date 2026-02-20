import React, { useState, useReducer, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import IngredientsPage from './components/IngredientsPage';
import DishesPage from './components/DishesPage';
import MenusPage from './components/MenusPage';
import ShoppingListPage from './components/ShoppingListPage';
import SettingsPage, { isSettingsComplete } from './components/SettingsPage';
import { ingredientsReducer } from './reducers/ingredientsReducer';
import { dishesReducer } from './reducers/dishesReducer';
import { menusReducer } from './reducers/menusReducer';
import { SET_INGREDIENTS } from './actions/ingredientActions';
import { SET_DISHES } from './actions/dishActions';
import { SET_MENUS } from './actions/menuActions';
import { ingredientsAPI, dishesAPI, menusAPI } from './services/apiService';
import './App.css';

// Clés pour le localStorage (migration)
const STORAGE_KEYS = {
    INGREDIENTS: 'app_ingredients',
    DISHES: 'app_dishes',
    MENUS: 'app_menus'
};

const App = () => {
    const [currentPage, setCurrentPage] = useState(isSettingsComplete() ? 'home' : 'settings');
    const [settingsReady, setSettingsReady] = useState(isSettingsComplete());
    const [migrating, setMigrating] = useState(false);
    const [error, setError] = useState(null);

    const [ingredients, dispatchIngredients] = useReducer(ingredientsReducer, []);
    const [dishes, dispatchDishes] = useReducer(dishesReducer, []);
    const [menus, dispatchMenus] = useReducer(menusReducer, []);

    const loadData = async () => {
        try {
            const [apiIngredients, apiDishes, apiMenus] = await Promise.all([
                ingredientsAPI.getAll(),
                dishesAPI.getAll(),
                menusAPI.getAll(),
            ]);
            dispatchIngredients({ type: SET_INGREDIENTS, payload: apiIngredients });
            dispatchDishes({ type: SET_DISHES, payload: apiDishes });
            dispatchMenus({ type: SET_MENUS, payload: apiMenus });
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
        }
    };

    // Chargement initial : migration localStorage si nécessaire, puis fetch API
    const initCalled = useRef(false);
    useEffect(() => {
        if (initCalled.current) return;
        initCalled.current = true;
        if (!isSettingsComplete()) return;
        const init = async () => {
            try {
                // Détecter les données localStorage
                const storedIngredients = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);

                if (storedIngredients) {
                    setMigrating(true);

                    // Migration des ingrédients
                    const localIngredients = JSON.parse(storedIngredients);
                    const ingredientIdMap = {};

                    for (const ing of localIngredients) {
                        try {
                            const created = await ingredientsAPI.create(ing.name);
                            ingredientIdMap[ing.id] = created.id;
                        } catch (err) {
                            console.error(`Erreur migration ingrédient "${ing.name}":`, err);
                        }
                    }

                    // Migration des plats
                    const storedDishes = localStorage.getItem(STORAGE_KEYS.DISHES);
                    const dishIdMap = {};

                    if (storedDishes) {
                        const localDishes = JSON.parse(storedDishes);
                        for (const dish of localDishes) {
                            try {
                                const remappedIngredients = dish.ingredients
                                    .map(oldId => ingredientIdMap[oldId])
                                    .filter(Boolean);
                                const created = await dishesAPI.create(dish.name, remappedIngredients);
                                dishIdMap[dish.id] = created.id;
                            } catch (err) {
                                console.error(`Erreur migration plat "${dish.name}":`, err);
                            }
                        }
                    }

                    // Migration des menus
                    const storedMenus = localStorage.getItem(STORAGE_KEYS.MENUS);

                    if (storedMenus) {
                        const localMenus = JSON.parse(storedMenus);
                        // Fetch les données fraîches pour le mapping backend
                        const freshIngredients = await ingredientsAPI.getAll();
                        const freshDishes = await dishesAPI.getAll();

                        for (const menu of localMenus) {
                            try {
                                const remapItems = (items) =>
                                    (items || []).map(item => {
                                        const newId = item.type === 'dish'
                                            ? dishIdMap[item.id]
                                            : ingredientIdMap[item.id];
                                        if (!newId) return null;
                                        return { ...item, id: newId };
                                    }).filter(Boolean);

                                const midiItems = remapItems(menu.midiItems);
                                const soirItems = remapItems(menu.soirItems);

                                await menusAPI.create(menu.date, midiItems, soirItems, freshDishes, freshIngredients);
                            } catch (err) {
                                console.error(`Erreur migration menu "${menu.date}":`, err);
                            }
                        }
                    }

                    // Supprimer les données localStorage
                    localStorage.removeItem(STORAGE_KEYS.INGREDIENTS);
                    localStorage.removeItem(STORAGE_KEYS.DISHES);
                    localStorage.removeItem(STORAGE_KEYS.MENUS);
                    setMigrating(false);
                }

                await loadData();
            } catch (err) {
                console.error('Erreur lors de l\'initialisation:', err);
                setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
            }
        };

        init();
    }, []);

    return (
        <div
            className="min-h-screen app-container"
            style={{
                position: 'relative',
                backgroundImage: 'url(' + require('./background.png') + ')',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(243, 244, 246, 0.3)',
                    zIndex: 0
                }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
                <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

                {/* Bandeau d'erreur */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded relative">
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="absolute top-0 bottom-0 right-0 px-4 py-3"
                        >
                            &times;
                        </button>
                    </div>
                )}

                {/* Indicateur de migration */}
                {migrating && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 mx-4 mt-4 rounded text-center">
                        Migration des données en cours...
                    </div>
                )}

                <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
                    {currentPage === 'home' && <HomePage />}
                    {currentPage === 'ingredients' && (
                        <IngredientsPage
                            ingredients={ingredients}
                            dispatch={dispatchIngredients}
                            dishes={dishes}
                            setError={setError}
                        />
                    )}
                    {currentPage === 'dishes' && (
                        <DishesPage
                            dishes={dishes}
                            dispatch={dispatchDishes}
                            ingredients={ingredients}
                            setError={setError}
                        />
                    )}
                    {currentPage === 'menus' && (
                        <MenusPage
                            menus={menus}
                            dispatch={dispatchMenus}
                            dishes={dishes}
                            ingredients={ingredients}
                            setError={setError}
                        />
                    )}
                    {currentPage === 'shopping' && (
                        <ShoppingListPage
                            menus={menus}
                            dishes={dishes}
                            ingredients={ingredients}
                        />
                    )}
                    {currentPage === 'settings' && (
                        <SettingsPage setError={setError} onSettingsSaved={loadData} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
