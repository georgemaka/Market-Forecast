/**
 * Forecasts Page - Resource & Capacity Planning
 * Equipment utilization, operator demand, and capacity analysis
 */

import { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { calculateMonthlyBreakdown, calculateFiscalYearMonthlyBreakdown } from '../../utils/monthlyCalculations';
import { formatCurrency, getCurrentFiscalYear } from '../../utils/calculations';

interface EquipmentRequirement {
  type: string;
  required: number;
  available: number;
  utilization: number;
  status: 'optimal' | 'overloaded' | 'underutilized';
}

interface MonthlyResourceForecast {
  month: string;
  monthLabel: string;
  equipment: {
    [key: string]: EquipmentRequirement;
  };
  operators: {
    required: number;
    available: number;
    shortage: number;
  };
  totalRevenue: number;
  jobCount: number;
}

const Forecasts = () => {
  const [forecastData, setForecastData] = useState<MonthlyResourceForecast[]>([]);
  const [viewType, setViewType] = useState<'6month' | 'fiscal'>('6month');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [currentFiscalYear] = useState(getCurrentFiscalYear());

  // Equipment definitions by market
  const equipmentByMarket = {
    'Environmental': {
      'Excavators': { ratio: 0.8, priority: 'high' },
      'Dozers': { ratio: 0.6, priority: 'medium' },
      'Compactors': { ratio: 0.4, priority: 'medium' },
      'Graders': { ratio: 0.2, priority: 'low' },
      'Scrapers': { ratio: 0.3, priority: 'low' }
    },
    'Solar': {
      'Excavators': { ratio: 0.5, priority: 'medium' },
      'Pile Drivers': { ratio: 1.0, priority: 'high' },
      'Compactors': { ratio: 0.6, priority: 'high' },
      'Graders': { ratio: 0.3, priority: 'medium' },
      'Dozers': { ratio: 0.4, priority: 'low' }
    },
    'Residential': {
      'Excavators': { ratio: 0.6, priority: 'high' },
      'Compactors': { ratio: 0.5, priority: 'medium' },
      'Graders': { ratio: 0.4, priority: 'medium' },
      'Scrapers': { ratio: 0.2, priority: 'low' },
      'Dozers': { ratio: 0.3, priority: 'low' }
    },
    'Public Works': {
      'Graders': { ratio: 0.8, priority: 'high' },
      'Compactors': { ratio: 0.7, priority: 'high' },
      'Excavators': { ratio: 0.6, priority: 'medium' },
      'Scrapers': { ratio: 0.5, priority: 'medium' },
      'Dozers': { ratio: 0.4, priority: 'low' }
    }
  };

  // Current equipment inventory (you can make this configurable later)
  const equipmentInventory = {
    'Excavators': 12,
    'Dozers': 8,
    'Compactors': 6,
    'Graders': 4,
    'Scrapers': 5,
    'Pile Drivers': 3
  };

  // Calculate equipment requirements based on jobs
  const calculateEquipmentRequirements = (jobs: any[], month: string) => {
    const requirements: { [key: string]: number } = {};
    
    // Initialize all equipment types
    Object.keys(equipmentInventory).forEach(type => {
      requirements[type] = 0;
    });

    jobs.forEach(job => {
      if (job.monthlyRevenue > 0) {
        const marketEquipment = equipmentByMarket[job.market as keyof typeof equipmentByMarket];
        if (marketEquipment) {
          Object.entries(marketEquipment).forEach(([equipType, config]) => {
            // Calculate requirement based on job size and market type
            const jobSize = job.monthlyRevenue / 100000; // Normalize to 100k units
            const baseRequirement = jobSize * config.ratio;
            requirements[equipType] = (requirements[equipType] || 0) + baseRequirement;
          });
        }
      }
    });

    // Round up requirements and create status
    const equipmentStatus: { [key: string]: EquipmentRequirement } = {};
    Object.entries(requirements).forEach(([type, required]) => {
      const roundedRequired = Math.ceil(required);
      const available = equipmentInventory[type as keyof typeof equipmentInventory] || 0;
      const utilization = available > 0 ? (roundedRequired / available) * 100 : 0;
      
      let status: 'optimal' | 'overloaded' | 'underutilized' = 'optimal';
      if (utilization > 100) status = 'overloaded';
      else if (utilization < 50) status = 'underutilized';

      equipmentStatus[type] = {
        type,
        required: roundedRequired,
        available,
        utilization,
        status
      };
    });

    return equipmentStatus;
  };

  // Calculate operator requirements (simplified: 1 operator per heavy equipment)
  const calculateOperatorRequirements = (equipment: { [key: string]: EquipmentRequirement }) => {
    const heavyEquipment = ['Excavators', 'Dozers', 'Graders', 'Scrapers', 'Pile Drivers'];
    const required = heavyEquipment.reduce((sum, type) => {
      return sum + (equipment[type]?.required || 0);
    }, 0);
    
    const available = 45; // Current operator count (configurable later)
    const shortage = Math.max(0, required - available);

    return { required, available, shortage };
  };

  useEffect(() => {
    const jobs = dataService.getAllJobs();
    const monthlyData = viewType === 'fiscal' 
      ? calculateFiscalYearMonthlyBreakdown(jobs, currentFiscalYear)
      : calculateMonthlyBreakdown(jobs, 6);

    const resourceForecast: MonthlyResourceForecast[] = monthlyData.months.map(month => {
      const equipment = calculateEquipmentRequirements(month.jobs, month.month);
      const operators = calculateOperatorRequirements(equipment);

      return {
        month: month.month,
        monthLabel: month.monthLabel,
        equipment,
        operators,
        totalRevenue: month.revenue,
        jobCount: month.jobs.length
      };
    });

    setForecastData(resourceForecast);
  }, [viewType, currentFiscalYear]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overloaded': return 'text-red-600 bg-red-50';
      case 'underutilized': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overloaded': return '🚨';
      case 'underutilized': return '⚠️';
      default: return '✅';
    }
  };

  // Equipment detail modal
  const handleEquipmentClick = (equipmentType: string) => {
    setSelectedEquipment(equipmentType);
  };

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedEquipment) {
        setSelectedEquipment(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [selectedEquipment]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 via-green-50 to-emerald-50 rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H7a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent mb-1">
                Resource Forecast
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                Equipment utilization and capacity planning
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white rounded-xl p-1.5 shadow-lg border border-gray-200">
            <button
              onClick={() => setViewType('6month')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                viewType === '6month'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>6 Month View</span>
            </button>
            <button
              onClick={() => setViewType('fiscal')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                viewType === 'fiscal'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>Fiscal Year</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Equipment Utilization */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Equipment Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {forecastData.length > 0 
                  ? Math.round(forecastData.reduce((sum, month) => {
                      const avgUtil = Object.values(month.equipment).reduce((s, eq) => s + eq.utilization, 0) / Object.values(month.equipment).length;
                      return sum + avgUtil;
                    }, 0) / forecastData.length)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Peak Demand Month */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peak Demand Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {forecastData.length > 0 
                  ? forecastData.reduce((max, month) => 
                      month.totalRevenue > max.totalRevenue ? month : max
                    ).monthLabel 
                  : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Operator Shortage */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Max Operator Shortage</p>
              <p className="text-2xl font-bold text-red-600">
                {forecastData.length > 0 
                  ? Math.max(...forecastData.map(month => month.operators.shortage))
                  : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Revenue at Risk */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue at Risk</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(forecastData.reduce((sum, month) => {
                  const hasOverload = Object.values(month.equipment).some(eq => eq.status === 'overloaded');
                  return hasOverload ? sum + month.totalRevenue * 0.2 : sum; // 20% revenue at risk
                }, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Utilization Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Equipment Utilization Forecast</h2>
          <p className="text-sm text-gray-600 mt-1">Click equipment type for detailed breakdown</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Equipment</th>
                {forecastData.map((month) => (
                  <th key={month.month} className="px-4 py-4 text-center text-sm font-semibold text-gray-900 min-w-32">
                    {month.monthLabel}
                  </th>
                ))}
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">
                  Inventory
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.keys(equipmentInventory).map((equipType) => (
                <tr key={equipType} className="hover:bg-gray-50 transition-colors">
                  <td 
                    className="px-6 py-4 text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => handleEquipmentClick(equipType)}
                  >
                    {equipType}
                  </td>
                  {forecastData.map((month) => {
                    const equipment = month.equipment[equipType];
                    if (!equipment) return (
                      <td key={`${equipType}-${month.month}`} className="px-4 py-4 text-center text-sm text-gray-400">
                        0/0
                      </td>
                    );

                    return (
                      <td 
                        key={`${equipType}-${month.month}`}
                        className={`px-4 py-4 text-center text-sm font-medium cursor-pointer hover:bg-gray-100 ${getStatusColor(equipment.status)}`}
                        onClick={() => handleEquipmentClick(equipType)}
                      >
                        <div className="flex flex-col items-center">
                          <span>{equipment.required}/{equipment.available}</span>
                          <span className="text-xs">
                            {getStatusIcon(equipment.status)} {equipment.utilization.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 bg-blue-50">
                    {equipmentInventory[equipType as keyof typeof equipmentInventory]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operator Requirements */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Operator Requirements</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Metric</th>
                {forecastData.map((month) => (
                  <th key={month.month} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    {month.monthLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Required</td>
                {forecastData.map((month) => (
                  <td key={`req-${month.month}`} className="px-4 py-4 text-center text-sm font-medium text-gray-900">
                    {month.operators.required}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Available</td>
                {forecastData.map((month) => (
                  <td key={`avail-${month.month}`} className="px-4 py-4 text-center text-sm font-medium text-green-600">
                    {month.operators.available}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Shortage</td>
                {forecastData.map((month) => (
                  <td key={`short-${month.month}`} className={`px-4 py-4 text-center text-sm font-medium ${
                    month.operators.shortage > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {month.operators.shortage > 0 ? `+${month.operators.shortage}` : '✓'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedEquipment} Utilization Detail</h3>
                  <p className="text-gray-600">Current inventory: {equipmentInventory[selectedEquipment as keyof typeof equipmentInventory]} units</p>
                </div>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Required</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Utilization</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forecastData.map((month) => {
                      const equipment = month.equipment[selectedEquipment];
                      if (!equipment) return null;

                      return (
                        <tr key={month.month}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {month.monthLabel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {equipment.required}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {equipment.available}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {equipment.utilization.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              equipment.status === 'overloaded' ? 'bg-red-100 text-red-800' :
                              equipment.status === 'underutilized' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {equipment.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecasts;