import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export const MainLayout = () => {
    const token = localStorage.getItem('token')
    const navigate = useNavigate()
    if (!token) {
        navigate('/login')
    }
  return (
    
        <Outlet />
    
  )
}
