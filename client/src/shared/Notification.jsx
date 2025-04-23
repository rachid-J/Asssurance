import React from 'react';

export const Notification = ({ notifications = [], socketConnected }) => {
  if ((!notifications || notifications.length === 0) && socketConnected !== false) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Server connection status notification */}
      {socketConnected === false && (
        <div className="p-4 rounded-lg shadow-lg text-white bg-red-500 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Server Connection Lost</p>
            <p className="text-sm opacity-90">Some features may not work properly. Reconnecting...</p>
          </div>
        </div>
      )}
      
      {/* Other notifications */}
      {notifications && notifications.length > 0 && notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg text-white ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};