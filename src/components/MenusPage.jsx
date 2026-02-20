import React, { useState } from 'react';
import { ChefHat, Calendar, List, Search, Plus, X } from 'lucide-react';
import { SET_MENUS } from '../actions/menuActions';
import { menusAPI } from '../services/apiService';
import editMenuImage from "../icons/ic_plat_modif_2.png";
import deleteMenuImage from "../icons/ic_plat_suppr_2.png";

const normalize = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const MenusPage = ({ menus, dispatch, dishes, ingredients, setError }) => {
    const [viewMode, setViewMode] = useState('calendar'); // 'list' ou 'calendar'
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // États pour le formulaire
    const [midiDishes, setMidiDishes] = useState([]);
    const [midiIngredients, setMidiIngredients] = useState([]);
    const [soirDishes, setSoirDishes] = useState([]);
    const [soirIngredients, setSoirIngredients] = useState([]);

    // États pour l'édition
    const [editingId, setEditingId] = useState(null);
    const [editDate, setEditDate] = useState('');
    const [editMidiDishes, setEditMidiDishes] = useState([]);
    const [editMidiIngredients, setEditMidiIngredients] = useState([]);
    const [editSoirDishes, setEditSoirDishes] = useState([]);
    const [editSoirIngredients, setEditSoirIngredients] = useState([]);

    const refreshMenus = async () => {
        const apiMenus = await menusAPI.getAll();
        dispatch({ type: SET_MENUS, payload: apiMenus });
    };

    const handleAddMenu = async () => {
        if (!selectedDate) {
            alert('Veuillez sélectionner une date');
            return;
        }
        if (midiDishes.length === 0 && midiIngredients.length === 0 &&
            soirDishes.length === 0 && soirIngredients.length === 0) {
            alert('Veuillez sélectionner au moins un plat ou ingrédient');
            return;
        }

        const midiItems = [
            ...midiDishes.map(id => ({ id, name: getDishName(id), type: 'dish' })),
            ...midiIngredients.map(id => ({ id, name: getIngredientName(id), type: 'ingredient' }))
        ];

        const soirItems = [
            ...soirDishes.map(id => ({ id, name: getDishName(id), type: 'dish' })),
            ...soirIngredients.map(id => ({ id, name: getIngredientName(id), type: 'ingredient' }))
        ];

        try {
            await menusAPI.create(selectedDate, midiItems, soirItems, dishes, ingredients);
            await refreshMenus();

            setSelectedDate('');
            setMidiDishes([]);
            setMidiIngredients([]);
            setSoirDishes([]);
            setSoirIngredients([]);
            setShowAddForm(false);
        } catch (err) {
            setError('Erreur lors de la création du menu.');
        }
    };

    const handleEditMenu = (menu) => {
        setEditingId(menu.date);
        setEditDate(menu.date);
        setEditMidiDishes(menu.midiItems.filter(item => item.type === 'dish').map(item => item.id));
        setEditMidiIngredients(menu.midiItems.filter(item => item.type === 'ingredient').map(item => item.id));
        setEditSoirDishes(menu.soirItems.filter(item => item.type === 'dish').map(item => item.id));
        setEditSoirIngredients(menu.soirItems.filter(item => item.type === 'ingredient').map(item => item.id));
    };

    const handleUpdateMenu = async () => {
        if (!editDate) {
            alert('Veuillez sélectionner une date');
            return;
        }

        const midiItems = [
            ...editMidiDishes.map(id => ({ id, name: getDishName(id), type: 'dish' })),
            ...editMidiIngredients.map(id => ({ id, name: getIngredientName(id), type: 'ingredient' }))
        ];

        const soirItems = [
            ...editSoirDishes.map(id => ({ id, name: getDishName(id), type: 'dish' })),
            ...editSoirIngredients.map(id => ({ id, name: getIngredientName(id), type: 'ingredient' }))
        ];

        try {
            await menusAPI.update(editDate, midiItems, soirItems, dishes, ingredients);
            await refreshMenus();
            setEditingId(null);
        } catch (err) {
            setError('Erreur lors de la modification du menu.');
        }
    };

    const handleDeleteMenu = async (menu) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
            try {
                await menusAPI.delete(menu.date, menu.midiItems, menu.soirItems, dishes, ingredients);
                await refreshMenus();
            } catch (err) {
                setError('Erreur lors de la suppression du menu.');
            }
        }
    };

    const toggleItem = (itemId, type, meal, isEditing = false) => {
        const setters = {
            midiDishes: isEditing ? setEditMidiDishes : setMidiDishes,
            midiIngredients: isEditing ? setEditMidiIngredients : setMidiIngredients,
            soirDishes: isEditing ? setEditSoirDishes : setSoirDishes,
            soirIngredients: isEditing ? setEditSoirIngredients : setSoirIngredients
        };

        const key = `${meal}${type === 'dish' ? 'Dishes' : 'Ingredients'}`;
        const currentState = isEditing ?
            (key === 'midiDishes' ? editMidiDishes : key === 'midiIngredients' ? editMidiIngredients :
                key === 'soirDishes' ? editSoirDishes : editSoirIngredients) :
            (key === 'midiDishes' ? midiDishes : key === 'midiIngredients' ? midiIngredients :
                key === 'soirDishes' ? soirDishes : soirIngredients);

        setters[key](prev =>
            currentState.includes(itemId)
                ? currentState.filter(id => id !== itemId)
                : [...currentState, itemId]
        );
    };

    const getDishName = (dishId) => {
        const dish = dishes.find(d => d.id === dishId);
        return dish ? dish.name : 'Inconnu';
    };

    const getIngredientName = (ingredientId) => {
        const ingredient = ingredients.find(ing => ing.id === ingredientId);
        return ingredient ? ingredient.name : 'Inconnu';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const filteredMenus = menus
        .filter(menu => {
            if (!searchTerm) return true;
            const formattedDate = formatDate(menu.date);
            return normalize(formattedDate).includes(normalize(searchTerm));
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                    <ChefHat size={28} className="sm:size-8 text-cyan-800" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Gestion des Menus
                    </h2>
                </div>

                {/* Bouton de changement de vue */}
                <div className="flex gap-2 bg-gray-200 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 rounded transition-colors ${
                            viewMode === 'list'
                                ? 'bg-white text-cyan-800 font-semibold shadow'
                                : 'text-gray-600 hover:text-cyan-800'
                        }`}
                        title="Vue liste"
                    >
                        <List size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-3 py-2 rounded transition-colors ${
                            viewMode === 'calendar'
                                ? 'bg-white text-cyan-800 font-semibold shadow'
                                : 'text-gray-600 hover:text-cyan-800'
                        }`}
                        title="Vue calendrier"
                    >
                        <Calendar size={20} />
                    </button>
                </div>
            </div>

            {/* Bouton d'ajout */}
            <div className="mb-4 sm:mb-6">
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full sm:w-auto px-6 py-3 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--custom-blue)' }}
                >
                    {showAddForm ? <X size={20} /> : <Plus size={20} />}
                    {showAddForm ? 'Annuler' : 'Nouveau menu'}
                </button>
            </div>

            {/* Formulaire d'ajout */}
            {showAddForm && (
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                    <h3 className="font-semibold text-lg mb-4">Créer un nouveau menu</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date du menu
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700 text-base"
                        />
                    </div>

                    {/* Section Midi */}
                    <MenuMealSelector
                        title="Repas du midi"
                        dishes={dishes}
                        ingredients={ingredients}
                        selectedDishes={midiDishes}
                        selectedIngredients={midiIngredients}
                        onToggleDish={(id) => toggleItem(id, 'dish', 'midi')}
                        onToggleIngredient={(id) => toggleItem(id, 'ingredient', 'midi')}
                    />

                    {/* Section Soir */}
                    <MenuMealSelector
                        title="Repas du soir"
                        dishes={dishes}
                        ingredients={ingredients}
                        selectedDishes={soirDishes}
                        selectedIngredients={soirIngredients}
                        onToggleDish={(id) => toggleItem(id, 'dish', 'soir')}
                        onToggleIngredient={(id) => toggleItem(id, 'ingredient', 'soir')}
                    />

                    <button
                        onClick={handleAddMenu}
                        className="w-full mt-4 px-6 py-3 text-white rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--custom-blue)' }}
                    >
                        Créer le menu
                    </button>
                </div>
            )}

            {/* Barre de recherche */}
            {menus.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4 mb-4 sm:mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher par date..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700 text-base"
                        />
                    </div>
                </div>
            )}

            {/* Affichage selon le mode */}
            {viewMode === 'list' ? (
                <ListView
                    menus={filteredMenus}
                    editingId={editingId}
                    editDate={editDate}
                    setEditDate={setEditDate}
                    editMidiDishes={editMidiDishes}
                    editMidiIngredients={editMidiIngredients}
                    editSoirDishes={editSoirDishes}
                    editSoirIngredients={editSoirIngredients}
                    dishes={dishes}
                    ingredients={ingredients}
                    formatDate={formatDate}
                    getDishName={getDishName}
                    getIngredientName={getIngredientName}
                    handleEditMenu={handleEditMenu}
                    handleUpdateMenu={handleUpdateMenu}
                    handleDeleteMenu={handleDeleteMenu}
                    toggleItem={toggleItem}
                    setEditingId={setEditingId}
                />
            ) : (
                <CalendarView
                    menus={filteredMenus}
                    formatDate={formatDate}
                />
            )}

            {menus.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 text-center">
                    {filteredMenus.length} menu{filteredMenus.length > 1 ? 's' : ''} planifié{filteredMenus.length > 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

// Composant pour sélectionner plats et ingrédients d'un repas
const MenuMealSelector = ({
                              title,
                              dishes,
                              ingredients,
                              selectedDishes,
                              selectedIngredients,
                              onToggleDish,
                              onToggleIngredient
                          }) => {
    const [showDishes, setShowDishes] = useState(false);
    const [showIngredients, setShowIngredients] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>

            {/* Toggle Plats */}
            <button
                onClick={() => setShowDishes(!showDishes)}
                className="w-full text-left px-4 py-2 bg-gray-100 rounded mb-2 hover:bg-gray-200 transition-colors"
            >
                Plats ({selectedDishes.length} sélectionné{selectedDishes.length > 1 ? 's' : ''})
            </button>

            {showDishes && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3 ml-4">
                    {dishes.map(dish => (
                        <label
                            key={dish.id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedDishes.includes(dish.id)}
                                onChange={() => onToggleDish(dish.id)}
                                className="w-4 h-4 text-cyan-800 rounded focus:ring-cyan-700"
                            />
                            <span className="text-sm">{dish.name}</span>
                        </label>
                    ))}
                </div>
            )}

            {/* Toggle Ingrédients */}
            <button
                onClick={() => setShowIngredients(!showIngredients)}
                className="w-full text-left px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
                Ingrédients ({selectedIngredients.length} sélectionné{selectedIngredients.length > 1 ? 's' : ''})
            </button>

            {showIngredients && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3 ml-4">
                    {ingredients.map(ingredient => (
                        <label
                            key={ingredient.id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedIngredients.includes(ingredient.id)}
                                onChange={() => onToggleIngredient(ingredient.id)}
                                className="w-4 h-4 text-cyan-800 rounded focus:ring-cyan-700"
                            />
                            <span className="text-sm">{ingredient.name}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

// Vue Liste
const ListView = ({
                      menus,
                      editingId,
                      editDate,
                      setEditDate,
                      editMidiDishes,
                      editMidiIngredients,
                      editSoirDishes,
                      editSoirIngredients,
                      dishes,
                      ingredients,
                      formatDate,
                      getDishName,
                      getIngredientName,
                      handleEditMenu,
                      handleUpdateMenu,
                      handleDeleteMenu,
                      toggleItem,
                      setEditingId
                  }) => {
    if (menus.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                Aucun menu planifié. Créez-en un !
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {menus.map(menu => (
                <div key={menu.date} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    {editingId === menu.date ? (
                        <div className="space-y-4">
                            <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="w-full px-4 py-2 border border-cyan-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-700"
                            />

                            <MenuMealSelector
                                title="Repas du midi"
                                dishes={dishes}
                                ingredients={ingredients}
                                selectedDishes={editMidiDishes}
                                selectedIngredients={editMidiIngredients}
                                onToggleDish={(id) => toggleItem(id, 'dish', 'midi', true)}
                                onToggleIngredient={(id) => toggleItem(id, 'ingredient', 'midi', true)}
                            />

                            <MenuMealSelector
                                title="Repas du soir"
                                dishes={dishes}
                                ingredients={ingredients}
                                selectedDishes={editSoirDishes}
                                selectedIngredients={editSoirIngredients}
                                onToggleDish={(id) => toggleItem(id, 'dish', 'soir', true)}
                                onToggleIngredient={(id) => toggleItem(id, 'ingredient', 'soir', true)}
                            />

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleUpdateMenu()}
                                    className="flex-1 px-4 py-2 text-white rounded transition-colors"
                                    style={{ backgroundColor: 'var(--custom-blue)' }}
                                >
                                    Valider
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {formatDate(menu.date)}
                                </h3>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditMenu(menu)}
                                        className="bg-transparent border-none p-0 hover:opacity-80 transition-opacity"
                                    >
                                        <img src={editMenuImage} alt="Modifier" className="w-10 h-10 sm:w-12 sm:h-12" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMenu(menu)}
                                        className="bg-transparent border-none p-0 hover:opacity-80 transition-opacity"
                                    >
                                        <img src={deleteMenuImage} alt="Supprimer" className="w-10 h-10 sm:w-12 sm:h-12" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <MealDisplay
                                    title="🌅 Midi"
                                    items={menu.midiItems}
                                />
                                <MealDisplay
                                    title="🌙 Soir"
                                    items={menu.soirItems}
                                />
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

// Affichage d'un repas
const MealDisplay = ({ title, items }) => {
    const hasContent = items && items.length > 0;

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>
            {!hasContent ? (
                <p className="text-gray-400 text-sm italic">Aucun plat ou ingrédient</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {items.map(item => (
                        <span
                            key={`${item.type}-${item.id}-${item.name}`}
                            className="px-3 py-1 rounded-full text-sm text-white"
                            style={{ backgroundColor: 'var(--custom-blue)' }}
                        >
                            {item.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// Vue Calendrier
const CalendarView = ({ menus, formatDate }) => {
    if (menus.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                Aucun menu planifié. Créez-en un !
            </div>
        );
    }

    // Grouper par semaine
    const weekMenus = menus.reduce((acc, menu) => {
        const date = new Date(menu.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1); // Lundi
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!acc[weekKey]) {
            acc[weekKey] = [];
        }
        acc[weekKey].push(menu);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {Object.entries(weekMenus).map(([weekStart, weekMenusList]) => (
                <div key={weekStart} className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-4 text-cyan-800">
                        Semaine du {new Date(weekStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {weekMenusList.map(menu => (
                            <div key={menu.date} className="border border-gray-200 rounded-lg p-3">
                                <div className="text-sm font-semibold text-gray-700 mb-2">
                                    {new Date(menu.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div>
                                        <span className="font-medium">🌅 Midi: </span>
                                        {!menu.midiItems || menu.midiItems.length === 0 ? (
                                            <span className="text-gray-400">-</span>
                                        ) : (
                                            <span className="text-gray-600">
                                                {menu.midiItems.map(item => item.name).join(', ')}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-medium">🌙 Soir: </span>
                                        {!menu.soirItems || menu.soirItems.length === 0 ? (
                                            <span className="text-gray-400">-</span>
                                        ) : (
                                            <span className="text-gray-600">
                                                {menu.soirItems.map(item => item.name).join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MenusPage;