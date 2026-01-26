import React, { useState, useReducer, useEffect } from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import IngredientsPage from './components/IngredientsPage';
import DishesPage from './components/DishesPage';
import MenusPage from './components/MenusPage';
import ShoppingListPage from './components/ShoppingListPage';
import { ingredientsReducer } from './reducers/ingredientsReducer';
import { dishesReducer } from './reducers/dishesReducer';
import { menusReducer } from './reducers/menusReducer';
import './App.css';

// Clés pour le localStorage
const STORAGE_KEYS = {
    INGREDIENTS: 'app_ingredients',
    DISHES: 'app_dishes',
    MENUS: 'app_menus'
};

// Fonction pour charger les données depuis localStorage
const loadFromLocalStorage = (key, defaultValue = []) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.error(`Erreur lors du chargement de ${key}:`, error);
        return defaultValue;
    }
};

// Fonction pour sauvegarder dans localStorage
const saveToLocalStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
    }
};

const App = () => {
    const [currentPage, setCurrentPage] = useState('home');

    // Charger les données initiales depuis localStorage
    const [ingredients, dispatchIngredients] = useReducer(
        ingredientsReducer,
        loadFromLocalStorage(STORAGE_KEYS.INGREDIENTS)
    );

    const [dishes, dispatchDishes] = useReducer(
        dishesReducer,
        loadFromLocalStorage(STORAGE_KEYS.DISHES)
    );

    const [menus, dispatchMenus] = useReducer(
        menusReducer,
        loadFromLocalStorage(STORAGE_KEYS.MENUS)
    );

    // Sauvegarder les ingrédients dans localStorage à chaque changement
    useEffect(() => {
        saveToLocalStorage(STORAGE_KEYS.INGREDIENTS, ingredients);
    }, [ingredients]);

    // Sauvegarder les plats dans localStorage à chaque changement
    useEffect(() => {
        saveToLocalStorage(STORAGE_KEYS.DISHES, dishes);
    }, [dishes]);

    // Sauvegarder les menus dans localStorage à chaque changement
    useEffect(() => {
        saveToLocalStorage(STORAGE_KEYS.MENUS, menus);
    }, [menus]);

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
                <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
                    {currentPage === 'home' && <HomePage />}
                    {currentPage === 'ingredients' && (
                        <IngredientsPage
                            ingredients={ingredients}
                            dispatch={dispatchIngredients}
                            dishes={dishes}
                        />
                    )}
                    {currentPage === 'dishes' && (
                        <DishesPage
                            dishes={dishes}
                            dispatch={dispatchDishes}
                            ingredients={ingredients}
                        />
                    )}
                    {currentPage === 'menus' && (
                        <MenusPage
                            menus={menus}
                            dispatch={dispatchMenus}
                            dishes={dishes}
                            ingredients={ingredients}
                        />
                    )}
                    {currentPage === 'shopping' && (
                        <ShoppingListPage
                            menus={menus}
                            dishes={dishes}
                            ingredients={ingredients}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;