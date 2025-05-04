import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon, ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function UnauthorizedDashboard() {
  const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem("lang") || 'fr');

  return (
    <div className={`min-h-screen bg-[#F9FAFC] flex items-center justify-center ${currentLanguage === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-lg w-full mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-50 rounded-full">
            <ShieldExclamationIcon className="h-20 w-20 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-[#1E265F] mb-4">Accès non autorisé</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Désolé, vous n'avez pas l'autorisation d'accéder au tableau de bord administratif. 
          Veuillez contacter votre administrateur système si vous pensez qu'il s'agit d'une erreur.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/assurance-cases"
            className="flex items-center justify-center px-6 py-3 bg-[#1E265F] text-white rounded-lg hover:bg-[#272F65] transition-colors shadow-md"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Aller à la page d'assurance
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-6 py-3 bg-white text-[#1E265F] border border-[#1E265F] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}