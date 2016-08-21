const Entity = require('../helpers/entity');

class Application extends Entity {

}

Application.prototype.fields = [
    'id',
    'githubRepo',
    'variables'
];

module.exports = Application;
