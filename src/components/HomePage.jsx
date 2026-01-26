import React from 'react';

const HomePage = () => {
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
        </div>
    );
};

export default HomePage;