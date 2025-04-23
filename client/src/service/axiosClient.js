import axios from 'axios';



export const axiosClient = axios.create({
    baseURL : import.meta.env.VITE_API_URL,
    headers : {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json',
    }

})
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})
axiosClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)