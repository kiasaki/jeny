import {assoc} from 'ramda';

import {SET_TITLE, SET_BUTTONS} from '@jeny/actions/view';

export default function viewReducer(state = {title: '', buttons: []}, action) {
    switch (action.type) {
        case SET_TITLE:
            return assoc('title', action.title, state);
        case SET_BUTTONS:
            return assoc('buttons', action.buttons, state);
        default:
            return state;
    }
}
