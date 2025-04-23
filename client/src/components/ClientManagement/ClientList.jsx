import { useState } from 'react'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'

const clients = [
  {
    id: 1,
    name: 'Ahmed Hassan',
    policy: 'POL-2025001',
    type: 'AN',
    usage: 'C1',
    status: 'Active',
    lastPayment: '2025-04-15',
  },
  {
    id: 2,
    name: 'Ahmed Hassan',
    policy: 'POL-2025001',
    type: 'REN',
    usage: 'C2',
    status: 'Active',
    lastPayment: '2025-04-15',
  },
  {
    id: 3,
    name: 'Ahmed Hassan',
    policy: 'POL-2025001',
    type: 'RP',
    usage: 'D',
    status: 'Active',
    lastPayment: '2025-04-15',
  },
  {
    id: 4,
    name: 'Ahmed Hassan',
    policy: 'POL-2025001',
    type: 'CV',
    usage: 'P',
    status: 'Active',
    lastPayment: '2025-04-15',
  },{
    id: 5,
    name: 'Ahmed Hassan',
    policy: 'POL-2025001',
    type: 'CI',
    usage: 'E',
    status: 'Active',
    lastPayment: '2025-04-15',
  },{
    id: 6,
    name: 'Ahmed Hassan',
    policy: 'POL-2025001',
    type: 'REN',
    usage: 'A',
    status: 'Active',
    lastPayment: '2025-04-15',
  },
  // Add more sample clients here
]

export default function ClientList() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all clients including their name, policy number, type, and status.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-[#1E265F] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#272F65] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E265F]"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            Add client
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
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Policy Number
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Usage
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Last Payment
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {clients
                    .filter(client => 
                      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      client.policy.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((client) => (
                      <tr key={client.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {client.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.policy}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.type}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.usage}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium 
                            ${client.status === 'Active' 
                              ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                              : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                            }`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.lastPayment}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a href="#" className="text-[#1E265F] hover:text-[#272F65]">
                            Edit<span className="sr-only">, {client.name}</span>
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