import { TruckIcon } from "@heroicons/react/24/outline";

export const EmptyVehiclesState = () => (
  <div className="text-center py-12 border-t border-gray-200">
    <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun véhicule trouvé</h3>
    <p className="mt-1 text-sm text-gray-500">
      Commencez par ajouter un nouveau véhicule pour ce client.
    </p>
  </div>
);