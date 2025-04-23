import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import logo from '../../assets/logo.png'
import { translations } from '../../shared/translations'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../Auth/authSlice'
import { axiosClient } from '../../service/axiosClient'
import { logoutUser } from '../../service/authservice'



function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  console.log(user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [currentlangage, setCurrentLangage] = useState(localStorage.getItem('lang') )

  const navigation = [
    { name: translations[currentlangage].dashboard, href: '/', icon: HomeIcon },
    { name: translations[currentlangage].clients, href: '/clients', icon: UsersIcon },
    { name: translations[currentlangage].assuranceCases, href: '/assurance-cases', icon: DocumentDuplicateIcon },
    { name: translations[currentlangage].payments, href: '/payments', icon: CurrencyDollarIcon },
    { name: translations[currentlangage].documents, href: '/documents', icon: DocumentTextIcon },
    {name : translations[currentlangage].userManagement, href: '/user-management', icon: UserGroupIcon},
  ]
  const handleLogout = async () => {
    const res = await logoutUser()
    if (res.status === 200) {   
    dispatch(logout())
    navigate('/login')
    }
  }
  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">{translations[currentlangage].closeSidebar}</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component for mobile */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#1E265F] px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                      <img className="h-8 w-auto" src={logo} alt="RMA Logo" />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  className={classNames(
                                    location.pathname === item.href
                                      ? 'bg-[#272F65] text-white'
                                      : 'text-gray-300 hover:text-white hover:bg-[#272F65]',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                  )}
                                >
                                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#1E265F] px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <img className="h-8 w-auto" src={logo} alt="RMA Logo" />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={classNames(
                            location.pathname === item.href
                              ? 'bg-[#272F65] text-white'
                              : 'text-gray-300 hover:text-white hover:bg-[#272F65]',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
              <button
      onClick={handleLogout}
      className="w-full text-left text-gray-300 hover:text-white hover:bg-[#272F65] group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0 text-white group-hover:text-white" />
      <span className="text-sm font-medium text-white group-hover:text-red-600 hidden lg:inline">
        {translations[currentlangage].logout}
      </span>
    </button>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">{translations[currentlangage].openSidebar}</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1"></div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* User Info and Logout */}
                <div className="flex items-center gap-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                    
                  </div>
                  <span className={`w-2 h-2 rounded-full ${user?.status === 'Actif' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                 
                </div>
              </div>
            </div>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}