import { useEffect, useState } from 'react'
import { MagnifyingGlassIcon, PlusIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'
import { createUser, deleteUser, getUsers, updateUser } from '../../service/Users'
import { AddUserModal } from './AddUserModal'
import { EditUserModal } from './EditUserModal'
import { DeleteUserModal } from './DeleteUserModal'
import io from 'socket.io-client'

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('asc')
  const [users, setUsers] = useState([])
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  

  const socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    auth: {
      token: localStorage.getItem('token') // Send JWT from storage
    }
  });
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await getUsers('/users')
        setUsers(response.data)
      } catch (error) {
        console.error('Error fetching users:', error)
        setError('Failed to load users. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
    socket.on('user-added', (newUser) => {
      setUsers(prevUsers => [...prevUsers, newUser])
    })

    socket.on('user-updated', (updatedUser) => {
      setUsers(prevUsers => prevUsers.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ))
    })

    socket.on('user-deleted', (deletedUserId) => {
      setUsers(prevUsers => prevUsers.filter(user => user._id !== deletedUserId))
    })

    // Cleanup function
    return () => {
      socket.off('user-added')
      socket.off('user-updated')
      socket.off('user-deleted')
    }
    
  }, [])

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

  const handleAddUser = async (user) => {
    try {
      const response = await createUser(user)
      setIsAddUserModalOpen(false)
    } catch (error) {
      console.error('Error creating user:', error)
      setError('Failed to create user. Please try again.')
    }
  }

  const handleUpdateUser = async (updatedUser) => {
    try {
      const response = await updateUser(updatedUser._id, updatedUser)
    
      setIsEditUserModalOpen(false)
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user. Please try again.')
    }
  }

  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser._id)
    
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Failed to delete user. Please try again.')
    }
  }

  const handleDeleteClick = (user) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleEditClick = (user) => {
    setSelectedUser(user)
    setIsEditUserModalOpen(true)
  }

  const filteredUsers = users.filter(user => {
    const username = user.username?.toLowerCase() ?? ''
    const email = user.email?.toLowerCase() ?? ''
    return (
      username.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    )
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    return sortDirection === 'asc'
      ? (aValue || 0) - (bValue || 0)
      : (bValue || 0) - (aValue || 0)
  })

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSave={handleAddUser}
      />

      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onSave={handleUpdateUser}
        initialData={selectedUser}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteUser}
        userData={selectedUser}
      />

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all registered users and their permissions.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center justify-center rounded-md bg-[#1E265F] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#272F65]"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#1E265F] focus:border-[#1E265F]"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      {['username', 'email', 'role', 'status', 'createdAt'].map((field) => (
                        <th
                          key={field}
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleSort(field)}
                        >
                          {field === 'createdAt' ? 'Registration Date' : field.charAt(0).toUpperCase() + field.slice(1)}
                          <SortIcon field={field} />
                        </th>
                      ))}
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {sortedUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="px-3 py-4 text-sm text-gray-900">{user.username}</td>
                        <td className="px-3 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-3 py-4 text-sm text-gray-600">{user.role}</td>
                        <td className="px-3 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-3 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-[#1E265F] hover:text-[#272F65] mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}