import { axiosClient } from "./axiosClient"

export const login = async (credential) => {
    const response = await axiosClient.post('/auth/login', credential)
    return response
}


