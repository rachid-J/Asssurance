export const TabButton = ({ id, activeTab, onClick, label }) => {
    return (
      <button
        onClick={onClick}
        className={`
          pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
          ${activeTab === id
            ? 'border-[#1E265F] text-[#1E265F]'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
        `}
      >
        {label}
      </button>
    );
  };