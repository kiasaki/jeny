import API from './api';

class GitAPI extends API {
    ref(githubRepoAndRef) {
        const [githubRepo, ref] = githubRepoAndRef.split(':');
        return this.apiClient.request('GET', '/git/ref', {
            githubRepo, ref
        });
    }
}

export default GitAPI;
