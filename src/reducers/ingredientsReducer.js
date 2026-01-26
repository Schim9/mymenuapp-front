import { ADD_INGREDIENT, UPDATE_INGREDIENT, DELETE_INGREDIENT } from '../actions/ingredientActions';

export const ingredientsReducer = (state = [], action) => {
    switch (action.type) {
        case ADD_INGREDIENT:
            return [...state, { id: Date.now(), name: action.payload }];
        case UPDATE_INGREDIENT:
            return state.map(ing =>
                ing.id === action.payload.id ? { ...ing, name: action.payload.name } : ing
            );
        case DELETE_INGREDIENT:
            return state.filter(ing => ing.id !== action.payload);
        default:
            return state;
    }
};