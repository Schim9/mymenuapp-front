import React, { useState } from 'react';
import { Home, Carrot, Utensils, ChefHat, ShoppingCart, Menu, X, Settings } from 'lucide-react';

const Navigation = ({ currentPage, setCurrentPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { name: 'Accueil', icon: Home, page: 'home' },
        { name: 'Ingrédients', icon: Carrot, page: 'ingredients' },
        { name: 'Plats', icon: Utensils, page: 'dishes' },
        { name: 'Menus', icon: ChefHat, page: 'menus' },
        { name: 'Liste de courses', icon: ShoppingCart, page: 'shopping' },
        { name: 'Paramètres', icon: Settings, page: 'settings' },
    ];

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-gradient-to-r from-cyan-900 to-cyan-800 text-white shadow-lg relative">
            <div className="container mx-auto px-2 sm:px-4">
                {/* Desktop - Barre horizontale */}
                <div className="hidden md:flex justify-start space-x-1">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => setCurrentPage(item.page)}
                            className={`flex items-center gap-2 px-6 py-4 transition-all ${
                                currentPage === item.page
                                    ? 'bg-white text-teal-700 font-semibold'
                                    : 'hover:bg-teal-700'
                            }`}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </div>

                {/* Mobile - Menu hamburger */}
                <div className="md:hidden">
                    <div
                        className="flex items-center justify-between py-3 cursor-pointer select-none"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <div className="flex items-center gap-2">
                            {navItems.find(item => item.page === currentPage)?.icon && (
                                React.createElement(navItems.find(item => item.page === currentPage).icon, { size: 24 })
                            )}
                            <span className="font-semibold">
                                {navItems.find(item => item.page === currentPage)?.name}
                            </span>
                        </div>
                        <div className="p-2">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </div>
                    </div>

                    {/* Menu déroulant mobile */}
                    {isMenuOpen && (
                        <div className="absolute top-full left-0 right-0 bg-cyan-900 shadow-lg z-50 border-t border-cyan-700">
                            {navItems.map(item => (
                                <button
                                    key={item.page}
                                    onClick={() => handlePageChange(item.page)}
                                    className={`w-full flex items-center gap-3 px-4 py-4 transition-colors border-b border-cyan-800 ${
                                        currentPage === item.page
                                            ? 'bg-white text-teal-700 font-semibold'
                                            : 'hover:bg-teal-700'
                                    }`}
                                >
                                    <item.icon size={22} />
                                    <span className="text-base">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </nav>
    );
};

export default Navigation;