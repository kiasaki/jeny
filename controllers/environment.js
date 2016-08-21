const Environment = require('../entities/environment');

class EnvironmentController {
    constructor(storage) {
        this.storage = storage;

        this.list = this.list.bind(this);
    }

    list(req, res) {
        const applicationId = req.params.id;
        const folder = `applications/${applicationId}/environments`;

        return this.storage.list(folder).then(files => {
            return Promise.all(files.map(environment => {
                const file = `${folder}/${environment}/meta.yml`;
                return this.storage.get(file).then(text => (
                    new Environment({
                        id: environment,
                        applicationId: applicationId
                    }).loadYaml(text)
                ));
            }));
        }).then(items => {
            res.json({results: items.map(i => i.toJson())});
        }).catch(err => {
            res.status(500).json({errors: [{message: err.message}]});
        });
    }
}

EnvironmentController.dependencies = [
    'storage'
];

module.exports = EnvironmentController;
