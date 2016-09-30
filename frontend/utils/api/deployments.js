import API from './api';

class DeploymentsAPI extends API {
    list() {
        return this.apiClient.request('GET', '/deployments');
    }

    get(deploymentId) {
        return this.apiClient.request('GET', `/deployments/${deploymentId}`);
    }

    log(deploymentId) {
        return this.apiClient.request('GET', `/deployments/${deploymentId}/log`);
    }

    create(deployment) {
        return this.apiClient.request('POST', '/deployments', {}, deployment);
    }
}

export default DeploymentsAPI;
