const R = require('ramda');
const path = require('path');
const AWS = require('aws-sdk');
const yaml = require('js-yaml');
const moment = require('moment');
const debug = require('debug')('jeny:routes');

AWS.config.update({region:'us-east-1'});

module.exports = function(container) {
    const app = container.get('app');
    const config = container.get('config');
    const storage = container.get('storage');

    const OAuth = container.get('oauth');

    app.get('/oauth/login', OAuth.handleLogin);
    app.get('/oauth/logout', OAuth.handleLogout);
    app.get('/oauth/callback', OAuth.handleCallback);

    app.use(OAuth.requireUserMiddleware);

    function handleError(res, err) {
        res.status(500).json({errors: [{message: err.message}]});
    }

    app.get('/api/v1/applications', (req, res) => {
        const folder = 'applications';
        return storage.list(folder).then(files => {
            return Promise.all(files.map(application => {
                return storage.get(`applications/${application}/meta.yml`)
                    .then(text => yaml.safeLoad(text))
                    .then(R.assoc('id', application));
            }));
        }).then(items => {
            res.json({results: items});
        }).catch(handleError.bind(null, res));
    });

    app.get('/api/v1/applications/:id', (req, res) => {
        const file = `applications/${req.params.id}/meta.yml`;
        return storage.get(file).then(text => {
            res.json(R.assoc('id', req.params.id, yaml.safeLoad(text)));
        });
    });

    app.get('/api/v1/applications/:id/environments', (req, res) => {
        const folder = `applications/${req.params.id}/environments`;
        return storage.list(folder).then(files => {
            return Promise.all(files.map(environment => {
                return storage.get(`${folder}/${environment}/meta.yml`)
                    .then(text => yaml.safeLoad(text))
                    .then(R.assoc('id', environment))
                    .then(R.assoc('applicationId', req.params.id));
            }));
        }).then(items => {
            res.json({results: items});
        }).catch(handleError.bind(null, res));
    });

    app.get('/api/v1/applications/:applicationId/environments/:environmentId/deployments', (req, res) => {
        const {applicationId, environmentId} = req.params;
        const folder = (
            `applications/${applicationId}/` +
            `environments/${environmentId}/deployments`
        );

        const now = moment().utc();
        // TODO take start date as query param
        const aWeekAgo = moment().utc().subtract(7, 'days');

        const monthDayFolders = storage.list(folder).then(monthFolders => {
            // Filter months to look in and collect day folders
            const filteredMonthFolders = R.filter(monthFolder => {
                return moment(monthFolder, 'YYYY-MM').utc().isAfter(
                    aWeekAgo.subtract(1, 'month')
                );
            }, monthFolders);

            return Promise.all(R.map(monthFolder => (
                storage.list(folder + '/' + monthFolder).then(dayFolder => {
                    // Add the year and month to the day folder
                    return `${monthFolder}/${dayFolder}`;
                })
            ), filteredMonthFolders));
        }).then(R.flatten).then(dayFolders => {
            // Collect deployments in each day folder
            return Promise.all(dayFolders.map(dayFolder => {
                return storage.list(`${folder}/${dayFolder}`)
                    .then(R.map(deploymentFolder => (
                        // Add the day to the deployment folder
                        `${dayFolder}/${deploymentFolder}`
                    )));
            }));
        }).then(R.flatten).then(deploymentFolders => {
            // Get deployment objects
            return Promise.all(R.map(deploymentFolder => {
                return storage.get(`${folder}/${deploymentFolder}/meta.yml`)
                    .then(text => yaml.safeLoad(text))
                    .then(R.assoc('id', deploymentFolder.split('/')[2]))
                    .then(R.assoc('applicationId', applicationId))
                    .then(R.assoc('environmentId', environmentId));
            }, deploymentFolders));
        }).then(items => {
            res.json({results: items});
        }).catch(handleError.bind(null, res));
    });

    app.get('/api/v1/deployments/:applicationId/:environmentId/:deploymentId', (req, res) => {
        const {applicationId, environmentId, deploymentId} = req.params;
        const folder = (
            `applications/${applicationId}/` +
            `environments/${environmentId}/deployments/` +
            deploymentId.slice(0, 4) + '-' +
            deploymentId.slice(5, 7) + '/' +
            deploymentId.slice(8, 10) + '/' +
            deploymentId
        );

        return storage.get(`${folder}/meta.yml`)
            .then(text => yaml.safeLoad(text))
            .then(R.assoc('id', deploymentId))
            .then(R.assoc('applicationId', applicationId))
            .then(R.assoc('environmentId', environmentId))
            .then(deployment => res.json(deployment))
            .catch(handleError.bind(null, res));
    });

    app.get('/api/v1/deployments/:applicationId/:environmentId/:deploymentId/log', (req, res) => {
        const {applicationId, environmentId, deploymentId} = req.params;
        const folder = (
            `applications/${applicationId}/` +
            `environments/${environmentId}/deployments/` +
            deploymentId.slice(0, 4) + '-' +
            deploymentId.slice(5, 7) + '/' +
            deploymentId.slice(8, 10) + '/' +
            deploymentId
        );

        return storage.get(`${folder}/log.txt`).then(text => {
            res.send(text);
        }).catch(handleError.bind(null, res));
    });

    app.get('/api/v1/servers', (req, res) => {
        var ec2 = new AWS.EC2({apiVersion: '2016-04-01'});
        ec2.describeInstances({
            Filters: [{
                Name: 'tag-key',
                Values: ['roles', 'environment']
            }]
        }, function(err, data) {
            if (err) {
                handleError(res, err);
                return;
            }

            const instances = [];

            data.Reservations.forEach(reservation => {
                reservation.Instances.forEach(instance => {
                    instances.push({
                        id: instance.InstanceId,
                        name: R.find(R.propEq('Key', 'Name'), instance.Tags).Value,
                        imageId: instance.ImageId,
                        subnetId: instance.SubnetId,
                        vpcId: instance.VpcId,
                        state: instance.State.Name,
                        key: instance.KeyName,
                        type: instance.InstanceType,
                        availabilityZone: instance.Placement.AvailabilityZone,
                        privateDnsName: instance.PrivateDnsName,
                        publicDnsName: instance.publicDnsName,
                        privateIpAddress: instance.PrivateIpAddress,
                        publicIpAddress: instance.publicIpAddress,
                        tags: instance.Tags.map(tag => ({key: tag.Key, value: tag.Value})),
                        securityGroups: instance.SecurityGroups.map(sg => ({
                            id: sg.GroupId,
                            name: sg.GroupName
                        })),
                    });
                });
            });

            res.json({results: R.sortBy(R.prop('name'), instances)});
        })
    });

    app.get('/api/v1/', (req, res) => {
        res.json({version: 1});
    });
    app.get('/api/v1/*', (req, res) => {
        res.status(404).json({errors: [{message: 'Not found'}]});
    });

    function handleFrontend(req, res) {
        res.sendFile(path.join(
            config.get('root'), 'public', 'home.html'
        ));
    }

    app.use(handleFrontend);
};
