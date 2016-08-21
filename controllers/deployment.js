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

    gatherDeployments(folder, afterDate) {
        return this.storage.list(folder).then(monthFolders => {
            // Filter months to look in and collect day folders
            const filteredMonthFolders = R.filter(monthFolder => {
                return moment(monthFolder, 'YYYY-MM').utc().isAfter(
                    afterDate.subtract(1, 'month')
                );
            }, monthFolders);

            return Promise.all(R.map(monthFolder => (
                this.storage.list(folder + '/' + monthFolder).then(dayFolder => {
                    // Add the year and month to the day folder
                    return `${monthFolder}/${dayFolder}`;
                })
            ), filteredMonthFolders));
        }).then(R.flatten).then(dayFolders => {
            // Collect deployments in each day folder
            return Promise.all(dayFolders.map(dayFolder => {
                return this.storage.list(`${folder}/${dayFolder}`)
                    .then(R.map(deploymentFolder => (
                        // Add the day to the deployment folder
                        `${dayFolder}/${deploymentFolder}`
                    )));
            }));
        }).then(R.flatten);
    }

    list(req, res) {
        const {applicationId, environmentId} = req.params;
        const folder = (
            `applications/${applicationId}/` +
            `environments/${environmentId}/deployments`
        );

        // TODO take start date as query param
        const aWeekAgo = moment().utc().subtract(7, 'days');

        this.gatherDeployments(folder, aWeekAgo).then(deploymentFolders => {
            // Get deployment objects
            return Promise.all(R.map(deploymentFolder => {
                const file = `${folder}/${deploymentFolder}/meta.yml`;
                return this.storage.get(file).then(text => (
                    new Deployment({
                        id: deploymentFolder.split('/')[2],
                        applicationId: applicationId,
                        environmentId: environmentId
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
        const {applicationId, environmentId, deploymentId} = req.params;
        const folder = Deployment.folder(
            applicationId,
            environmentId,
            deploymentId
        );

        return this.storage.get(`${folder}/meta.yml`).then(text => {
            const deployment = new Deployment({
                id: deploymentId,
                applicationId: applicationId,
                environmentId: environmentId
            }).loadYaml(text);
            res.json(deployment.toJson());
        }).catch(err => {
            res.status(500).json({errors: [{message: err.message}]});
        });
    }

    getLog(req, res) {
        const {applicationId, environmentId, deploymentId} = req.params;
        const folder = Deployment.folder(
            applicationId,
            environmentId,
            deploymentId
        );

        return this.storage.get(`${folder}/log.txt`).then(text => {
            res.send(text);
        }).catch(err => {
            res.status(500).json({errors: [{message: err.message}]});
        });
    }
}

DeploymentController.dependencies = [
    'storage'
];

module.exports = DeploymentController;
