const Entity = require('../helpers/entity');

class Environment extends Entity {

}

Environment.prototype.fields = [
    'id',
    'applicationId',
    'defaultBranch',
    'variables',
    'serverFilters',
    'ansibleTags'
];

module.exports = Environment;
