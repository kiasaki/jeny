const path = require('path');

module.exports = function(container) {
    const app = container.get('app');
    const config = container.get('config');

    const OAuth = container.get('oauth');

    app.get('/oauth/login', OAuth.handleLogin);
    app.get('/oauth/callback', OAuth.handleCallback);

    app.use(OAuth.requireUserMiddleware);

    function handleFrontend(req, res) {
        res.sendFile(path.join(
            config.get('root'), 'public', 'home.html'
        ));
    }

    app.use(handleFrontend);
};
