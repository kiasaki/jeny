const GitHubApi = require('github');

class GitController {
    constructor(config) {
        this.github = new GitHubApi({});
        this.github.authenticate({
            type: 'basic',
            username: config.get('github_username'),
            password: config.get('github_password')
        });

        this.ref = this.ref.bind(this);
    }

    ref(req, res) {
        const {githubRepo, ref} = req.query;

        if (!githubRepo || githubRepo.indexOf('/') === -1) {
            res.status(400).json({errors: [{message: 'Missing or invalid githubRepo provided.'}]});
            return;
        }
        if (!ref) {
            res.status(400).json({errors: [{message: 'Missing ref.'}]});
            return;
        }

        const [user, repo] = githubRepo.split('/');

        return this.github.gitdata.getReference({
            user, repo, ref
        }).then(reference => {
            res.json({
                ref: reference.ref,
                sha: reference.object.sha,
                type: reference.object.type
            });
        }).catch(err => {
            res.status(500).json({errors: [{message: err.status}]});
        });
    }
}

GitController.dependencies = [
    'config'
];

module.exports = GitController;
