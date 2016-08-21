import API from './api';

class DeploymentsAPI extends API {
    list(fullEnvironmentId) {
        const [applicationId, environmentId] = fullEnvironmentId.split('/');
        const path = (
            `/applications/${applicationId}` +
            `/environments/${environmentId}/deployments`
        );
        return this.apiClient.request('GET', path);
    }

    get(deploymentId) {
        return this.apiClient.request('GET', `/deployments/${deploymentId}`);
    }

    log(deploymentId) {
        return this.apiClient.request('GET', `/deployments/${deploymentId}/log`);
    }
}

export default DeploymentsAPI;
