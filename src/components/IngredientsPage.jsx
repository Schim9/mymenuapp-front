import React, {useState} from 'react';
import {Carrot, Search, AlertTriangle, X} from 'lucide-react';
import {ADD_INGREDIENT, DELETE_INGREDIENT, UPDATE_INGREDIENT} from '../actions/ingredientActions';
import { ingredientsAPI } from '../services/apiService';
import addImage from '../icons/ic_ing_ajout_2.png';
import updateImage from '../icons/ic_ing_modif_2.png';
import deleteImage from '../icons/ic_ing_suppr_2.png';

const IngredientsPage = ({ ingredients, dispatch, dishes, setError }) => {
    const [inputValue, setInputValue] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalData, setDeleteModalData] = useState(null);

    const handleAdd = async () => {
        if (inputValue.trim()) {
            try {
                const created = await ingredientsAPI.create(inputValue.trim());
                dispatch({ type: ADD_INGREDIENT, payload: created });
                setInputValue('');
            } catch (err) {
                setError('Erreur lors de l\'ajout de l\'ingrédient.');
            }
        }
    };

    const handleEdit = (id, name) => {
        setEditingId(id);
        setEditValue(name);
    };

    const handleUpdate = async (id) => {
        if (editValue.trim()) {
            try {
                await ingredientsAPI.update(id, editValue.trim());
                dispatch({ type: UPDATE_INGREDIENT, payload: { id, name: editValue.trim() } });
                setEditingId(null);
                setEditValue('');
            } catch (err) {
                setError('Erreur lors de la modification de l\'ingrédient.');
            }
        }
    };

    const handleDelete = async (id) => {
        // Vérifier si l'ingrédient est utilisé dans un plat
        const dishesUsingIngredient = dishes.filter(dish =>
            dish.ingredients.includes(id)
        );

        if (dishesUsingIngredient.length > 0) {
            const ingredient = ingredients.find(ing => ing.id === id);
            setDeleteModalData({
                ingredientName: ingredient.name,
                dishes: dishesUsingIngredient
            });
            setShowDeleteModal(true);
            return;
        }

        try {
            await ingredientsAPI.delete(id);
            dispatch({ type: DELETE_INGREDIENT, payload: id });
        } catch (err) {
            setError('Erreur lors de la suppression de l\'ingrédient.');
        }
    };

    const handleKeyPress = (e, action, id) => {
        if (e.key === 'Enter') {
            action(id);
        }
    };

    // Filtrer et trier les ingrédients par ordre alphabétique
    const filteredIngredients = ingredients
        .filter(ingredient => ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

    return (
        <div className="max-w-2xl mx-auto px-2 sm:px-4">
            {/* Modale de suppression */}
            {showDeleteModal && deleteModalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
                        {/* Header */}
                        <div className="bg-red-600 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={24} />
                                <h3 className="text-lg font-semibold">Suppression impossible</h3>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="hover:bg-red-700 rounded p-1 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                            <p className="text-gray-700 mb-4">
                                L'ingrédient <strong>"{deleteModalData.ingredientName}"</strong> ne peut pas être supprimé car il est utilisé dans {deleteModalData.dishes.length} plat{deleteModalData.dishes.length > 1 ? 's' : ''} :
                            </p>
                            <ul className="space-y-2 mb-4">
                                {deleteModalData.dishes.map(dish => (
                                    <li key={dish.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                        <span className="text-gray-800">{dish.name}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-gray-600 text-sm">
                                Pour supprimer cet ingrédient, vous devez d'abord le retirer de ces plats ou supprimer ces plats.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-2 rounded-lg text-white transition-colors hover:bg-cyan-900"
                                style={{ backgroundColor: 'var(--custom-blue)' }}
                            >
                                J'ai compris
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Carrot size={28} className="sm:size-8 text-cyan-800" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Gestion des Ingrédients
                </h2>
            </div>

            {/* Formulaire d'ajout */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex gap-2 sm:gap-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleAdd)}
                        placeholder="Nom de l'ingrédient..."
                        className="flex-1 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-800 text-base"
                    />
                    <button
                        onClick={handleAdd}
                        className="bg-transparent border-none p-0 hover:opacity-80 transition-opacity flex-shrink-0"
                    >
                        <img
                            src={addImage}
                            alt="Ajouter"
                            className="w-10 h-10 sm:w-12 sm:h-12"
                        />
                    </button>
                </div>
            </div>

            {/* Barre de recherche */}
            {ingredients.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4 mb-4 sm:mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher un ingrédient..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-800 text-base"
                        />
                    </div>
                    {searchTerm && (
                        <div className="mt-2 text-sm text-gray-600">
                            {filteredIngredients.length} résultat{filteredIngredients.length > 1 ? 's' : ''} trouvé{filteredIngredients.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            )}

            {/* Liste des ingrédients */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {ingredients.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center text-gray-500">
                        Aucun ingrédient pour le moment. Ajoutez-en un ci-dessus !
                    </div>
                ) : filteredIngredients.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center text-gray-500">
                        Aucun ingrédient ne correspond à votre recherche "{searchTerm}"
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredIngredients.map(ingredient => (
                            <li key={ingredient.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                                {editingId === ingredient.id ? (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyPress={(e) => handleKeyPress(e, handleUpdate, ingredient.id)}
                                            className="flex-1 px-3 py-2 border border-cyan-800 rounded focus:outline-none focus:ring-2 focus:ring-cyan-800 text-base"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdate(ingredient.id)}
                                                className="flex-1 sm:flex-none text-white px-4 py-2 rounded hover:bg-cyan-900 transition-colors"
                                                style={{ backgroundColor: 'var(--custom-blue)' }}
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
                                ) : (
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-base sm:text-lg text-gray-800 break-words flex-1 min-w-0">{ingredient.name}</span>
                                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleEdit(ingredient.id, ingredient.name)}
                                                className="bg-transparent border-none p-0 hover:opacity-80 transition-opacity"
                                                title="Modifier"
                                            >
                                                <img
                                                    src={updateImage}
                                                    alt="Modifier"
                                                    className="w-10 h-10 sm:w-12 sm:h-12"
                                                />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ingredient.id)}
                                                className="bg-transparent border-none p-0 hover:opacity-80 transition-opacity"
                                                title="Supprimer"
                                            >
                                                <img
                                                    src={deleteImage}
                                                    alt="Supprimer"
                                                    className="w-10 h-10 sm:w-12 sm:h-12"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {ingredients.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 text-center">
                    {ingredients.length} ingrédient{ingredients.length > 1 ? 's' : ''} au total
                </div>
            )}
        </div>
    );
};

export default IngredientsPage;