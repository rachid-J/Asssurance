import React, { useState } from 'react';
import { translations } from './translations';
import { LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo.png';
import { axiosClient } from '../service/axiosClient';
import { useNavigate } from 'react-router-dom';
export const Auth = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const navigate = useNavigate();
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
    };
    const hundleSubmit = async (e) => {

        e.preventDefault();
        const formData = {
            email,
            password,
        }
      const response = await axiosClient.post('/auth/login', formData)
        console.log(response)
        if (response.status === 200) {
            localStorage.setItem('token', response.data.token);
            navigate("/")
            console.log('Login successful');
            // Handle successful login (e.g., redirect to dashboard)
        } else {
            console.error('Login failed');
            // Handle login failure (e.g., show error message)
        }
    }

    return (
        <div className={`min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-4 ${currentLanguage === 'ar' ? 'rtl' : 'ltr'}`}>
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className=" h-20 mx-auto mb-4 flex items-center justify-center ">
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
                    <div className="space-y-5">
                        {/* Email Field */}
                        <div className="relative">
                            <label htmlFor="email" className="block text-sm font-medium text-[#1E265F] mb-1">{translations[currentLanguage].emailLabel}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-[#999AB6]" />
                                </div>
                                <input
                                    id="email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-[#999AB6] rounded-md shadow-sm placeholder-[#999AB6] focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] text-sm"
                                    placeholder={translations[currentLanguage].emailPlaceholder}
                                />
                            </div>
                        </div>
                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#1E265F] mb-1">{translations[currentLanguage].passwordLabel}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-[#999AB6]" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className="block w-full pl-10 pr-10 py-3 border border-[#999AB6] rounded-md shadow-sm placeholder-[#999AB6] focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] text-sm"
                                    placeholder={translations[currentLanguage].passwordPlaceholder}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-[#999AB6] hover:text-[#1E265F] focus:outline-none cursor-pointer"
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
                        {/* Remember Me Checkbox */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                    className="h-4 w-4 text-[#1E265F] focus:ring-[#1E265F] border-[#999AB6] rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#1E265F] cursor-pointer">
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
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] transition duration-150 ease-in-out !rounded-button cursor-pointer whitespace-nowrap"
                            onClick={hundleSubmit}
                        >
                            {translations[currentLanguage].signIn}
                        </button>
                        {/* Secure Connection Indicator */}
                        <div className="flex items-center justify-center text-xs text-[#999AB6] mt-4">
                            <ShieldCheckIcon className="h-4 w-4 text-[#1E265F] mr-1" />
                            {translations[currentLanguage].secureConnection}
                        </div>
                    </div>
                </div>
                {/* Two-Factor Authentication Option */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-8 text-center">
                    <p className="text-sm text-[#999AB6]">
                        <KeyIcon className="h-4 w-4 text-[#1E265F] mr-1 inline" />
                        {translations[currentLanguage].twoFactorText} {' '}
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
                        <div className="inline-flex border border-[#999AB6] rounded-md">
                            <button
                                onClick={() => setCurrentLanguage('en')}
                                className={`px-3 py-1 text-sm ${currentLanguage === 'en' ? 'bg-[#FBFBFB] text-[#1E265F]' : 'text-[#999AB6]'} border-r border-[#999AB6] cursor-pointer whitespace-nowrap !rounded-button`}>
                                English
                            </button>
                            <button
                                onClick={() => setCurrentLanguage('fr')}
                                className={`px-3 py-1 text-sm ${currentLanguage === 'fr' ? 'bg-[#FBFBFB] text-[#1E265F]' : 'text-[#999AB6]'} border-r border-[#999AB6] cursor-pointer whitespace-nowrap !rounded-button`}>
                                Français
                            </button>
                            <button
                                onClick={() => setCurrentLanguage('ar')}
                                className={`px-3 py-1 text-sm ${currentLanguage === 'ar' ? 'bg-[#FBFBFB] text-[#1E265F]' : 'text-[#999AB6]'} cursor-pointer whitespace-nowrap !rounded-button`}>
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
