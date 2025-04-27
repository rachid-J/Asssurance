import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";

export const ContactDetailsTab = ({ client }) => {
    return (
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Contact Details</h3>
        <div className="mt-5 border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                {client.telephone || 'N/A'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                {client.email || 'N/A'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-start">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                <div>
                  {client.address || 'N/A'}
                  {client.postalCode && client.city && (
                    <div className="mt-1">{client.postalCode}, {client.city}</div>
                  )}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  };