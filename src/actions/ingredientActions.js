export const SET_INGREDIENTS = 'SET_INGREDIENTS';
export const ADD_INGREDIENT = 'ADD_INGREDIENT';
export const UPDATE_INGREDIENT = 'UPDATE_INGREDIENT';
export const DELETE_INGREDIENT = 'DELETE_INGREDIENT';

export const setIngredients = (ingredients) => ({
    type: SET_INGREDIENTS,
    payload: ingredients
});

export const addIngredient = (ingredient) => ({
    type: ADD_INGREDIENT,
    payload: ingredient
});

export const updateIngredient = (id, name, isDish) => ({
    type: UPDATE_INGREDIENT,
    payload: { id, name, isDish }
});

export const deleteIngredient = (id) => ({
    type: DELETE_INGREDIENT,
    payload: id
});
