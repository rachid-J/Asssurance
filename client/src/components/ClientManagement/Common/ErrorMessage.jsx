export const ErrorMessage = ({ error, message, onBack, isWarning = false }) => {
    const displayMessage = error || message;
    const colorClass = isWarning ? 'yellow' : 'red';
    
    return (
      <div className="p-4 sm:p-6">
        <div className={`bg-${colorClass}-50 border border-${colorClass}-200 text-${colorClass}-800 p-4 rounded-md`}>
          <p>{displayMessage}</p>
          <button
            onClick={onBack}
            className={`mt-2 text-${colorClass}-600 underline`}
          >
            Back to Client List
          </button>
        </div>
      </div>
    );
  };