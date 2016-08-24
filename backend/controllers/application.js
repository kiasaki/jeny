const Application = require('../entities/application');

class ApplicationController {
    constructor(storage) {
        this.storage = storage;

        this.list = this.list.bind(this);
    }

    list(req, res) {
        const folder = 'applications';

        return this.storage.list(folder).then(files => {
            return Promise.all(files.map(application => {
                const file = `applications/${application}`;
                return this.storage.get(file).then(text => (
                    new Application({id: application.slice(0, -4)}).loadYaml(text)
                ));
            }));
        }).then(items => {
            res.json({results: items.map(i => i.toJson())});
        });
    }
}

ApplicationController.dependencies = [
    'storage'
];

module.exports = ApplicationController;
