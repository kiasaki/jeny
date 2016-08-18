const R = require('ramda');
const fs = require('fs');
const debug = require('debug')('jeny:config');

class Config {
    constructor() {
        this.config = {};
    }

    get(key, defaul) {
        return this.config[key] || defaul;
    }

    set(key, value) {
        this.config[key] = value;
    }

    unset(key) {
        delete this.config[key];
    }

    reset() {
        this.config = {};
    }

    load(values) {
        this.config = R.merge(this.config, values);
    }

    loadFromEnv() {
        debug('loading from env');
        R.forEach(envKey => {
            this.set(envKey.toLowerCase(), process.env[envKey]);
        }, R.keys(process.env));
    }
}

module.exports = Config;
