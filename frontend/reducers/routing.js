import {SET_LOCATION} from '@jeny/actions/routing';

export default function routingReducer(state = {location: '/'}, action) {
    if (action.type === SET_LOCATION) {
        return {location: action.location};
    }
    return state;
}
