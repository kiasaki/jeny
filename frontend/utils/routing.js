import URL from 'url';

import {setLocation} from '@jeny/actions/routing';

export function navigate(path) {
    window.history.pushState(null, '', path);

    const pathname = URL.parse(path).pathname;
    window.__webapp_store.dispatch(setLocation(pathname));
}
