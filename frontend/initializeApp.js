import cookie from 'cookie';

import API from '@jeny/utils/api';
import {setCurrentUser} from '@jeny/actions/authentication';
import {setLocation} from '@jeny/actions/routing';

export default function initializeApp(store) {
    store.dispatch(setLocation(window.location.pathname));

    const token = cookie.parse(window.document.cookie).jenyToken;
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    store.dispatch(setCurrentUser({
        name: tokenPayload.name,
        email: tokenPayload.email
    }));

    API.config({
        baseUrl: window.BASE_URL
    });
}
