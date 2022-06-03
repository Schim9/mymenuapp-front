import {ADD_INGREDIENT, IMPORT_DATA, INIT_INGREDIENT, REMOVE_INGREDIENT, UPDATE_INGREDIENT} from "../actions/actions";
import {InitialState, initialStateImpl} from "./index";

import {setIngredients} from "../services/storageService";

export function ingredientsReducer(state: InitialState = initialStateImpl, action: any): InitialState {
    switch(action.type) {
        case INIT_INGREDIENT:
            return Object.assign({}, state, {ingredientList: action.data});
        case IMPORT_DATA:
            setIngredients(action.data.ingredients);
            return Object.assign({}, state, {ingredientList: action.data.ingredients });
        case ADD_INGREDIENT:
            state.ingredientList.push(action.data)
            setIngredients(state.ingredientList);
            return state;
        case UPDATE_INGREDIENT:
            let foundElement = state.ingredientList.findIndex(element => element.id === action.data.id);
            let newList = Object.assign([], state.ingredientList, {[foundElement]: action.data});
            setIngredients(newList);
            return Object.assign({}, state, {ingredientList: newList});
        case REMOVE_INGREDIENT:
            let elementToRemove = state.ingredientList.findIndex(element => element.id === action.data.id);
            state.ingredientList.splice(elementToRemove, 1);
            setIngredients(state.ingredientList);
            return state;
        default:
            return state;
    }

}
