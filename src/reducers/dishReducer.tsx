import {ADD_DISH, IMPORT_DATA, INIT_DISH, REMOVE_DISH, UPDATE_DISH} from "../actions/actions";
import {InitialState, initialStateImpl} from "./index";
import {setDishes} from "../services/storageService";
import {callApi, HTTP_COMMAND} from "../services/callApiService";


export function dishesReducer(state: InitialState = initialStateImpl, action: any): InitialState {
    switch (action.type) {
        case INIT_DISH:
            return Object.assign({}, state, {dishList: action.data});
        case IMPORT_DATA:
            setDishes(action.data.dishes);
            return Object.assign({}, state, {dishList: action.data.dishes });
        case ADD_DISH:
            state.dishList.push(action.data)
            callApi(HTTP_COMMAND.POST, 'dishes', action.data);
            // TODO Handle exceptions
            setDishes(state.dishList);
            return state;
        case UPDATE_DISH:
            let foundElement = state.dishList.findIndex(element => element.id === action.data.id);
            callApi(HTTP_COMMAND.PUT, 'dishes', action.data);
            // TODO Handle exceptions
            let newList = Object.assign([], state.dishList, {[foundElement]: action.data});
            setDishes(newList);
            return Object.assign({}, state, {dishList: newList});
        case REMOVE_DISH:
            let elementToRemove = state.dishList.findIndex(element => element.id === action.data.id);
            callApi(HTTP_COMMAND.DELETE, 'dishes', action.data);
            // TODO Handle exceptions
            state.dishList.splice(elementToRemove, 1);
            setDishes(state.dishList);
            return state;
        default:
            return state;
    }
}

