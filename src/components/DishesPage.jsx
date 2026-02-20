import React, {useState} from 'react';
import {Search, Utensils} from 'lucide-react';
import {ADD_DISH, DELETE_DISH, UPDATE_DISH} from '../actions/dishActions';
import { dishesAPI } from '../services/apiService';
import addImage from "../icons/ic_ing_reload_2.png";
import addDishImage from "../icons/ic_plat_ajout_2.png";
import editDishImage from "../icons/ic_plat_modif_2.png";
import deleteDishImage from "../icons/ic_plat_suppr_2.png";

const DishesPage = ({dishes, dispatch, ingredients, setError}) => {
    const [dishName, setDishName] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editIngredients, setEditIngredients] = useState([]);
    const [showIngredientSelector, setShowIngredientSelector] = useState(false);
    const [ingredientFilter, setIngredientFilter] = useState('');
    const [editIngredientFilter, setEditIngredientFilter] = useState('');

    const handleAddDish = async () => {
        if (dishName.trim() && selectedIngredients.length > 0) {
            try {
                const created = await dishesAPI.create(dishName.trim(), selectedIngredients);
                dispatch({ type: ADD_DISH, payload: created });
                setDishName('');
                setSelectedIngredients([]);
                setShowIngredientSelector(false);
            } catch (err) {
                setError('Erreur lors de l\'ajout du plat.');
            }
        }
    };

    const handleEditDish = (dish) => {
        setEditingId(dish.id);
        setEditName(dish.name);
        setEditIngredients(dish.ingredients);
    };

    const handleUpdateDish = async (id) => {
        if (editName.trim() && editIngredients.length > 0) {
            try {
                await dishesAPI.update(id, editName.trim(), editIngredients);
                dispatch({
                    type: UPDATE_DISH,
                    payload: { id, name: editName.trim(), ingredients: editIngredients }
                });
                setEditingId(null);
                setEditName('');
                setEditIngredients([]);
            } catch (err) {
                setError('Erreur lors de la modification du plat.');
            }
        }
    };

    const handleDeleteDish = async (id) => {
        try {
            await dishesAPI.delete(id);
            dispatch({type: DELETE_DISH, payload: id});
        } catch (err) {
            setError('Erreur lors de la suppression du plat.');
        }
    };

    const toggleIngredient = (ingredientId, isEditing = false) => {
        if (isEditing) {
            setEditIngredients(prev =>
                prev.includes(ingredientId)
                    ? prev.filter(id => id !== ingredientId)
                    : [...prev, ingredientId]
            );
            setEditIngredientFilter('');
        } else {
            setSelectedIngredients(prev =>
                prev.includes(ingredientId)
                    ? prev.filter(id => id !== ingredientId)
                    : [...prev, ingredientId]
            );
            setIngredientFilter('');
        }
    };

    const getIngredientName = (ingredientId) => {
        const ingredient = ingredients.find(ing => ing.id === ingredientId);
        return ingredient ? ingredient.name : 'Inconnu';
    };

    const filteredDishes = dishes
        .filter(dish => dish.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

    // Filtrer les ingrédients pour le formulaire d'ajout
    const filteredIngredientsForAdd = ingredients
        .filter(ing => ing.name.toLowerCase().includes(ingredientFilter.toLowerCase()))
        .sort((i1, i2) => i1.name.localeCompare(i2.name));

    // Filtrer les ingrédients pour le formulaire d'édition
    const filteredIngredientsForEdit = ingredients
        .filter(ing => ing.name.toLowerCase().includes(editIngredientFilter.toLowerCase()))
        .sort((i1, i2) => i1.name.localeCompare(i2.name));

    return (
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Utensils size={28} className="sm:size-8 text-cyan-800"/>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Gestion des Plats
                </h2>
            </div>

            {/* Formulaire d'ajout */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={dishName}
                            onChange={(e) => setDishName(e.target.value)}
                            placeholder="Nom du plat..."
                            className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700 text-base"
                        />
                        <button
                            onClick={() => setShowIngredientSelector(!showIngredientSelector)}
                            className="bg-transparent border-none p-0 hover:opacity-80 transition-opacity flex-shrink-0"
                        >
                            <img
                                src={addImage}
                                alt="Sélectionner ingrédients"
                                className="w-10 h-10 sm:w-12 sm:h-12"
                            />
                        </button>
                        <button
                            onClick={handleAddDish}
                            disabled={!dishName.trim() || selectedIngredients.length === 0}
                            className="bg-transparent border-none p-0 hover:opacity-80 transition-opacity flex-shrink-0 disabled:opacity-40"
                        >
                            <img
                                src={addDishImage}
                                alt="Ajouter plat"
                                className="w-10 h-10 sm:w-12 sm:h-12"
                            />
                        </button>
                    </div>
                </div>

                {/* Sélecteur d'ingrédients */}
                {showIngredientSelector && (
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4 mt-4">
                        <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Sélectionner les
                            ingrédients :</h4>
                        {ingredients.length === 0 ? (
                            <p className="text-gray-500 text-sm">Aucun ingrédient disponible. Créez-en dans la page
                                Ingrédients !</p>
                        ) : (
                            <>
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={18}/>
                                    <input
                                        type="text"
                                        value={ingredientFilter}
                                        onChange={(e) => setIngredientFilter(e.target.value)}
                                        placeholder="Filtrer les ingrédients..."
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700 text-sm"
                                    />
                                </div>
                                {filteredIngredientsForAdd.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">
                                        Aucun ingrédient ne correspond à "{ingredientFilter}"
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {filteredIngredientsForAdd.map(ingredient => (
                                            <label
                                                key={ingredient.id}
                                                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIngredients.includes(ingredient.id)}
                                                    onChange={() => toggleIngredient(ingredient.id)}
                                                    className="w-4 h-4 text-cyan-800 rounded focus:ring-cyan-700 flex-shrink-0"
                                                />
                                                <span className="text-sm break-words">{ingredient.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Barre de recherche */}
            {dishes.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4 mb-4 sm:mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher un plat..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700 text-base"
                        />
                    </div>
                    {searchTerm && (
                        <div className="mt-2 text-sm text-gray-600">
                            {filteredDishes.length} résultat{filteredDishes.length > 1 ? 's' : ''} trouvé{filteredDishes.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            )}

            {/* Liste des plats */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {dishes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Aucun plat pour le moment. Ajoutez-en un ci-dessus !
                    </div>
                ) : filteredDishes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Aucun plat ne correspond à votre recherche "{searchTerm}"
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredDishes.map(dish => (
                            <li key={dish.id} className="p-4 hover:bg-gray-50 transition-colors">
                                {editingId === dish.id ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-cyan-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-700 text-base"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateDish(dish.id)}
                                                    disabled={!editName.trim() || editIngredients.length === 0}
                                                    className="flex-1 sm:flex-none text-white px-4 py-2 rounded hover:bg-cyan-900 transition-colors disabled:bg-gray-400"
                                                    style={{backgroundColor: 'var(--custom-blue)'}}
                                                >
                                                    Valider
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="flex-1 sm:flex-none bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-3">
                                            <h4 className="font-semibold text-gray-700 text-sm mb-2">Ingrédients :</h4>
                                            <div className="relative mb-3">
                                                <Search
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    size={18}/>
                                                <input
                                                    type="text"
                                                    value={editIngredientFilter}
                                                    onChange={(e) => setEditIngredientFilter(e.target.value)}
                                                    placeholder="Filtrer les ingrédients..."
                                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700 text-sm"
                                                />
                                            </div>
                                            {filteredIngredientsForEdit.length === 0 ? (
                                                <p className="text-gray-500 text-sm text-center py-4">
                                                    Aucun ingrédient ne correspond à "{editIngredientFilter}"
                                                </p>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {filteredIngredientsForEdit.map(ingredient => (
                                                        <label
                                                            key={ingredient.id}
                                                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer text-sm"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={editIngredients.includes(ingredient.id)}
                                                                onChange={() => toggleIngredient(ingredient.id, true)}
                                                                className="w-4 h-4 text-cyan-800 rounded focus:ring-cyan-700 flex-shrink-0"
                                                            />
                                                            <span className="break-words">{ingredient.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-lg font-semibold text-gray-800 break-words flex-1 min-w-0">{dish.name}</h3>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => handleEditDish(dish)}
                                                    className="bg-transparent border-none p-0 hover:opacity-80 transition-opacity"
                                                    title="Modifier"
                                                >
                                                    <img
                                                        src={editDishImage}
                                                        alt="Modifier"
                                                        className="w-10 h-10 sm:w-12 sm:h-12"
                                                    />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDish(dish.id)}
                                                    className="bg-transparent border-none p-0 hover:opacity-80 transition-opacity"
                                                    title="Supprimer"
                                                >
                                                    <img
                                                        src={deleteDishImage}
                                                        alt="Supprimer"
                                                        className="w-10 h-10 sm:w-12 sm:h-12"
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {dish.ingredients.map(ingredientId => (
                                                <span
                                                    key={ingredientId}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white break-words"
                                                    style={{backgroundColor: 'var(--custom-blue)'}}
                                                >
                                                    {getIngredientName(ingredientId)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {dishes.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 text-center">
                    {dishes.length} plat{dishes.length > 1 ? 's' : ''} au total
                </div>
            )}
        </div>
    );
};

export default DishesPage;