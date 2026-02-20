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

const App = () => {
    const [currentPage, setCurrentPage] = useState(isSettingsComplete() ? 'home' : 'settings');
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

    // Chargement initial
    const initCalled = useRef(false);
    useEffect(() => {
        if (initCalled.current) return;
        initCalled.current = true;
        if (!isSettingsComplete()) return;
        loadData();
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
