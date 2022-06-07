import {ADD_MENU, IMPORT_DATA, INIT_MENU, REMOVE_MENU, UPDATE_MENU} from "../actions/actions";
import {InitialState, initialStateImpl} from "./index";
import {setMenus} from '../services/storageService';


export function menuReducer(state: InitialState = initialStateImpl, action: any): InitialState {
    switch (action.type) {
        case INIT_MENU:
            return Object.assign({}, state, {menuList: action.data});
        case IMPORT_DATA:
            if (action.data.menus.length === 0) {
                setMenus([]);
                return Object.assign({}, state, {menuList: []});
            } else {
                setMenus(action.data.menus);
                return Object.assign({}, state, {menuList: action.data.menus });
            }
        case UPDATE_MENU:
            let foundElement = state.menuList.findIndex(element => element.date === action.data.date);
            let newList = Object.assign([], state.menuList, {[foundElement]: action.data});
            setMenus(newList);
            return Object.assign({}, state, {menuList: newList });
        case ADD_MENU:
            // No creation
            return state;
        case REMOVE_MENU:
            return state;
        default:
            return state;
    }
}

