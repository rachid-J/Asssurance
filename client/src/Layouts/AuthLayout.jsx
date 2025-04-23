
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom'

export const AuthLayout = () => {
    const navigate = useNavigate()
   
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    
  
    useEffect(() => {
      if (isAuthenticated) {
        navigate('/');
      }
    }, [isAuthenticated, navigate]);
  return (
    
        <Outlet />
    
  )
}
