import axios from 'axios';

// Get base URL based on environment
const getBaseURL = () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
        // In development, use the proxy configured in package.json
        return '/api/donors';
    } else {
        // In production, use relative path
        return '/api/donors';
    }
};

// Create axios instance with base configuration
const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
        // Add CORS headers
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    },
    timeout: 10000
});

// Add request interceptor for debugging
api.interceptors.request.use(
    config => {
        console.log('Making request to:', config.url);
        console.log('Request config:', config);
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
        console.log('Received response:', response);
        return response;
    },
    error => {
        console.error('API Error:', error);
        console.error('Error details:', {
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        
        // Handle network errors
        if (!error.response) {
            return Promise.reject({ 
                error: 'Network error. Please check your internet connection and try again.' 
            });
        }
        
        // Handle API errors
        if (error.response.data) {
            return Promise.reject(error.response.data);
        }
        
        return Promise.reject({ 
            error: 'An unexpected error occurred. Please try again.' 
        });
    }
);

export default api;
