import axios from 'axios';

// Get base URL based on environment
const getBaseURL = () => {
    if (process.env.NODE_ENV === 'development') {
        return '/api/donors';  // In development, use the proxy configured in package.json
    }
    return '/api/donors';  // In production, use relative path
};

// Create axios instance with base configuration
const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Add request interceptor for debugging
api.interceptors.request.use(
    config => {
        console.log('Making request to:', config.url);
        console.log('Request config:', {
            method: config.method,
            url: config.url,
            data: config.data
        });
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    response => {
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        return response;
    },
    error => {
        if (error.response) {
            // Server responded with error
            console.error('Server error:', {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            // Request was made but no response
            console.error('No response received:', error.request);
        } else {
            // Something else went wrong
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
