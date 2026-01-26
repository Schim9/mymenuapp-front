export const ADD_INGREDIENT = 'ADD_INGREDIENT';
export const UPDATE_INGREDIENT = 'UPDATE_INGREDIENT';
export const DELETE_INGREDIENT = 'DELETE_INGREDIENT';

export const addIngredient = (name) => ({
    type: ADD_INGREDIENT,
    payload: name
});

export const updateIngredient = (id, name) => ({
    type: UPDATE_INGREDIENT,
    payload: { id, name }
});

export const deleteIngredient = (id) => ({
    type: DELETE_INGREDIENT,
    payload: id
});