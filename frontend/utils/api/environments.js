import API from './api';

class EnvironmentsAPI extends API {
    list(applicationId) {
        const path = `/applications/${applicationId}/environments`;
        return this.apiClient.request('GET', path);
    }

    get(enviromentId) {
        const [applicationId, id] = enviromentId.split('/');
        const path = `/applications/${applicationId}/environments/${id}`;
        return this.apiClient.request('GET', path);
    }
}

export default EnvironmentsAPI;
