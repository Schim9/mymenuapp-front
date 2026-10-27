import React from 'react';
import { Sun, Moon } from 'lucide-react';

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const MealSection = ({ icon: Icon, label, items }) => (
    <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
            <Icon size={16} className="text-orange-500" />
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
        </div>
        {items && items.length > 0 ? (
            <ul className="space-y-1">
                {items.map((item, idx) => (
                    <li key={idx} className="text-gray-800 text-sm bg-white rounded px-3 py-1 shadow-sm">
                        {item.name}
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-gray-400 text-sm italic">Aucun plat</p>
        )}
    </div>
);

const HomePage = ({ menus = [] }) => {
    const todayMenu = menus.find(m => m.date === todayStr);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center py-8 sm:py-16">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
                    Menu App
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-12 px-4">
                    Créez vos ingrédients, composez vos plats préférés, planifiez vos menus de la semaine
                    et obtenez automatiquement votre liste de courses. Simple et efficace !
                </p>
            </div>

            {/* Widget menu du jour */}
            <div className="max-w-lg mx-auto px-4 pb-12">
                <div className="bg-orange-50 border border-orange-200 rounded-2xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-orange-700 mb-4 text-center">
                        Menu du jour
                    </h2>
                    {todayMenu ? (
                        <div className="flex gap-6">
                            <MealSection icon={Sun} label="Midi" items={todayMenu.midiItems} />
                            <div className="w-px bg-orange-200" />
                            <MealSection icon={Moon} label="Soir" items={todayMenu.soirItems} />
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 italic text-sm">
                            Aucun menu planifié pour aujourd'hui
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
