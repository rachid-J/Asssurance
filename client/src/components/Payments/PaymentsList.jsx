import { useState } from 'react'
import { MagnifyingGlassIcon, PlusIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

const payments = [
  {
    _id: "1",
    policyId: "663071525000012",
    advanceNumber: 1,
    paymentDate: "2025-01-02",
    amount: 413.00
  },
  {
    _id: "2",
    policyId: "663071525000012",
    advanceNumber: 2,
    paymentDate: null,
    amount: 413.00
  },
]

export default function PaymentList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('paymentDate')
  const [sortDirection, setSortDirection] = useState('asc')

  const sortedPayments = [...payments].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    // Date comparison
    if (sortField === 'paymentDate') {
      const dateA = new Date(aValue)
      const dateB = new Date(bValue)
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    }

    // Numeric comparison
    if (['advanceNumber', 'amount'].includes(sortField)) {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    // Default string comparison
    return sortDirection === 'asc'
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString())
  })

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ArrowUpIcon className="h-4 w-4 inline-block ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 inline-block ml-1" />
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Insurance Payments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Insurance payment records and installment tracking
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-[#1E265F] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#272F65] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#1E265F]"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            Add Payment
          </button>
        </div>
      </div>

      <div className="mt-6 relative">
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            name="search"
            className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#1E265F] sm:text-sm sm:leading-6"
            placeholder="Search by Policy Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th onClick={() => handleSort('policyNumber')}>
                      Policy Number
                      <SortIcon field="policyNumber" />
                    </th>
                    <th onClick={() => handleSort('insuranceId')}>
                      Insurance ID
                      <SortIcon field="insuranceId" />
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('advanceNumber')}
                    >
                      Advance #
                      <SortIcon field="advanceNumber" />
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                      <SortIcon field="amount" />
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('paymentDate')}
                    >
                      Payment Date
                      <SortIcon field="paymentDate" />
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {sortedPayments
              .filter(payment => 
                payment.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((payment) => (
                <tr key={payment._id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {payment.policyNumber}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {payment.insuranceId}
                  </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {payment.advanceNumber}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {payment.amount.toFixed(2)} MAD
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {payment.paymentDate ?
                            new Date(payment.paymentDate).toLocaleDateString() :
                            <span className="text-yellow-600">Pending</span>
                          }
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a
                            href="#"
                            className="text-[#1E265F] hover:text-[#272F65]"
                          >
                            Edit
                          </a>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}