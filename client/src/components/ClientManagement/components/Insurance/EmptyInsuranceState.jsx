// components/EmptyInsuranceState.js
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export const EmptyInsuranceState = () => (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No insurance policies found</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating a new insurance policy.</p>
    </div>
  );