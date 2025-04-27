import { TruckIcon } from "@heroicons/react/24/outline";

export const EmptyVehiclesState = () => (
    <div className="text-center py-12 border-t border-gray-200">
      <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Start by adding a new vehicle for this client.
      </p>
    </div>
  );