import React, { useState, useMemo } from 'react';
import { ShoppingCart, Calendar, Printer } from 'lucide-react';

const ShoppingListPage = ({ menus, dishes, ingredients }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [checkedItems, setCheckedItems] = useState({});

    // Calculer la liste de courses
    const shoppingList = useMemo(() => {
        if (!startDate || !endDate) return [];

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Filtrer les menus dans la période
        const periodMenus = menus.filter(menu => {
            const menuDate = new Date(menu.date);
            return menuDate >= start && menuDate <= end;
        });

        // Map pour compter les occurrences
        const ingredientCount = new Map();

        periodMenus.forEach(menu => {
            // Traiter midi et soir
            [...(menu.midiItems || []), ...(menu.soirItems || [])].forEach(item => {
                if (item.type === 'ingredient') {
                    // Ingrédient direct
                    const current = ingredientCount.get(item.name) || 0;
                    ingredientCount.set(item.name, current + 1);
                } else if (item.type === 'dish') {
                    // Plat : récupérer ses ingrédients
                    const dish = dishes.find(d => d.id === item.id);
                    if (dish && dish.ingredients) {
                        dish.ingredients.forEach(ingId => {
                            const ingredient = ingredients.find(ing => ing.id === ingId);
                            if (ingredient) {
                                const current = ingredientCount.get(ingredient.name) || 0;
                                ingredientCount.set(ingredient.name, current + 1);
                            }
                        });
                    }
                }
            });
        });

        // Convertir en tableau trié
        return Array.from(ingredientCount.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [startDate, endDate, menus, dishes, ingredients]);

    const toggleCheck = (itemName) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemName]: !prev[itemName]
        }));
    };

    const handlePrint = () => {
        window.print();
    };

    const resetChecks = () => {
        setCheckedItems({});
    };

    const checkedCount = Object.values(checkedItems).filter(Boolean).length;

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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Du
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700 text-base"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Au
                        </label>
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
                                <div className="text-gray-700">
                                    <span className="font-semibold">{shoppingList.length}</span> ingrédient{shoppingList.length > 1 ? 's' : ''}
                                    {checkedCount > 0 && (
                                        <span className="ml-2 text-green-600">
                                            ({checkedCount} coché{checkedCount > 1 ? 's' : ''})
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={resetChecks}
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
                                </div>
                            </div>

                            {/* Liste */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden print:shadow-none">
                                <div className="divide-y divide-gray-200">
                                    {shoppingList.map(item => (
                                        <label
                                            key={item.name}
                                            className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                checkedItems[item.name] ? 'bg-green-50' : ''
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checkedItems[item.name] || false}
                                                onChange={() => toggleCheck(item.name)}
                                                className="w-5 h-5 text-cyan-800 rounded focus:ring-cyan-700 flex-shrink-0"
                                            />
                                            <div className="flex-1 flex items-center justify-between">
                                                <span className={`text-base sm:text-lg ${
                                                    checkedItems[item.name] ? 'line-through text-gray-400' : 'text-gray-800'
                                                }`}>
                                                    {item.name}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    checkedItems[item.name]
                                                        ? 'bg-gray-200 text-gray-400'
                                                        : 'text-white'
                                                }`}
                                                      style={!checkedItems[item.name] ? { backgroundColor: 'var(--custom-blue)' } : {}}
                                                >
                                                    x{item.count}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
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

            {/* Style pour l'impression */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:shadow-none,
                    .print\\:shadow-none * {
                        visibility: visible;
                    }
                    .print\\:shadow-none {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    button, nav {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ShoppingListPage;