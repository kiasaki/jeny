import {SET_CURRENT_USER} from '@jeny/actions/authentication';

export default function authenticationReducer(state = {currentUser: null}, action) {
    if (action.type === SET_CURRENT_USER) {
        return {currentUser: action.currentUser};
    }
    return state;
}
