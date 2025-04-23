import { useState } from 'react'
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  DocumentIcon,
  DocumentArrowDownIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'

const documents = [
  {
    id: 1,
    name: 'Policy Document',
    type: 'PDF',
    policy: 'POL-2025001',
    clientName: 'Ahmed Hassan',
    uploadDate: '2025-04-15',
    comment: 'Original policy document',
    size: '2.4 MB',
  },
  {
    id: 2,
    name: 'Insurance Certificate',
    type: 'PDF',
    policy: 'POL-2025001',
    clientName: 'Ahmed Hassan',
    uploadDate: '2025-04-15',
    comment: 'Verified certificate',
    size: '1.1 MB',
  },
  // More documents will be added here
]

export default function DocumentsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track all insurance-related documents and comments.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-[#1E265F] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#272F65] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E265F]"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            Upload Document
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
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents
          .filter(doc => 
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.policy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.clientName.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((document) => (
            <div
              key={document.id}
              className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-[#1E265F] focus-within:ring-offset-2 hover:border-gray-400"
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-[#1E265F] flex items-center justify-center">
                  <DocumentIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <a href="#" className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">{document.name}</p>
                  <p className="truncate text-sm text-gray-500">
                    {document.policy} • {document.clientName}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{document.uploadDate}</span>
                      <span className="mx-2">•</span>
                      <span>{document.size}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="text-[#1E265F] hover:text-[#272F65]"
                        onClick={() => {
                          setSelectedDocument(document)
                          setShowCommentModal(true)
                        }}
                      >
                        <ChatBubbleLeftIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className="text-[#1E265F] hover:text-[#272F65]"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          ))}
      </div>

      {/* Comment Modal */}
      {showCommentModal && selectedDocument && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Document Comments
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {selectedDocument.comment}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-[#1E265F] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#272F65] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E265F]"
                  onClick={() => setShowCommentModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}