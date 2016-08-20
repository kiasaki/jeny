import API from './api';

class ApplicationsAPI extends API {
    list() {
        return this.apiClient.request('GET', '/applications');
    }

    get(id) {
        return this.apiClient.request('GET', '/applications/' + id);
    }
}

export default ApplicationsAPI;
