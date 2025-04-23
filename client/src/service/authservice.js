import { axiosClient } from "./axiosClient"

export const login = async (credential) => {
    const response = await axiosClient.post('/auth/login', credential)
    return response
}

export const me = async () => {
    const response = await axiosClient.get('/auth/me')
    return response
}

export const logout = async () => {
    const response = await axiosClient.post('/auth/logout')
    return response
}
