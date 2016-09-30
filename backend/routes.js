const R = require('ramda');
const path = require('path');
const debug = require('debug')('jeny:routes');

const ph = require('./helpers/promise-handler');

module.exports = function(container) {
    const app = container.get('app');
    const config = container.get('config');

    const OAuth = container.get('oauth');
    app.get('/oauth/login', OAuth.handleLogin);
    app.get('/oauth/logout', OAuth.handleLogout);
    app.get('/oauth/callback', OAuth.handleCallback);

    app.use(OAuth.requireUserMiddleware);

    const ApplicationController = require('./controllers/application');
    const applicationController = container.create(ApplicationController);
    app.get('/api/v1/applications', ph(applicationController.list));

    const DeploymentController = require('./controllers/deployment');
    const deploymentController = container.create(DeploymentController);
    app.get('/api/v1/deployments', ph(deploymentController.list));
    app.get('/api/v1/deployments/:deploymentId', ph(deploymentController.get));
    app.get('/api/v1/deployments/:deploymentId/log', ph(deploymentController.getLog));
    app.post('/api/v1/deployments', ph(deploymentController.create));

    const ServerController = require('./controllers/server');
    const serverController = container.create(ServerController);
    app.get('/api/v1/servers', serverController.list);

    const GitController = require('./controllers/git');
    const gitController = container.create(GitController);
    app.get('/api/v1/git/ref', ph(gitController.ref));

    app.get('/api/v1/', (req, res) => {
        res.json({version: 1});
    });
    app.get('/api/v1/*', (req, res) => {
        res.status(404).json({errors: [{message: 'Not found'}]});
    });

    // As this is an SPA, catch all other routes and simply render the index,
    // the frontend will in turn render a 404 if needed
    app.use((req, res) => {
        res.sendFile(path.join(
            config.get('root'), 'public', 'home.html'
        ));
    });
};
