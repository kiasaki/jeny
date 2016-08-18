import 'babel-polyfill';
import 'isomorphic-fetch';

import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import Router from '@jeny/Router';
import createStore from '@jeny/createStore';
import initializeApp from '@jeny/initializeApp';
import {setLocation} from '@jeny/actions/routing';

const store = createStore();

// allows internal utils to use the store globaly for some APIs (e.g. navigate)
window.__webapp_store = store;

// listen on browser navigation events
window.addEventListener('popstate', () => {
    store.dispatch(setLocation(window.location.pathname));
});

initializeApp(store);

render((
    <Provider store={store}>
        <div style={{height: '100%'}}>
            <Router />
        </div>
    </Provider>
), document.getElementById('app'));
