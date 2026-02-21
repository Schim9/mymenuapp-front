// Configuration de l'API
const getApiBaseUrl = () => {
    const stored = localStorage.getItem('settings_api_url') + '/api';
    return (stored && stored.trim()) || process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

// Récupère le code utilisateur depuis les paramètres
const getUserCode = () => {
    const code = localStorage.getItem('settings_code');
    return (code && code.trim()) || '';
};

// Headers incluant le code utilisateur pour les requêtes menus
const userCodeHeaders = () => {
    const code = getUserCode();
    return code ? { 'X-User-Code': code } : {};
};

// Fonction utilitaire pour les requêtes
const fetchAPI = async (endpoint, options = {}) => {
    const code = getUserCode();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(code ? { 'X-User-Code': code } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
};

// ============= INGREDIENTS =============

export const ingredientsAPI = {
    getAll: async () => {
        return await fetchAPI('/ingredients');
    },

    create: async (name, isDish = false) => {
        return await fetchAPI('/ingredients', {
            method: 'POST',
            body: JSON.stringify({ id: null, name, sectionId: 0, unit: 'PIECE', isDish }),
        });
    },

    update: async (id, name, isDish = false) => {
        return await fetchAPI(`/ingredients/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ id, name, sectionId: 0, unit: 'PIECE', isDish }),
        });
    },

    delete: async (id) => {
        return await fetchAPI(`/ingredients/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============= DISHES (PLATS) =============

export const dishesAPI = {
    getAll: async () => {
        return await fetchAPI('/dishes');
    },

    create: async (name, ingredients) => {
        return await fetchAPI('/dishes', {
            method: 'POST',
            body: JSON.stringify({ id: null, name, ingredients }),
        });
    },

    update: async (id, name, ingredients) => {
        return await fetchAPI(`/dishes/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ id, name, ingredients }),
        });
    },

    delete: async (id) => {
        return await fetchAPI(`/dishes/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============= MENUS =============

// Mapping backend -> frontend pour un MenuItem
const mapMenuItemToFrontend = (item) => {
    // Un Dish a un champ "ingredients", un Ingredient non
    const type = item.ingredients !== undefined ? 'dish' : 'ingredient';
    return { id: item.id, name: item.name, type };
};

// Mapping backend -> frontend pour un Menu
const mapMenuToFrontend = (menu) => ({
    date: menu.date,
    midiItems: (menu.lunchMeals || []).map(mapMenuItemToFrontend),
    soirItems: (menu.dinnerMeals || []).map(mapMenuItemToFrontend),
});

// Mapping frontend -> backend pour les items d'un repas
const mapItemsToBackend = (items, allDishes, allIngredients) => {
    return items.map(item => {
        if (item.type === 'dish') {
            const dish = allDishes.find(d => d.id === item.id);
            return dish ? { id: dish.id, name: dish.name, ingredients: dish.ingredients } : null;
        } else {
            const ing = allIngredients.find(i => i.id === item.id);
            return ing ? { id: ing.id, name: ing.name, sectionId: ing.sectionId || 0, unit: ing.unit || 'PIECE' } : null;
        }
    }).filter(Boolean);
};

// Mapping frontend -> backend pour un Menu
const mapMenuToBackend = (date, midiItems, soirItems, allDishes, allIngredients) => ({
    name: `Menu ${date}`,
    date,
    lunchMeals: mapItemsToBackend(midiItems, allDishes, allIngredients),
    dinnerMeals: mapItemsToBackend(soirItems, allDishes, allIngredients),
});

export const menusAPI = {
    getAll: async () => {
        const menus = await fetchAPI('/menus', {
            headers: userCodeHeaders(),
        });
        return menus.map(mapMenuToFrontend);
    },

    create: async (date, midiItems, soirItems, allDishes, allIngredients) => {
        const body = mapMenuToBackend(date, midiItems, soirItems, allDishes, allIngredients);
        return await fetchAPI('/menus', {
            method: 'PUT',
            headers: userCodeHeaders(),
            body: JSON.stringify(body),
        });
    },

    update: async (date, midiItems, soirItems, allDishes, allIngredients) => {
        const body = mapMenuToBackend(date, midiItems, soirItems, allDishes, allIngredients);
        return await fetchAPI('/menus', {
            method: 'PUT',
            headers: userCodeHeaders(),
            body: JSON.stringify(body),
        });
    },

    delete: async (date, midiItems, soirItems, allDishes, allIngredients) => {
        const body = mapMenuToBackend(date, midiItems, soirItems, allDishes, allIngredients);
        return await fetchAPI('/menus', {
            method: 'DELETE',
            headers: userCodeHeaders(),
            body: JSON.stringify(body),
        });
    },
};
