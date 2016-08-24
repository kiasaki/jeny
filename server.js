const container = require('./backend/container');

require('./backend/app').setup(container);

container.get('app').start();
