import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export const AuthLayout = () => {
    const token = localStorage.getItem('token')
    const navigate = useNavigate()
    if (token) {
        navigate('/')
        
    }
  return (
    
        <Outlet />
    
  )
}
