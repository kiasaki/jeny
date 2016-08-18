const container = require('./container');

require('./app').setup(container);

container.get('app').start();
