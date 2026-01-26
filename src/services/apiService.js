// Configuration de l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Fonction utilitaire pour les requêtes
const fetchAPI = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erreur API (${endpoint}):`, error);
        throw error;
    }
};

// ============= INGREDIENTS =============

export const ingredientsAPI = {
    // Récupérer tous les ingrédients
    getAll: async () => {
        return await fetchAPI('/ingredients');
    },

    // Créer un ingrédient
    create: async (name) => {
        return await fetchAPI('/ingredients', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    // Modifier un ingrédient
    update: async (id, name) => {
        return await fetchAPI(`/ingredients/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
        });
    },

    // Supprimer un ingrédient
    delete: async (id) => {
        return await fetchAPI(`/ingredients/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============= DISHES (PLATS) =============

export const dishesAPI = {
    // Récupérer tous les plats
    getAll: async () => {
        return await fetchAPI('/dishes');
    },

    // Créer un plat
    create: async (name, ingredients) => {
        return await fetchAPI('/dishes', {
            method: 'POST',
            body: JSON.stringify({ name, ingredients }),
        });
    },

    // Modifier un plat
    update: async (id, name, ingredients) => {
        return await fetchAPI(`/dishes/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, ingredients }),
        });
    },

    // Supprimer un plat
    delete: async (id) => {
        return await fetchAPI(`/dishes/${id}`, {
            method: 'DELETE',
        });
    },
};