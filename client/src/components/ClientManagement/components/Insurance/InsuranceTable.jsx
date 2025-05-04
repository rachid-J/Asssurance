// components/InsuranceTable.js
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { InsuranceTableRow } from "./InsuranceTableRow";

export const InsuranceTable = ({ insurances, navigate, formatDate }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Informations de l'insurance
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Période
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Financier
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {insurances.map((insurance) => (
            <InsuranceTableRow 
              key={insurance._id}
              insurance={insurance}
              navigate={navigate}
              formatDate={formatDate}
              isExpanded={expandedRows[insurance._id] || false}
              toggleExpansion={() => toggleRowExpansion(insurance._id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};