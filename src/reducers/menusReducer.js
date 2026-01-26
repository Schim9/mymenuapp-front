import { ADD_MENU, UPDATE_MENU, DELETE_MENU } from '../actions/menuActions';

export const menusReducer = (state = [], action) => {
    switch (action.type) {
        case ADD_MENU:
            return [...state, {
                id: Date.now(),
                date: action.payload.date,
                midiItems: action.payload.midiItems, // [{id, name, type}]
                soirItems: action.payload.soirItems  // [{id, name, type}]
            }];
        case UPDATE_MENU:
            return state.map(menu =>
                menu.id === action.payload.id
                    ? {
                        ...menu,
                        date: action.payload.date,
                        midiItems: action.payload.midiItems,
                        soirItems: action.payload.soirItems
                    }
                    : menu
            );
        case DELETE_MENU:
            return state.filter(menu => menu.id !== action.payload);
        default:
            return state;
    }
};