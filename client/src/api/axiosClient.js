import axios from 'axios'

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
const TIMEOUT =
    import.meta.env.VITE_REQUEST_TIMEOUT || 30000

/**
 * Axios instance for API communication
 * Configured with base URL, timeout, and default headers
 */
const axiosClient = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
})

/**
 * Request interceptor
 * Adds authorization token if available
 */
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

/**
 * Response interceptor
 * Handles errors and successful responses
 */
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const err = error
        if (err.response && err.response.data) {
            err.message = err.response.data.message || err.message
            err.data = err.response.data
        }
        return Promise.reject(err)
    }
)

/**
 * Set authentication token in headers
 * @param {string} token - JWT token
 */
export function setAuthToken(token) {
    if (token) {
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
        localStorage.setItem('authToken', token)
    } else {
        delete axiosClient.defaults.headers.common['Authorization']
        localStorage.removeItem('authToken')
    }
}

/**
 * Clear authentication token
 */
export function clearAuthToken() {
    delete axiosClient.defaults.headers.common['Authorization']
    localStorage.removeItem('authToken')
}

/**
 * Get current API base URL
 */
export function getBaseURL() {
    return BASE_URL
}

export default axiosClient