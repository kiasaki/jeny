import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {merge} from 'ramda';

import apiReducer from '@jeny/reducers/api';
import viewReducer from '@jeny/reducers/view';
import authenticationReducer from '@jeny/reducers/authentication';
import routingReducer from '@jeny/reducers/routing';

const rootReducer = combineReducers({
    api: apiReducer,
    view: viewReducer,
    authentication: authenticationReducer,
    routing: routingReducer
});

let logger = () => next => action => next(action);
if (process.env.NODE_ENV !== 'production') {
    logger = store => next => action => {
        console.group(action.type);
        console.info('%c dispatching', 'color: #4CAF50; font-weight: bold', action);
        const result = next(action);
        console.info('%c new state', 'color: #2196F3; font-weight: bold', store.getState());
        console.groupEnd(action.type);
        return result;
    };
}

export default function(initialState = {}, extraEnchancers = []) {
    const enhancer = applyMiddleware.apply(null, [thunk, logger]
        .concat(extraEnchancers));
    return createStore(rootReducer, initialState, enhancer);
}
