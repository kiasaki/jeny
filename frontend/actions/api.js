import {keys} from 'ramda';

import API from '@jeny/utils/api';
import APIBaseClass from '@jeny/utils/api/api';
import {
    RESET,
    REQUEST,
    SUCCESS,
    FAILURE
} from '@jeny/constants/api';

keys(API).forEach(resource => {
    if (!(API[resource] instanceof APIBaseClass)) {
        return;
    }

    const subAPIVerbs = Object.getOwnPropertyNames(API[resource].constructor.prototype);
    subAPIVerbs.forEach(verb => {
        if (verb === 'constructor') {
            return;
        }

        const baseResourceName = resource.toLowerCase() + capitalizeFirstLetter(verb);
        exports[baseResourceName] = function() {
            const args = Array.prototype.slice.call(arguments);
            let id = args[0];
            if (typeof args[0] === 'object') {
                id = args[0].id || args[0].fid || args[0].username;
            }

            return function(dispatch) {
                dispatch({
                    type: REQUEST, resource: resource.toLowerCase(), verb, id
                });

                const apiPromise = API[resource][verb].apply(API[resource], args);
                return apiPromise.then(content => {
                    dispatch({
                        type: SUCCESS, resource: resource.toLowerCase(), verb, id, content
                    });

                    return content;
                }).catch(error => {
                    dispatch({
                        type: FAILURE, resource: resource.toLowerCase(), verb, id, error
                    });

                    throw error;
                });
            };
        };

        exports[`${baseResourceName}Reset`] = function(id) {
            return function(dispatch) {
                dispatch({
                    type: RESET, resource: resource.toLowerCase(), verb, id
                });
            };
        };
    });
});

function capitalizeFirstLetter(text) {
    return text[0].toUpperCase() + text.slice(1, text.length);
}
