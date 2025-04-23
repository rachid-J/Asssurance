import { useState, useEffect } from 'react'
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { translations } from '../../shared/translations'

export const EditUserModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [currentlangage, setCurrentLangage] = useState(localStorage.getItem('lang') )

  useEffect(() => {
    if (isOpen) {
      const { password, ...rest } = initialData || {}
      setFormData({ username: '', email: '', ...rest, password: '' })
      setErrors({})
    }
  }, [isOpen, initialData])
  

  const validate = () => {
    const newErrors = {}
    if (!formData.username.trim()) newErrors.username = translations[currentlangage].usernameRequired
    if (!formData.email.trim()) {
      newErrors.email = translations[currentlangage].emailRequired
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = translations[currentlangage].emailInvalid
    }
    if (!formData.password.trim()) newErrors.password = translations[currentlangage].passwordRequired
    if (formData.password.length < 8) newErrors.password = translations[currentlangage].passwordTooShort
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-[#1e255f7b] bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md border border-gray-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserPlusIcon className="h-6 w-6 text-[#1E265F]" />
            {translations[currentlangage].editUser}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{translations[currentlangage].username} *</label>
              <input
                type="text"
                className={`w-full rounded border px-3 py-2 ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-[#1E265F]`}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{translations[currentlangage].email}</label>
              <input
                type="email"
                className={`w-full rounded border px-3 py-2 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-[#1E265F]`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{translations[currentlangage].passwordLabel} *</label>
              <input
                name="password"
                type="password"
                className={`w-full rounded border px-3 py-2 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-[#1E265F]`}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              {translations[currentlangage].cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1E265F] text-white rounded hover:bg-[#272F65]"
            >
              {translations[currentlangage].saveUser}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}