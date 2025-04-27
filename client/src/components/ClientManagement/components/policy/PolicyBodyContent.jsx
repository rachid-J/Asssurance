import { PolicyDocuments } from "./PolicyDocuments";

export const PolicyBodyContent = ({ policy, formatDate }) => {
    return (
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financial Summary */}
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Financial Summary
            </h5>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Prime HT</dt>
                <dd className="mt-1 text-lg font-medium text-gray-900">
                  {new Intl.NumberFormat('fr-MA', { 
                    style: 'currency', 
                    currency: 'MAD' 
                  }).format(policy.primeHT)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Prime TTC</dt>
                <dd className="mt-1 text-lg font-medium text-green-700">
                  {new Intl.NumberFormat('fr-MA', { 
                    style: 'currency', 
                    currency: 'MAD' 
                  }).format(policy.primeTTC)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Current Prime</dt>
                <dd className="mt-1 text-lg font-medium text-blue-700">
                  {new Intl.NumberFormat('fr-MA', { 
                    style: 'currency', 
                    currency: 'MAD' 
                  }).format(policy.primeActuel)}
                </dd>
              </div>
            </dl>
          </div>
  
          {/* Policy Details */}
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Policy Details
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Usage Type</span>
                <span className="text-sm text-gray-900">{policy.usage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Coverage Period</span>
                <span className="text-sm text-gray-900">
                  {Math.ceil((new Date(policy.endDate) - new Date(policy.startDate)) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Days Remaining</span>
                <span className="text-sm text-gray-900">
                  {Math.ceil((new Date(policy.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>
        </div>
  
        {/* Additional Information */}
        {policy.comment && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Additional Notes
            </h5>
            <p className="text-sm text-gray-600">{policy.comment}</p>
          </div>
        )}
  
        {/* Document Attachments */}
        <PolicyDocuments policy={policy} formatDate={formatDate} />
      </div>
    );
  };