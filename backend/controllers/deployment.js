const R = require('ramda');
const moment = require('moment');

const Deployment = require('../entities/deployment');

class DeploymentController {
    constructor(storage) {
        this.storage = storage;

        this.list = this.list.bind(this);
        this.get = this.get.bind(this);
        this.getLog = this.getLog.bind(this);
    }

    gatherDeployments(afterDate) {
        return this.storage.list('deployments').then(monthFolders => {
            // Filter months to look in and collect day folders
            const filteredMonthFolders = R.filter(monthFolder => {
                return moment(monthFolder, 'YYYY-MM').utc().isAfter(
                    afterDate.subtract(1, 'month')
                );
            }, monthFolders);

            return Promise.all(R.map(monthFolder => (
                this.storage.list('deployments/' + monthFolder).then(dayFolder => {
                    // Add the year and month to the day folder
                    return `${monthFolder}/${dayFolder}`;
                })
            ), filteredMonthFolders));
        }).then(R.flatten).then(dayFolders => {
            // Collect deployments in each day folder
            return Promise.all(dayFolders.map(dayFolder => {
                return this.storage.list(`deployments/${dayFolder}`)
                    .then(R.map(deploymentFolder => (
                        // Add the day to the deployment folder
                        `${dayFolder}/${deploymentFolder}`
                    )));
            }));
        }).then(R.flatten);
    }

    list(req, res) {
        // TODO take start date as query param
        const aWeekAgo = moment().utc().subtract(7, 'days');

        this.gatherDeployments(aWeekAgo).then(deploymentFolders => {
            // Get deployment objects
            return Promise.all(R.map(deploymentFolder => {
                const file = `deployments/${deploymentFolder}/meta.yml`;
                return this.storage.get(file).then(text => (
                    new Deployment({
                        id: deploymentFolder.split('/')[2]
                    }).loadYaml(text)
                ));
            }, deploymentFolders));
        }).then(items => {
            res.json({results: items.map(i => i.toJson())});
        }).catch(err => {
            res.status(500).json({errors: [{message: err.message}]});
        });
    }

    get(req, res) {
        const {deploymentId} = req.params;
        const folder = Deployment.folder(deploymentId);

        return this.storage.get(`${folder}/meta.yml`).then(text => {
            const deployment = new Deployment({
                id: deploymentId
            }).loadYaml(text);
            res.json(deployment.toJson());
        }).catch(err => {
            res.status(500).json({errors: [{message: err.message}]});
        });
    }

    getLog(req, res) {
        const {deploymentId} = req.params;
        const folder = Deployment.folder(deploymentId);

        return this.storage.get(`${folder}/log.txt`).then(text => {
            res.send(text);
        }).catch(err => {
            res.status(500).json({errors: [{message: err.message}]});
        });
    }

    create(req, res) {
        const {applicationId, environmentId, branch, tags} = req.body;

        
    }
}

DeploymentController.dependencies = [
    'storage'
];

module.exports = DeploymentController;
