import { axiosClient } from "./axiosClient"



export const createUser = async (user) => {
    const response = await axiosClient.post('/users/create', user)
    return response
}

export const getUsers = async () => {
    const response = await axiosClient.get('/users')
    return response
}

export const getUser = async (id) => {
    const response = await axiosClient.get(`/users/${id}`)
    return response
}

export const updateUser = async (id, user) => {
    const response = await axiosClient.put(`/users/${id}`, user)
    return response
}
export const deleteUser = async (id) => {
    const response = await axiosClient.delete(`/users/${id}`)
    return response
}