import React, { useState } from 'react';
import { translations } from '../shared/translations';
import { LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo.png';
import { axiosClient } from '../service/axiosClient';
import { useNavigate } from 'react-router-dom';
import { login } from './authSlice';
import { useDispatch } from 'react-redux';

export const Auth = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem("lang") || 'fr');
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        try {
            const response = await axiosClient.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });
            
            if (response.status === 200) {
                dispatch(login(response.data));
                navigate("/");
            }
        } catch (err) {
            setError(
                err.response?.data?.message || 
                translations[currentLanguage].loginError || 
                'An error occurred during login'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const changeLanguage = (lang) => {
        setCurrentLanguage(lang);
        localStorage.setItem('lang', lang);
    };

    return (
        <div className={`min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-4 ${currentLanguage === 'ar' ? 'rtl' : 'ltr'}`}>
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="h-20 mx-auto mb-4 flex items-center justify-center">
                        <img src={logo} alt="logo" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-[#999AB6] mt-2">{translations[currentLanguage].welcome}</p>
                </div>

                {/* Authentication Container */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <h2 className="text-xl font-semibold text-[#1E265F] mb-6 flex items-center justify-center">
                        <LockClosedIcon className="h-5 w-5 text-[#1E265F] mr-2" />
                        {translations[currentLanguage].authentication}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleFormSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="relative">
                            <label htmlFor="email" className="block text-sm font-medium text-[#1E265F] mb-1">
                                {translations[currentLanguage].emailLabel}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-[#999AB6]" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-[#999AB6] rounded-md shadow-sm placeholder-[#999AB6] focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] text-sm"
                                    placeholder={translations[currentLanguage].emailPlaceholder}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#1E265F] mb-1">
                                {translations[currentLanguage].passwordLabel}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-[#999AB6]" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="block w-full pl-10 pr-10 py-3 border border-[#999AB6] rounded-md shadow-sm placeholder-[#999AB6] focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] text-sm"
                                    placeholder={translations[currentLanguage].passwordPlaceholder}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-[#999AB6] hover:text-[#1E265F] focus:outline-none cursor-pointer"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Remember Me and Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-[#1E265F] focus:ring-[#1E265F] border-[#999AB6] rounded cursor-pointer"
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-[#1E265F] cursor-pointer">
                                    {translations[currentLanguage].rememberMe}
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-[#1E265F] hover:text-[#272F65] cursor-pointer whitespace-nowrap">
                                    {translations[currentLanguage].forgotPassword}
                                </a>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] transition duration-150 ease-in-out cursor-pointer whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? translations[currentLanguage].signingIn || "Signing in..." : translations[currentLanguage].signIn}
                        </button>

                        {/* Secure Connection Indicator */}
                        <div className="flex items-center justify-center text-xs text-[#999AB6] mt-4">
                            <ShieldCheckIcon className="h-4 w-4 text-[#1E265F] mr-1" />
                            {translations[currentLanguage].secureConnection}
                        </div>
                    </form>
                </div>

                {/* Two-Factor Authentication Option */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-8 text-center">
                    <p className="text-sm text-[#999AB6]">
                        <KeyIcon className="h-4 w-4 text-[#1E265F] mr-1 inline" />
                        {translations[currentLanguage].twoFactorText}{' '}
                        <a href="#" className="text-[#1E265F] hover:text-[#272F65] cursor-pointer">
                            {translations[currentLanguage].clickHere}
                        </a>
                    </p>
                </div>

                {/* Footer Section */}
                <div className="text-center text-[#999AB6] text-sm">
                    <div className="mb-4 flex justify-center space-x-6">
                        <a href="#" className="hover:text-[#1E265F] transition-colors cursor-pointer">{translations[currentLanguage].privacyPolicy}</a>
                        <a href="#" className="hover:text-[#1E265F] transition-colors cursor-pointer">{translations[currentLanguage].termsOfService}</a>
                        <a href="#" className="hover:text-[#1E265F] transition-colors cursor-pointer">{translations[currentLanguage].contactSupport}</a>
                    </div>
                    <div className="mb-4">
                        <div className="inline-flex border border-[#999AB6] rounded-md" role="group" aria-label="Language selection">
                            <button
                                type="button"
                                onClick={() => changeLanguage('fr')}
                                className={`px-3 py-1 text-sm ${currentLanguage === 'fr' ? 'bg-[#FBFBFB] text-[#1E265F]' : 'text-[#999AB6]'} border-r border-[#999AB6] cursor-pointer whitespace-nowrap`}
                            >
                                Français
                            </button>
                            <button
                                type="button"
                                onClick={() => changeLanguage('ar')}
                                className={`px-3 py-1 text-sm ${currentLanguage === 'ar' ? 'bg-[#FBFBFB] text-[#1E265F]' : 'text-[#999AB6]'} cursor-pointer whitespace-nowrap`}
                            >
                                العربية
                            </button>
                        </div>
                    </div>
                    <p>{translations[currentLanguage].copyright}</p>
                </div>
            </div>
        </div>
    );
};