import { SET_INGREDIENTS, ADD_INGREDIENT, UPDATE_INGREDIENT, DELETE_INGREDIENT } from '../actions/ingredientActions';

export const ingredientsReducer = (state = [], action) => {
    switch (action.type) {
        case SET_INGREDIENTS:
            return action.payload;
        case ADD_INGREDIENT:
            return [...state, action.payload];
        case UPDATE_INGREDIENT:
            return state.map(ing =>
                ing.id === action.payload.id ? { ...ing, name: action.payload.name, isDish: action.payload.isDish } : ing
            );
        case DELETE_INGREDIENT:
            return state.filter(ing => ing.id !== action.payload);
        default:
            return state;
    }
};
