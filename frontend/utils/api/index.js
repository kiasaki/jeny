import URL from 'url';
import {merge} from 'ramda';

import ApplicationsAPI from './applications';
import ServersAPI from './servers';

const API_VERSION = 'v1';

class APIClient {
    constructor() {
        this._config = {
            baseUrl: ''
        };

        this.applications = new ApplicationsAPI(this);
        this.servers = new ServersAPI(this);
    }

    config(config) {
        this._config = merge(this._config, config);
        return this;
    }

    apiUrl(path, query) {
        return URL.format({
            pathname: this._config.baseUrl + '/' + API_VERSION + path,
            query: query
        });
    }

    _request(method, url, body, updateOptions) {
        var options = {
            method: method,
            credentials: 'include'
        };

        if (body) {
            options.body = body;
        }

        var headers = new Headers();
        options.headers = headers;
        headers.set('Accept', 'application/json');

        // if we are sending a json payload
        // TODO quite britle checking
        if (method !== 'GET' && body && body[0] === '{') {
            headers.set('Content-Type', 'application/json');
        }

        if (typeof updateOptions === 'function') {
            options = updateOptions(options);
        }

        return fetch(url, options).then(function(response) {
            return response.text().then(function(text) {
                return {text: text, response: response};
            });
        }).then(function(data) {
            var text = data.text;
            var response = data.response;

            // No content is a valid API response for some POST/PATCH/202
            if (text === '') {
                return {response: response, json: {}};
            }

            try {
                return {response: response, json: JSON.parse(text)};
            } catch (e) {
                // Text answer
                return {response: response, json: text};
            }
        }).then(function(data) {
            var json = data.json;
            var response = data.response;

            if (!response.ok) {
                return Promise.reject(json.errors);
            }

            return json;
        });
    }

    request(method, path, query, body) {
        var encodedBody;
        if (body) {
            encodedBody = JSON.stringify(body);
        }

        return this._request(method, this.apiUrl(path, query), encodedBody);
    }
}

module.exports = new APIClient();
