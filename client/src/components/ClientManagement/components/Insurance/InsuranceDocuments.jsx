// components/InsuranceDocuments.js
import { ArrowDownTrayIcon, DocumentIcon } from "@heroicons/react/24/outline";

export const InsuranceDocuments = ({ insurance, formatDate }) => {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Pièces jointes
      </h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insurance.documents?.map((doc, index) => (
          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
            <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{doc.type}</p>
              <p className="text-sm text-gray-500 truncate">Expire le {formatDate(doc.expiryDate)}</p>
            </div>
            <button className="ml-3 text-[#1E265F] hover:text-[#272F65]">
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};