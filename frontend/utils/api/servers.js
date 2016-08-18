import API from './api';

class ServersAPI extends API {
    list() {
        return this.apiClient.request('GET', '/servers');
    }
}

export default ServersAPI;
