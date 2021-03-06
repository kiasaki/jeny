const AWS = require('aws-sdk');

class ServerController {
    constructor(config) {
        this.list = this.list.bind(this);

        AWS.config.update({
            accessKeyId: config.get('aws_access_key_id'),
            secretAccessKey: config.get('aws_secret_access_key'),
            region:'us-east-1'
        });
    }

    list(req, res) {
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
        });
    }
}

ServerController.dependencies = [
    'config'
];

module.exports = ServerController;
