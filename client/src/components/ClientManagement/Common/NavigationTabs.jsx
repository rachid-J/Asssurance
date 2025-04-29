import { TabButton } from "./TabButton";

export const NavigationTabs = ({ activeTab, setActiveTab, isDriver, vehiclesCount }) => {
    return (
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <TabButton 
            id="personal" 
            activeTab={activeTab} 
            onClick={() => setActiveTab('personal')}
            label="Personal Information"
          />
          <TabButton 
            id="contact" 
            activeTab={activeTab} 
            onClick={() => setActiveTab('contact')}
            label="Contact Details"
          />
          {isDriver && (
            <TabButton 
              id="license" 
              activeTab={activeTab} 
              onClick={() => setActiveTab('license')}
              label="License Information"
            />
          )}
          <TabButton 
            id="insurance" 
            activeTab={activeTab} 
            onClick={() => setActiveTab('insurance')}
            label="insurance Information"
          />
          <TabButton 
            id="vehicles" 
            activeTab={activeTab} 
            onClick={() => setActiveTab('vehicles')}
            label={`Vehicles (${vehiclesCount})`}
          />
        </nav>
      </div>
    );
  };