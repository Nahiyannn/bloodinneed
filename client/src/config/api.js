import axios from 'axios';

const api = axios.create({
    baseURL: '/api/donors',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    return request;
});

api.interceptors.response.use(response => {
    console.log('Response:', response);
    return response;
});

export default api;
