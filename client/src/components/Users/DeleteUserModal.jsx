import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { translations } from '../../shared/translations'
import { useState } from 'react'


export const DeleteUserModal = ({ isOpen, onClose, onDelete, userData }) => {
  const [currentlangage, setCurrentLangage] = useState(localStorage.getItem('lang'))

  if (!isOpen) return null

  const handleDelete = () => {
    onDelete(userData._id)
    onClose()
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-[#1e255f7b] bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md border border-gray-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrashIcon className="h-6 w-6 text-red-600" />
            {translations[currentlangage].deleteUser}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-gray-700">
            {translations[currentlangage].deleteConfirmation}{' '}
            <span className="font-semibold text-[#1E265F]">
              {userData?.username}
            </span>
            ? {translations[currentlangage].deleteWarning}
          </p>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {translations[currentlangage].cancel}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            {translations[currentlangage].deleteUser}
          </button>
        </div>
      </div>
    </div>
  )
}

