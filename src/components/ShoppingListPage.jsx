import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ShoppingCart, Calendar, Printer, Send, Trash2 } from 'lucide-react';
import { shoppingListAPI } from '../services/apiService';

const ShoppingListPage = ({ menus, dishes, ingredients }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedItems, setSelectedItems] = useState({});
    const [shoppingQueue, setShoppingQueue] = useState(new Set());
    const [sendStatus, setSendStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
    const [clearStatus, setClearStatus] = useState('idle'); // 'idle' | 'clearing' | 'success' | 'error'

    const shoppingList = useMemo(() => {
        if (!startDate || !endDate) return [];

        const start = new Date(startDate);
        const end = new Date(endDate);

        const periodMenus = menus.filter(menu => {
            const menuDate = new Date(menu.date);
            return menuDate >= start && menuDate <= end;
        });

        const ingredientCount = new Map();

        periodMenus.forEach(menu => {
            [...(menu.midiItems || []), ...(menu.soirItems || [])].forEach(item => {
                if (item.type === 'ingredient') {
                    ingredientCount.set(item.name, (ingredientCount.get(item.name) || 0) + 1);
                } else if (item.type === 'dish') {
                    const dish = dishes.find(d => d.id === item.id);
                    if (dish && dish.ingredients) {
                        dish.ingredients.forEach(ingId => {
                            const ingredient = ingredients.find(ing => ing.id === ingId);
                            if (ingredient) {
                                ingredientCount.set(ingredient.name, (ingredientCount.get(ingredient.name) || 0) + 1);
                            }
                        });
                    }
                }
            });
        });

        return Array.from(ingredientCount.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [startDate, endDate, menus, dishes, ingredients]);

    const refreshShoppingQueue = useCallback(() => {
        shoppingListAPI.getItems()
            .then(items => setShoppingQueue(new Set(items)))
            .catch(() => {});
    }, []);

    useEffect(() => {
        refreshShoppingQueue();
    }, [refreshShoppingQueue]);

    // Pré-coche les items déjà dans la liste quand la liste change
    useEffect(() => {
        const initial = {};
        shoppingList.forEach(item => {
            if (shoppingQueue.has(item.name)) initial[item.name] = true;
        });
        setSelectedItems(initial);
    }, [shoppingList]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleSelect = (itemName) => {
        setSelectedItems(prev => ({ ...prev, [itemName]: !prev[itemName] }));
    };

    const handleSendToList = async () => {
        const toAdd = shoppingList
            .filter(item => selectedItems[item.name] && !shoppingQueue.has(item.name))
            .map(item => item.name);

        if (toAdd.length === 0) return;

        setSendStatus('sending');
        try {
            await shoppingListAPI.addItems(toAdd);
            refreshShoppingQueue();
            setSendStatus('success');
            setTimeout(() => setSendStatus('idle'), 3000);
        } catch {
            setSendStatus('error');
            setTimeout(() => setSendStatus('idle'), 3000);
        }
    };

    const handleClearList = async () => {
        setClearStatus('clearing');
        try {
            await shoppingListAPI.consumeItems();
            setShoppingQueue(new Set());
            setSendStatus('idle');
            setClearStatus('success');
            setTimeout(() => setClearStatus('idle'), 3000);
        } catch {
            setClearStatus('error');
            setTimeout(() => setClearStatus('idle'), 3000);
        }
    };

    const resetSelections = () => setSelectedItems({});

    const selectedCount = Object.values(selectedItems).filter(Boolean).length;
    const queuedOnPageCount = shoppingList.filter(item => shoppingQueue.has(item.name)).length;

    const hasItemsToSend = shoppingList.some(
        item => selectedItems[item.name] && !shoppingQueue.has(item.name)
    );

    return (
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <ShoppingCart size={28} className="sm:size-8 text-cyan-800" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Liste de Courses
                </h2>
            </div>

            {/* Sélection de période */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Période
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Du</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700 text-base"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Au</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700 text-base"
                        />
                    </div>
                </div>
                {startDate && endDate && (
                    <div className="mt-4 text-sm text-gray-600">
                        Du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}
                    </div>
                )}
            </div>

            {/* Liste de courses */}
            {startDate && endDate && (
                <>
                    {shoppingList.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                            Aucun menu planifié sur cette période.
                        </div>
                    ) : (
                        <>
                            {/* Barre d'actions */}
                            <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-gray-700 flex items-center gap-3 flex-wrap">
                                    <span>
                                        <span className="font-semibold">{shoppingList.length}</span> ingrédient{shoppingList.length > 1 ? 's' : ''}
                                    </span>
                                    {selectedCount > 0 && (
                                        <span className="text-cyan-700 font-medium">
                                            {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {queuedOnPageCount > 0 && (
                                        <span className="text-green-600 font-medium">
                                            {queuedOnPageCount} en liste
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2 items-center flex-wrap justify-end">
                                    {sendStatus === 'success' && (
                                        <span className="text-green-600 text-sm font-medium">Ajouté !</span>
                                    )}
                                    {sendStatus === 'error' && (
                                        <span className="text-red-600 text-sm font-medium">Erreur</span>
                                    )}
                                    <button
                                        onClick={resetSelections}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                    >
                                        Réinitialiser
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                                        style={{ backgroundColor: 'var(--custom-blue)' }}
                                    >
                                        <Printer size={18} />
                                        Imprimer
                                    </button>
                                    <button
                                        onClick={handleSendToList}
                                        disabled={!hasItemsToSend || sendStatus === 'sending'}
                                        className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 text-sm bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Send size={18} />
                                        {sendStatus === 'sending' ? 'Envoi...' : 'Ajouter à la liste'}
                                    </button>
                                </div>
                            </div>

                            {/* Liste */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden print:shadow-none">
                                <div className="divide-y divide-gray-200">
                                    {shoppingList.map(item => {
                                        const inQueue = shoppingQueue.has(item.name);
                                        const isSelected = selectedItems[item.name] || false;
                                        return (
                                            <label
                                                key={item.name}
                                                className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                    inQueue ? 'bg-green-50' : ''
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(item.name)}
                                                    className="w-5 h-5 text-green-500 rounded focus:ring-green-400 flex-shrink-0"
                                                />
                                                <div className="flex-1 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base sm:text-lg text-gray-800">
                                                            {item.name}
                                                        </span>
                                                        {inQueue && (
                                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                                                                En liste
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span
                                                        className="px-3 py-1 rounded-full text-sm font-semibold text-white flex-shrink-0"
                                                        style={{ backgroundColor: 'var(--custom-blue)' }}
                                                    >
                                                        x{item.count}
                                                    </span>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {!startDate && !endDate && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                    Sélectionnez une période pour générer votre liste de courses
                </div>
            )}

            {/* Widget liste de courses actuelle */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-4 sm:mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <ShoppingCart size={20} className="text-green-600" />
                        Ma liste de courses
                        {shoppingQueue.size > 0 && (
                            <span className="text-sm font-normal text-gray-500">
                                ({shoppingQueue.size} article{shoppingQueue.size > 1 ? 's' : ''})
                            </span>
                        )}
                    </h3>
                    {shoppingQueue.size > 0 && (
                        <div className="flex items-center gap-2">
                            {clearStatus === 'success' && (
                                <span className="text-green-600 text-sm font-medium">Liste vidée</span>
                            )}
                            {clearStatus === 'error' && (
                                <span className="text-red-600 text-sm font-medium">Erreur</span>
                            )}
                            <button
                                onClick={handleClearList}
                                disabled={clearStatus === 'clearing'}
                                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 text-sm bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Trash2 size={18} />
                                {clearStatus === 'clearing' ? 'Vidage...' : 'Vider la liste'}
                            </button>
                        </div>
                    )}
                </div>
                {shoppingQueue.size === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">La liste est vide</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {[...shoppingQueue].sort((a, b) => a.localeCompare(b)).map(name => (
                            <span
                                key={name}
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
                    .print\\:shadow-none { position: absolute; left: 0; top: 0; width: 100%; }
                    button, nav { display: none !important; }
                }
            `}</style>
        </div>
    );
};

const handlePrint = () => window.print();

export default ShoppingListPage;
