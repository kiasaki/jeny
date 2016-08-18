const R = require('ramda');
const path = require('path');
const AWS = require('aws-sdk');

AWS.config.update({region:'us-east-1'});

module.exports = function(container) {
    const app = container.get('app');
    const config = container.get('config');

    const OAuth = container.get('oauth');

    app.get('/oauth/login', OAuth.handleLogin);
    app.get('/oauth/logout', OAuth.handleLogout);
    app.get('/oauth/callback', OAuth.handleCallback);

    app.use(OAuth.requireUserMiddleware);

    app.get('/api/v1/servers', (req, res) => {
        var ec2 = new AWS.EC2({apiVersion: '2016-04-01'});
        ec2.describeInstances({
            Filters: [{
                Name: 'tag-key',
                Values: ['roles', 'environment']
            }]
        }, function(err, data) {
            if (err) {
                res.status(500).json({errors: [{message: err.message}]});
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
