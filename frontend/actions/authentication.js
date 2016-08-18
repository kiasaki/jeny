export const SET_CURRENT_USER = 'AUTHENTICATION_SET_CURRENT_USER';

export function setCurrentUser(currentUser) {
    return {type: SET_CURRENT_USER, currentUser};
};
