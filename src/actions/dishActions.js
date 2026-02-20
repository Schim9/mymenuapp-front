export const SET_DISHES = 'SET_DISHES';
export const ADD_DISH = 'ADD_DISH';
export const UPDATE_DISH = 'UPDATE_DISH';
export const DELETE_DISH = 'DELETE_DISH';

export const setDishes = (dishes) => ({
    type: SET_DISHES,
    payload: dishes
});

export const addDish = (dish) => ({
    type: ADD_DISH,
    payload: dish
});

export const updateDish = (id, name, ingredients) => ({
    type: UPDATE_DISH,
    payload: { id, name, ingredients }
});

export const deleteDish = (id) => ({
    type: DELETE_DISH,
    payload: id
});
