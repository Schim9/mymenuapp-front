import {Ingredient} from "../Models/Ingredient";
import {Dish} from "../Models/Dish";
import {FRIDAY, Menu, MONDAY, SATURDAY, SUNDAY, THURSDAY, TUESDAY, WEDNESDAY} from "../Models/Menu";
import {Section} from "../Models/Section";
import DICTIONARY from "../services/storageService";

// Deprecated
export const IMPORT_DATA = 'IMPORT_DATA';

export const INIT_INGREDIENT = 'INIT_INGREDIENT';
export const INIT_DISH = 'INIT_DISH';
export const INIT_MENU = 'INIT_MENU';
export const INIT_SECTION = 'INIT_SECTION';
export const INIT_CLOUD_CONFIG = 'INIT_CLOUD_CONFIG';
export const UPDATE_CLOUD_CONFIG = 'UPDATE_CLOUD_CONFIG';

export const ADD_DISH = 'ADD_DISH';
export const UPDATE_DISH = 'UPDATE_DISH';
export const REMOVE_DISH = 'REMOVE_DISH';

export const ADD_INGREDIENT = 'ADD_INGREDIENT';
export const UPDATE_INGREDIENT = 'UPDATE_INGREDIENT';
export const REMOVE_INGREDIENT = 'REMOVE_INGREDIENT';

export const ADD_MENU = 'ADD_MENU';
export const UPDATE_MENU = 'UPDATE_MENU';
export const REMOVE_MENU = 'REMOVE_MENU';

export const UPDATE_SECTIONS = 'UPDATE_SECTIONS';

export const DISPLAY_TOAST = 'DISPLAY_TOAST';
export const HIDE_TOAST = 'HIDE_TOAST';



/**
 * APP INIT
 */
export function prepareIngredientList(element: Ingredient[]) {
    if (element === null) {
        element = []
    }

    const action = {
        type: INIT_INGREDIENT,
        data: element
    }

    return action;
}

export function prepareDishList(element: Dish[]) {
    if (element === null) {
        element = []
    }
    const action = {
        type: INIT_DISH,
        data: element
    }

    return action;
}

export function prepareSectionList(element: Section[]) {
    if (element === null) {
        element = []
    }
    const action = {
        type: INIT_SECTION,
        data: element
    }

    return action;
}

export function prepareMenuList(element: Menu[]) {
    if (element === null) {
        element = [
            new Menu(DICTIONARY.db.MONDAY, 1, MONDAY),
            new Menu(DICTIONARY.db.TUESDAY, 2, TUESDAY),
            new Menu(DICTIONARY.db.WEDNESDAY, 3, WEDNESDAY),
            new Menu(DICTIONARY.db.THURSDAY, 4, THURSDAY),
            new Menu(DICTIONARY.db.FRIDAY, 5, FRIDAY),
            new Menu(DICTIONARY.db.SATURDAY, 6, SATURDAY),
            new Menu(DICTIONARY.db.SUNDAY, 7, SUNDAY)
        ];
    }

    const action = {
        type: INIT_MENU,
        data: element
    }

    return action;
}

export function prepareCloudConfiguration(serveurAddress: string, identifier: string) {
    const action = {
        type: INIT_CLOUD_CONFIG,
        data: {
            cloudServerAddress: serveurAddress,
            cloudIdentifier: identifier}
    }
    return action;
}

export function importData(menus: Menu[], dishes: Dish[], ingredients: Ingredient[], sections: Section[]) {
    const action = {
        type: IMPORT_DATA,
        data: {menus, dishes, ingredients, sections}
    }

    return action;
}



/**
 * DISHES
 */
export function addDish(element: Dish) {
    const action = {
        type: ADD_DISH,
        data: element
    }

    return action;
}

export function removeDish(element: Dish) {
    const action = {
        type: REMOVE_DISH,
        data: element
    }
    return action;
}

export function updateDish(element: Dish) {
    const action = {
        type: UPDATE_DISH,
        data: element
    }

    return action;
}

/**
 * INGREDIENTS
 */
export function addIngredient(element: Ingredient) {
    const action = {
        type: ADD_INGREDIENT,
        data: element
    }

    return action;
}

export function removeIngredient(element: Ingredient) {
    const action = {
        type: REMOVE_INGREDIENT,
        data: element
    }
    return action;
}

export function updateIngredient(element: Ingredient) {
    const action = {
        type: UPDATE_INGREDIENT,
        data: element
    }
    return action;
}

/**
 * MENU
 */
export function updateMenu(element: Menu) {
    const action = {
        type: UPDATE_MENU,
        data: element
    }
    return action;
}


/**
 * SECTION
 */
export function updateSections(element: Section[]) {
    const action = {
        type: UPDATE_SECTIONS,
        data: element
    }
    return action;
}


/**
 * TOAST
 */
export function displayToast(type: string, message: string) {
    const action = {
        type: DISPLAY_TOAST,
        data: {message, type}
    }
    return action;
}

export function hideToast() {
    const action = {
        type: HIDE_TOAST,
        data: {}
    }
    return action;
}

/**
 * CLOUD CONFIG
 */
export function updateCloudConfiguration(serveurAddress: string, identifier: string) {
    const action = {
        type: UPDATE_CLOUD_CONFIG,
        data: {
            cloudServerAddress: serveurAddress,
            cloudIdentifier: identifier}
    }
    return action;
}