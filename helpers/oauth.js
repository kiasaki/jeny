const path = require('path');
const debug = require('debug')('jeny:oauth');
const google = require('googleapis');

const promisify = require('./promisify');

class OAuth {
    constructor(config, jwt) {
        this.jwt = jwt;
        this.config = config;

        // Setup client
        const googleClientId = config.get('oauth_google_client_id');
        const googleClientSecret = config.get('oauth_google_client_secret');
        const redirectUrl = config.get('base_url') + config.get('oauth_callback_path');
        this.OAuth2Client = new google.auth.OAuth2(googleClientId, googleClientSecret, redirectUrl);

        this.requireUserMiddleware = this.requireUserMiddleware.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleCallback = this.handleCallback.bind(this);
    }

    unauthorized(res) {
        res.status(401);
        res.sendFile(path.join(
            this.config.get('root'), 'public', 'unauthorized.html'
        ));
    }

    requireUserMiddleware(req, res, next) {
        const {OAuth2Client} = this;
        const token = req.cookies.jenyToken;

        if (!token) {
            this.unauthorized(res);
            return;
        }

        this.jwt.verify(token).then(payload => {
            req.user = payload;
            next();
        }, err => {
            debug(err);
            this.unauthorized(res);
        });
    }

    handleLogin(req, res) {
        const {OAuth2Client} = this;

        var url = OAuth2Client.generateAuthUrl({
            scope: [
                'https://www.googleapis.com/auth/plus.me',
                'https://www.googleapis.com/auth/plus.profile.emails.read'
            ]
        });
        res.redirect(url);
    }

    handleCallback(req, res) {
        const {OAuth2Client, jwt} = this;

        OAuth2Client.getToken(req.query.code, (err, tokens) => {
            if (err) {
                debug('error', err);
                res.status(500).send('Error authenticating: ' + err.message);
                return;
            }

            OAuth2Client.setCredentials(tokens);
            google.plus('v1').people.get({
                userId: 'me',
                auth: OAuth2Client
            }, (err, profile) => {
                if (err) {
                    debug('error', err);
                    res.status(500).send('Error authenticating: ' + err.message);
                    return;
                }

                // sign a JWT token valid for 2 weeks
                const email = profile.emails[0].value;
                const name = profile.displayName || email.split('@')[0];
                const token = jwt.sign({name, email}, 14 * 24 * 60);

                const inTwoWeeks = new Date(Date.now() + (14 * 24 * 60 * 1000));
                res.cookie('jenyToken', token, {expires: inTwoWeeks});
                res.redirect('/');
            });
        });
    }
}

OAuth.dependencyName = 'oauth';
OAuth.dependencies = ['config', 'jwt'];

module.exports = OAuth;
