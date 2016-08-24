import API from './api';

class ApplicationsAPI extends API {
    list() {
        return this.apiClient.request('GET', '/applications');
    }
}

export default ApplicationsAPI;
