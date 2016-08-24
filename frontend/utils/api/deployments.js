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
}

export default DeploymentsAPI;
