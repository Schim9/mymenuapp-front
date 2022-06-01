import {ADD_INGREDIENT, IMPORT_DATA, INIT_INGREDIENT, REMOVE_INGREDIENT, UPDATE_INGREDIENT} from "../actions/actions";
import {InitialState, initialStateImpl} from "./index";

import {setIngredients} from "../services/storageService";
import {callApi, HTTP_COMMAND} from "../services/callApiService";

export function ingredientsReducer(state: InitialState = initialStateImpl, action: any): InitialState {
    switch(action.type) {
        case INIT_INGREDIENT:
            return Object.assign({}, state, {ingredientList: action.data});
        case IMPORT_DATA:
            setIngredients(action.data.ingredients);
            return Object.assign({}, state, {ingredientList: action.data.ingredients });
        case ADD_INGREDIENT:
            state.ingredientList.push(action.data)
            // Call API in service
            callApi(HTTP_COMMAND.POST, 'ingredients', action.data);
            // TODO Handle exceptions
            setIngredients(state.ingredientList);
            return state;
        case UPDATE_INGREDIENT:
            let foundElement = state.ingredientList.findIndex(element => element.id === action.data.id);
            callApi(HTTP_COMMAND.PUT, 'ingredients', action.data);
            // TODO Handle exceptions
            let newList = Object.assign([], state.ingredientList, {[foundElement]: action.data});
            setIngredients(newList);
            return Object.assign({}, state, {ingredientList: newList});
        case REMOVE_INGREDIENT:
            let elementToRemove = state.ingredientList.findIndex(element => element.id === action.data.id);
            callApi(HTTP_COMMAND.DELETE, 'ingredients', action.data);
            // TODO Handle exceptions
            state.ingredientList.splice(elementToRemove, 1);
            setIngredients(state.ingredientList);
            return state;
        default:
            return state;
    }

}
