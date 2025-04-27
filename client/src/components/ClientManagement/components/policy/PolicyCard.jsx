import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PolicyBodyContent } from "./PolicyBodyContent";

export const PolicyCard = ({ policy, navigate, formatDate }) => {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* Policy Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-[#1E265F]">
                {policy.policyNumber}
                <span className="ml-2 text-sm font-medium text-gray-500">
                  {policy.insuranceType}
                </span>
              </h4>
              <div className="mt-1 flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  policy.status === 'active' ? 'bg-green-100 text-green-800' :
                  policy.status === 'expired' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {policy.status}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate(`/policies/${policy._id}`)}
                className="p-2 text-gray-500 hover:text-[#1E265F] rounded-lg hover:bg-gray-100"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
  
        {/* Policy Body */}
        <PolicyBodyContent policy={policy} formatDate={formatDate} />
  
        {/* Policy Footer */}
        <div className="px-4 py-3 sm:px-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Created {formatDate(policy.createdAt)}</span>
            <span>Last updated {formatDate(policy.updatedAt)}</span>
          </div>
        </div>
      </div>
    );
  };
  