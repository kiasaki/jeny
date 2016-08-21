import {assocPath} from 'ramda';

import {RESET, REQUEST, SUCCESS, FAILURE} from '@jeny/constants/api';

const initialApiState = {
    applications: {
        list: null,
        get: {}
    },
    environments: {
        list: {},
        get: {}
    },
    deployments: {
        list: {},
        get: {},
        log: {}
    },
    servers: {
        list: null
    }
};

export default function apiReducer(state = initialApiState, action) {
    const path = [action.resource, action.verb];

    // append the id to the path (consider "" as an id even if it's falsy)
    if (action.id || action.id === '') {
        path.push(action.id);
    }

    switch (action.type) {
        case RESET:
            return assocPath(path, null, state);
        case REQUEST:
            return assocPath(path, {
                status: REQUEST
            }, state);
        case SUCCESS:
            return assocPath(path, {
                status: SUCCESS,
                content: action.content
            }, state);
        case FAILURE:
            return assocPath(path, {
                status: FAILURE,
                error: action.error
            }, state);
        default:
            return state;
    }
}
