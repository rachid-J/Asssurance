import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getInsurances, getInsuranceStats, getInsuranceTotals } from '../../service/insuranceservice';
import PaymentService from '../../service/paymentService';

const Reports = () => {
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    period: 'all',
    createdBy: user?.role === 'admin' ? '' : user?._id || ''
  });
  const [insurances, setInsurances] = useState([]);
  const [totals, setTotals] = useState({ count: 0, primeTTC: 0 });
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [insurancesRes, totalsRes, statsRes] = await Promise.all([
          getInsurances(filters),
          getInsuranceTotals(filters),
          getInsuranceStats(filters)
        ]);
        setInsurances(insurancesRes);
        setTotals(totalsRes);
        setStats(statsRes);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters, user?.role]);

  // Date formatting helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Simple chart rendering
  const renderBarChart = (data) => {
    const maxValue = Math.max(...data.map(item => item.count)) || 1;
    return (
      <div className="chart-container">
        {data.map((item, index) => (
          <div key={index} className="bar-item">
            <div className="bar-label">{item.name}</div>
            <div className="bar-wrapper">
              <div 
                className="bar" 
                style={{ width: `${(item.count / maxValue) * 100}%` }}
              >
                {item.count}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Start Date:</label>
          <input 
            type="date"
            value={filters.startDate}
            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>End Date:</label>
          <input 
            type="date"
            value={filters.endDate}
            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>Period:</label>
          <select
            value={filters.period}
            onChange={e => setFilters({ ...filters, period: e.target.value })}
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Policies</h3>
          <p>{loading ? 'Loading...' : totals.count}</p>
        </div>
        <div className="card">
          <h3>Total Prime TTC</h3>
          <p>{loading ? 'Loading...' : `${totals.primeTTC?.toFixed(2)} MAD`}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts">
        <div className="chart-card">
          <h3>Policies by Status</h3>
          {stats.length > 0 ? renderBarChart(stats) : <p>No data available</p>}
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <h2>Insurance Policies</h2>
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Policy Number</th>
                <th>Client</th>
                <th>Vehicle</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Prime TTC</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {insurances.map(insurance => (
                <tr key={insurance._id}>
                  <td>{insurance.policyNumber}</td>
                  <td>{insurance.clientName}</td>
                  <td>{insurance.vehicleInfo}</td>
                  <td>{formatDate(insurance.startDate)}</td>
                  <td>{formatDate(insurance.endDate)}</td>
                  <td>{insurance.primeTTC?.toFixed(2)}</td>
                  <td>{insurance.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .filters {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .card {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .chart-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        
        .chart-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .bar-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .bar-wrapper {
          flex-grow: 1;
          background: #eee;
          height: 30px;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .bar {
          background: #2196f3;
          height: 100%;
          padding: 0 10px;
          color: white;
          display: flex;
          align-items: center;
          transition: width 0.3s ease;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background: #f5f5f5;
        }
        
        tr:hover {
          background: #f9f9f9;
        }
      `}</style>
    </div>
  );
};

export default Reports;