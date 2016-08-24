import {assoc} from 'ramda';

import {PUT} from '../actions/application';

export default function applicationReducer(state = {}, action) {
    if (action.type === PUT) {
        return assoc(action.id, action.application, state);
    }
    return state;
}
