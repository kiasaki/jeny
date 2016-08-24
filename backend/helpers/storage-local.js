const fs = require('fs');
const path = require('path');
const debug = require('debug')('jeny:storage:local');

const promisify = require('./promisify');

class StorageLocal {
    constructor(config) {
        this.basePath = path.resolve(
            config.get('root'),
            config.get('storage_local_base_path', './data')
        );
        debug('configured base path is "' + this.basePath + '"');

        this.ensureFolder('.');
        this.ensureFolder('applications');
        this.ensureFolder('deployments');
        this.ensureFolder('tasks');
    }

    ensureFolder(folder) {
        const folderPath = path.resolve(this.basePath, folder);
        try {
            fs.statSync(folderPath);
        } catch (e) {
            debug('creating missing folder: ' + folderPath);
            fs.mkdirSync(folderPath);
        }
    }

    list(folder) {
        const folderPath = path.resolve(this.basePath, folder);
        return promisify(fs.readdir)(folderPath);
    }

    get(file) {
        const filePath = path.resolve(this.basePath, file);
        return promisify(fs.readFile)(filePath, {encoding: 'utf-8'});
    }
}

module.exports = StorageLocal;
