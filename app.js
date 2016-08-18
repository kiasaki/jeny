const path = require('path');
const debug = require('debug')('jeny:app');

exports.setup = function(container) {
    const EventEmitter = require('events');
    container.set('events', new EventEmitter());

    const Config = require('./helpers/config');
    container.set('config', new Config());

    // Load config
    const config = container.get('config');
    config.loadFromEnv();
    config.set('root', path.resolve(__dirname));

    // Load up code
    container.load(require('./helpers/db'));
    container.load(require('./helpers/jwt'));
    container.load(require('./helpers/oauth'));

    // Setup app
    const express = require('express');
    const publicPath = path.join(__dirname, 'public');
    container.set('app', express());
    const app = container.get('app');

    app.disable('x-powered-by');
    app.enable('trust proxy');
    app.use(require('morgan')('dev'));
    app.use(require('cors')());
    app.use(require('cookie-parser')());
    app.use(require('body-parser').json());
    app.use(require('body-parser').urlencoded({extended: false}));
    app.use(express.static(publicPath));

    require('./routes')(container);

    app.start = () => {
        const port = config.get('port') || 8080;
        app.server = app.listen(port, () => {
            debug(`server listenning on port ${port}`);
            container.get('events').emit('app:started');
        });
    };
    app.stop = () => {
        if (app.server) {
            app.server.close();
            container.get('events').emit('app:stopped');
        }
    };
};
