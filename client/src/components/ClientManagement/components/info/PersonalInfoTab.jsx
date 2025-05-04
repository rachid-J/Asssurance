import { DataRow } from "../../Common/DataRow";

export const PersonalInfoTab = ({ client, formatDate }) => {
    return (
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Informations Personnelles</h3>
        <div className="mt-5 border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <DataRow label="Nom complet" value={`${client.title} ${client.firstName} ${client.name}`} />
            
            <DataRow 
              label="Type de client" 
              value={
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  client.clientType === 'Particulier' ? 'bg-green-100 text-green-800' :
                  client.clientType === 'Professionnel' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {client.clientType || 'Inconnu'}
                </span>
              } 
            />
            
            <DataRow label="Type de pièce d'identité" value={client.idType || 'N/A'} />
            <DataRow label="Numéro de la carte" value={client.idNumber || 'N/A'} />
            <DataRow label="Date de naissance" value={formatDate(client.dateOfBirth)} />
            <DataRow label="Genre" value={client.gender || 'N/A'} />
            <DataRow label="Statut matrimonial" value={client.maritalStatus || 'N/A'} />
            <DataRow label="Nombre d'enfants" value={client.numberOfChildren !== undefined ? client.numberOfChildren : 'N/A'} />
            <DataRow label="Profession" value={client.profession || 'N/A'} />
            <DataRow label="Statut de conducteur" value={client.isDriver ? 'Conducteur' : 'Non-conducteur'} />
          </dl>
        </div>
      </div>
    );
  };