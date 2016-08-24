const Entity = require('../helpers/entity');

class Deployment extends Entity {

}

Deployment.folder = function(deploymentId) {
    return (
        `deployments/` +
        deploymentId.slice(0, 4) + '-' +
        deploymentId.slice(5, 7) + '/' +
        deploymentId.slice(8, 10) + '/' +
        deploymentId
    );
};

Deployment.prototype.fields = [
    'id',
    'applicationId',
    'environmentId',
    'status',
    'by',
    'createdAt',
    'completedAt',
    'branch',
    'sha',
    'previousSha',
    'servers',
    'tagsOverriden',
    'tags'
];

module.exports = Deployment;
