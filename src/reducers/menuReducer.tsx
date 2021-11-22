import {ADD_MENU, IMPORT_DATA, INIT_MENU, REMOVE_MENU, UPDATE_MENU} from "../actions/actions";
import {InitialState, initialStateImpl} from "./index";
import DICTIONARY, {setMenus} from '../services/storageService';
import {FRIDAY, Menu, MONDAY, SATURDAY, SUNDAY, THURSDAY, TUESDAY, WEDNESDAY} from "../Models/Menu";


export function menuReducer(state: InitialState = initialStateImpl, action: any): InitialState {
    switch (action.type) {
        case INIT_MENU:
            return Object.assign({}, state, {menuList: action.data});
        case IMPORT_DATA:
            if (action.data.menus.length === 0) {
                let defaultValues = [
                    new Menu(DICTIONARY.db.MONDAY, 1, MONDAY),
                    new Menu(DICTIONARY.db.TUESDAY, 2, TUESDAY),
                    new Menu(DICTIONARY.db.WEDNESDAY, 3, WEDNESDAY),
                    new Menu(DICTIONARY.db.THURSDAY, 4, THURSDAY),
                    new Menu(DICTIONARY.db.FRIDAY, 5, FRIDAY),
                    new Menu(DICTIONARY.db.SATURDAY, 6, SATURDAY),
                    new Menu(DICTIONARY.db.SUNDAY, 7, SUNDAY)
                ];
                setMenus(defaultValues);
                return Object.assign({}, state, {menuList: defaultValues});
            } else {
                setMenus(action.data.menus);
                return Object.assign({}, state, {menuList: action.data.menus });
            }
        case UPDATE_MENU:
            let foundElement = state.menuList.findIndex(element => element.id === action.data.id);
            let newList = Object.assign([], state.menuList, {[foundElement]: action.data});
            setMenus(newList);
            return Object.assign({}, state, {menuList: newList });
        case ADD_MENU:
            return state;
        case REMOVE_MENU:
            return state;
        default:
            return state;
    }
}

