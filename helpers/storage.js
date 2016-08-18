const StorageLocal = require('./storage-local');
const StorageS3 = require('./storage-s3');

class Storage {
    constructor(config) {
        switch (config.get('storage')) {
            case 'local':
                this.storageImplementation = new StorageLocal(config);
                break;
            case 's3':
                this.storageImplementation = new StorageS3(config);
                break;
            default:
                throw new Error('Unknown storage implementation: ' + config.get('storage'));
        }
    }

    list(folder) {
        return this.storageImplementation.list(folder);
    }

    get(file) {
        return this.storageImplementation.list(file);
    }
}

Storage.dependencyName = 'storage';
Storage.dependencies = ['config'];

module.exports = Storage;
