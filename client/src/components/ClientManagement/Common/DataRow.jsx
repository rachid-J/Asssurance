export const DataRow = ({ label, value }) => {
    return (
      <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
          {value}
        </dd>
      </div>
    );
  };
  