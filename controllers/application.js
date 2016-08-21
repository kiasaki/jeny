const Application = require('../entities/application');

class ApplicationController {
    constructor(storage) {
        this.storage = storage;

        this.list = this.list.bind(this);
        this.get = this.get.bind(this);
    }

    list(req, res) {
        const folder = 'applications';

        return this.storage.list(folder).then(files => {
            return Promise.all(files.map(application => {
                const file = `applications/${application}/meta.yml`;
                return this.storage.get(file).then(text => (
                    new Application({id: application}).loadYaml(text)
                ));
            }));
        }).then(items => {
            res.json({results: items.map(i => i.toJson())});
        }).catch(err => {
            res.status(500).json({errors: [{message: err.message}]});
        });
    }

    get(req, res) {
        const application = new Application({
            id: req.params.id
        });
        const file = `applications/${application.id}/meta.yml`;

        return this.storage.get(file).then(text => {
            application.loadYaml(text);
            res.json(application.toJson());
        }).catch(err => {
            res.status(500).json({errors: [{message: err.message}]});
        });
    }
}

ApplicationController.dependencies = [
    'storage'
];

module.exports = ApplicationController;
