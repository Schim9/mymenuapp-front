import { SET_MENUS, ADD_MENU, UPDATE_MENU, DELETE_MENU } from '../actions/menuActions';

export const menusReducer = (state = [], action) => {
    switch (action.type) {
        case SET_MENUS:
            return action.payload;
        case ADD_MENU:
            return [...state, {
                date: action.payload.date,
                midiItems: action.payload.midiItems,
                soirItems: action.payload.soirItems
            }];
        case UPDATE_MENU:
            return state.map(menu =>
                menu.date === action.payload.date
                    ? {
                        ...menu,
                        midiItems: action.payload.midiItems,
                        soirItems: action.payload.soirItems
                    }
                    : menu
            );
        case DELETE_MENU:
            return state.filter(menu => menu.date !== action.payload);
        default:
            return state;
    }
};
