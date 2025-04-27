export const ClientHeader = ({ client }) => {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {client.title} {client.firstName} {client.name}
        </h1>
        <p className="text-sm text-gray-600">
          {client.clientType} • {client.isDriver ? 'Driver' : 'Non-Driver'} • Card: {client.idNumber || 'N/A'}
        </p>
      </div>
    );
  };