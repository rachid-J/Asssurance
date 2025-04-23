import {
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

const stats = [
  { name: 'Total Clients', stat: '71', icon: UsersIcon },
  { name: 'Active Cases', stat: '124', icon: ClipboardDocumentListIcon },
  { name: 'Monthly Revenue', stat: '287,500 MAD', icon: CurrencyDollarIcon },
  { name: 'Pending Documents', stat: '12', icon: DocumentTextIcon },
]

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
      
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-[#1E265F] p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Clients */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Clients</h3>
            <div className="mt-6">
              <ul role="list" className="divide-y divide-gray-100">
                {[...Array(5)].map((_, index) => (
                  <li key={index} className="py-4">
                    <div className="flex items-center gap-x-3">
                      <div className="h-8 w-8 rounded-full bg-[#1E265F] flex items-center justify-center">
                        <UsersIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-6 text-gray-900">Client Name {index + 1}</p>
                        <p className="mt-1 truncate text-xs leading-5 text-gray-500">Policy: POL-{2025000 + index}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Payments</h3>
            <div className="mt-6">
              <ul role="list" className="divide-y divide-gray-100">
                {[...Array(5)].map((_, index) => (
                  <li key={index} className="py-4">
                    <div className="flex items-center justify-between gap-x-3">
                      <div className="flex min-w-0 gap-x-3">
                        <div className="h-8 w-8 rounded-full bg-[#1E265F] flex items-center justify-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-6 text-gray-900">Payment #{index + 1}</p>
                          <p className="mt-1 truncate text-xs leading-5 text-gray-500">Policy: POL-{2025000 + index}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-sm font-medium text-[#1E265F]">{(Math.random() * 10000).toFixed(2)} MAD</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}