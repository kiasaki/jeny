const Entity = require('../helpers/entity');

class Application extends Entity {

}

Application.prototype.fields = [
    'id',
    'githubRepo',
    'variables',
    'ansibleTags',
    'environments'
];

module.exports = Application;
