import { DataRow } from "../../Common/DataRow";

export const PersonalInfoTab = ({ client, formatDate }) => {
    return (
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
        <div className="mt-5 border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <DataRow label="Full name" value={`${client.title} ${client.firstName} ${client.name}`} />
            
            <DataRow 
              label="Client type" 
              value={
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  client.clientType === 'Particulier' ? 'bg-green-100 text-green-800' :
                  client.clientType === 'Professionnel' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {client.clientType || 'Unknown'}
                </span>
              } 
            />
            
            <DataRow label="ID Type" value={client.idType || 'N/A'} />
            <DataRow label="Card Number" value={client.idNumber || 'N/A'} />
            <DataRow label="Date of Birth" value={formatDate(client.dateOfBirth)} />
            <DataRow label="Gender" value={client.gender || 'N/A'} />
            <DataRow label="Marital Status" value={client.maritalStatus || 'N/A'} />
            <DataRow label="Number of Children" value={client.numberOfChildren !== undefined ? client.numberOfChildren : 'N/A'} />
            <DataRow label="Profession" value={client.profession || 'N/A'} />
            <DataRow label="Driver Status" value={client.isDriver ? 'Driver' : 'Non-Driver'} />
          </dl>
        </div>
      </div>
    );
  };