const fs = require('fs');
const path = require('path');
const debug = require('debug')('jeny:storage:local');

class StorageLocal {
    constructor(config) {
        this.basePath = path.resolve(
            config.get('root'),
            config.get('storage_local_base_path', './data')
        );
        debug('configured base path is "' + this.basePath + '"');

        try {
            fs.statSync(this.basePath);
        } catch (e) {
            debug('create base path directory');
            fs.mkdirSync(this.basePath);
        }
    }

    list(folder) {
    }

    get(file) {
    }
}

module.exports = StorageLocal;
