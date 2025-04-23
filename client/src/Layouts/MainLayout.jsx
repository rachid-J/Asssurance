import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom'
import { axiosClient } from '../service/axiosClient';
import { setUser } from '../Auth/authSlice';

export const MainLayout = () => {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const navigate = useNavigate();

  const  dispach  = useDispatch()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosClient.get('/auth/me');
        dispach(setUser(res.data));
      } catch (error) {
        console.log('Not authenticated');

      }
    };
    fetchUser();
  }, [dispach]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  return (
    
        <Outlet />
    
  )
}
