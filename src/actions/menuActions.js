export const ADD_MENU = 'ADD_MENU';
export const UPDATE_MENU = 'UPDATE_MENU';
export const DELETE_MENU = 'DELETE_MENU';

export const addMenu = (date, midiItems, soirItems) => ({
    type: ADD_MENU,
    payload: { date, midiItems, soirItems }
});

export const updateMenu = (id, date, midiItems, soirItems) => ({
    type: UPDATE_MENU,
    payload: { id, date, midiItems, soirItems }
});

export const deleteMenu = (id) => ({
    type: DELETE_MENU,
    payload: id
});