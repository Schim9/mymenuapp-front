export const ADD_DISH = 'ADD_DISH';
export const UPDATE_DISH = 'UPDATE_DISH';
export const DELETE_DISH = 'DELETE_DISH';

export const addDish = (name, ingredients) => ({
    type: ADD_DISH,
    payload: { name, ingredients }
});

export const updateDish = (id, name, ingredients) => ({
    type: UPDATE_DISH,
    payload: { id, name, ingredients }
});

export const deleteDish = (id) => ({
    type: DELETE_DISH,
    payload: id
});