import { SET_DISHES, ADD_DISH, UPDATE_DISH, DELETE_DISH } from '../actions/dishActions';

export const dishesReducer = (state = [], action) => {
    switch (action.type) {
        case SET_DISHES:
            return action.payload;
        case ADD_DISH:
            return [...state, action.payload];
        case UPDATE_DISH:
            return state.map(dish =>
                dish.id === action.payload.id
                    ? { ...dish, name: action.payload.name, ingredients: action.payload.ingredients }
                    : dish
            );
        case DELETE_DISH:
            return state.filter(dish => dish.id !== action.payload);
        default:
            return state;
    }
};
