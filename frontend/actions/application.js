import {map, toPairs, fromPairs, assoc} from 'ramda';

import {applicationsList} from './api';

export const PUT = 'APPLICATION_PUT';

export function put(id, application) {
    return {type: PUT, id, application};
}

export function fetchAll() {
    return dispatch => {
        return dispatch(applicationsList()).then(applicationsResponse => {
            applicationsResponse.results.forEach(application => {
                // assign an id to environments
                application.environments = fromPairs(map(([id, environment]) => {
                    return [id, assoc('id', id, environment)];
                }, toPairs(application.environments)));

                dispatch(put(application.id, application))
            });
        });
    };
}
