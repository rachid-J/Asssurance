import { useState } from 'react'
import { MagnifyingGlassIcon, PlusIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

const payments = [
  {
    id: 1,
    clientName: 'Ahmed Hassan',
    policy: 'POL-2025001',
    installmentNumber: '1',
    amount: 4500,
    dueDate: '2025-04-15',
    status: 'Paid',
    paymentDate: '2025-04-14',
  },
  {
    id: 2,
    clientName: 'Ahmed Hassan',
    policy: 'POL-2025001',
    installmentNumber: '2',
    amount: 4500,
    dueDate: '2025-07-15',
    status: 'Pending',
    paymentDate: null,
  },
  // More payments will be added here
]

export default function PaymentsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('dueDate')
  const [sortDirection, setSortDirection] = useState('asc')

  const sortedPayments = [...payments].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] < b[sortField] ? -1 : 1
    }
    return a[sortField] > b[sortField] ? -1 : 1
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
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track all payments and installments for insurance policies.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-[#1E265F] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#272F65] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E265F]"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6 relative">
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            name="search"
            className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#1E265F] sm:text-sm sm:leading-6"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                      onClick={() => handleSort('clientName')}
                    >
                      Client
                      <SortIcon field="clientName" />
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('policy')}
                    >
                      Policy
                      <SortIcon field="policy" />
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('installmentNumber')}
                    >
                      Installment
                      <SortIcon field="installmentNumber" />
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
                      onClick={() => handleSort('dueDate')}
                    >
                      Due Date
                      <SortIcon field="dueDate" />
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      <SortIcon field="status" />
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
                      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      payment.policy.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((payment) => (
                      <tr key={payment.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {payment.clientName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{payment.policy}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{payment.installmentNumber}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{payment.amount} MAD</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{payment.dueDate}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium
                            ${payment.status === 'Paid' 
                              ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                              : 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                            }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {payment.paymentDate || '-'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a href="#" className="text-[#1E265F] hover:text-[#272F65]">
                            Edit<span className="sr-only">, {payment.policy}</span>
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