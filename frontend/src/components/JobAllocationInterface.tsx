/**
 * Job Allocation Interface Component
 * Handles monthly allocation with actuals vs projections
 */

import { useState, useEffect } from 'react';
import { JobWithAllocations, AllocationUpdate, AllocationType } from '../utils/allocationTypes';
import { formatCurrency } from '../utils/calculations';
import { formatMonthLabel, getFiscalYearInfo } from '../utils/dateUtils';
import { allocationService } from '../services/allocationService';

interface JobAllocationInterfaceProps {
  job: JobWithAllocations;
  onJobUpdate: (updatedJob: JobWithAllocations) => void;
  onClose: () => void;
}

const JobAllocationInterface: React.FC<JobAllocationInterfaceProps> = ({
  job,
  onJobUpdate,
  onClose
}) => {
  const [currentJob, setCurrentJob] = useState<JobWithAllocations>(job);
  const [viewMode, setViewMode] = useState<'fiscal_year' | 'job_duration'>('fiscal_year');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(getFiscalYearInfo().current);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [inputValues, setInputValues] = useState<{[key: string]: {revenue: string, cost: string}}>({});
  
  // Helper functions for number formatting
  const formatNumberWithCommas = (num: number): string => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };
  
  const parseFormattedNumber = (str: string): number => {
    // Remove commas and parse as float
    return parseFloat(str.replace(/,/g, '')) || 0;
  };
  
  const getInputValue = (month: string, field: 'revenue' | 'cost'): string => {
    return inputValues[month]?.[field] || '';
  };
  
  const getDisplayValue = (allocation: any, field: 'revenue' | 'cost'): string => {
    const inputVal = getInputValue(allocation.month, field);
    if (inputVal) return inputVal;
    
    const numVal = field === 'revenue' ? allocation.allocatedRevenue : allocation.allocatedCost;
    return formatNumberWithCommas(numVal);
  };

  // Reset to original job when component mounts or job changes
  useEffect(() => {
    setCurrentJob(job);
  }, [job]);

  // Initialize job allocations based on view mode
  useEffect(() => {
    let initializedJob: JobWithAllocations;
    
    if (viewMode === 'fiscal_year') {
      initializedJob = allocationService.initializeFiscalYearAllocations(currentJob, selectedFiscalYear);
    } else {
      initializedJob = allocationService.initializeJobDurationAllocations(currentJob);
    }
    
    setCurrentJob(initializedJob);
    setInputValues({}); // Clear input values when view changes
  }, [viewMode, selectedFiscalYear, currentJob.id]); // Add currentJob.id to avoid infinite loops

  // Get visible months based on view mode
  const getVisibleMonths = () => {
    if (viewMode === 'fiscal_year') {
      return allocationService.getFiscalYearOverlapMonths(currentJob, selectedFiscalYear);
    } else {
      return allocationService.getAvailableMonths(currentJob);
    }
  };

  const visibleMonths = getVisibleMonths();
  const visibleAllocations = currentJob.monthlyAllocations.filter(a => 
    visibleMonths.includes(a.month)
  );


  // Handle allocation update
  const handleAllocationUpdate = (month: string, field: 'revenue' | 'cost', value: string) => {
    // Update input values for display
    setInputValues(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [field]: value
      }
    }));
  };

  // Handle input blur (when user finishes editing)
  const handleInputBlur = (month: string, field: 'revenue' | 'cost') => {
    const inputVal = getInputValue(month, field);
    const numValue = parseFormattedNumber(inputVal);
    const allocation = currentJob.monthlyAllocations.find(a => a.month === month);
    
    const update: AllocationUpdate = {
      month,
      [field]: numValue,
      allocationType: allocation?.allocationType || 'projection'
    };

    const result = allocationService.updateMonthlyAllocation(currentJob, update);
    
    if (result.success && result.job) {
      setCurrentJob(result.job);
      setUnsavedChanges(true);
      
      // Clear the input value so it shows the formatted value from allocation
      setInputValues(prev => ({
        ...prev,
        [month]: {
          ...prev[month],
          [field]: ''
        }
      }));
    } else {
      // Show validation errors
      console.error('Allocation update failed:', result.errors);
      alert(`Error: ${result.errors?.join(', ')}`);
      
      // Revert input to original value
      const allocation = currentJob.monthlyAllocations.find(a => a.month === month);
      const originalVal = field === 'revenue' ? allocation?.allocatedRevenue || 0 : allocation?.allocatedCost || 0;
      setInputValues(prev => ({
        ...prev,
        [month]: {
          ...prev[month],
          [field]: formatNumberWithCommas(originalVal)
        }
      }));
    }
  };

  // Handle allocation type change (actual vs projection)
  const handleAllocationTypeChange = (month: string, type: AllocationType) => {
    const allocation = currentJob.monthlyAllocations.find(a => a.month === month);
    if (!allocation) return;

    const update: AllocationUpdate = {
      month,
      revenue: allocation.allocatedRevenue,
      cost: allocation.allocatedCost,
      allocationType: type
    };

    const result = allocationService.updateMonthlyAllocation(currentJob, update);
    
    if (result.success && result.job) {
      setCurrentJob(result.job);
      setUnsavedChanges(true);
    }
  };

  // Apply straight-line allocation
  const handleStraightLine = () => {
    const updatedJob = allocationService.applyStraightLineAllocation(currentJob, true);
    setCurrentJob(updatedJob);
    setUnsavedChanges(true);
    setInputValues({}); // Clear input values to show updated formatted values
  };

  // Clear projections
  const handleClearProjections = () => {
    if (window.confirm('Clear all projection allocations? Actuals will be preserved.')) {
      const updatedJob = allocationService.clearProjectionAllocations(currentJob);
      setCurrentJob(updatedJob);
      setUnsavedChanges(true);
      setInputValues({}); // Clear input values to show updated formatted values
    }
  };

  // Distribute remaining amounts
  const handleDistributeRemaining = () => {
    const updatedJob = allocationService.distributeRemainingAmounts(currentJob);
    setCurrentJob(updatedJob);
    setUnsavedChanges(true);
    setInputValues({}); // Clear input values to show updated formatted values
  };

  // Save changes
  const handleSave = () => {
    onJobUpdate(currentJob);
    setUnsavedChanges(false);
  };

  // Get allocation status styling
  const getStatusColor = (allocation: any) => {
    if (allocation.allocationType === 'actual') {
      return 'bg-blue-50 border-blue-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  const getStatusLabel = (allocation: any) => {
    return allocation.allocationType === 'actual' ? 'Actual' : 'Projection';
  };

  const getStatusLabelColor = (allocation: any) => {
    return allocation.allocationType === 'actual' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const summary = currentJob.allocationSummary;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-7xl shadow-lg rounded-md bg-white">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentJob.jobName}</h2>
              <p className="text-gray-600">{currentJob.market} • {currentJob.type}</p>
              <p className="text-sm text-gray-500">
                Duration: {formatMonthLabel(currentJob.startDate.substring(0, 7))} - {formatMonthLabel(currentJob.endDate.substring(0, 7))}
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('fiscal_year')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'fiscal_year'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Fiscal Year
                </button>
                <button
                  onClick={() => setViewMode('job_duration')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'job_duration'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Full Duration
                </button>
              </div>
              
              {/* Fiscal Year Selector */}
              {viewMode === 'fiscal_year' && (
                <select
                  value={selectedFiscalYear}
                  onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {[selectedFiscalYear - 1, selectedFiscalYear, selectedFiscalYear + 1].map(year => (
                    <option key={year} value={year}>
                      FY {year}-{(year + 1).toString().slice(-2)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</div>
              <div className="text-xs text-green-600">
                Allocated: {formatCurrency(summary.allocatedRevenue)} ({summary.allocationPercentageRevenue.toFixed(1)}%)
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Total Cost</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalCost)}</div>
              <div className="text-xs text-red-600">
                Allocated: {formatCurrency(summary.allocatedCost)} ({summary.allocationPercentageCost.toFixed(1)}%)
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-700">Remaining Revenue</div>
              <div className="text-2xl font-bold text-red-900">{formatCurrency(summary.remainingRevenue)}</div>
              <div className="text-xs text-red-600">
                {summary.remainingRevenue > 0 ? 'Needs allocation' : 'Fully allocated'}
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-700">Remaining Cost</div>
              <div className="text-2xl font-bold text-red-900">{formatCurrency(summary.remainingCost)}</div>
              <div className="text-xs text-red-600">
                {summary.remainingCost > 0 ? 'Needs allocation' : 'Fully allocated'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleStraightLine}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Straight Line
            </button>
            <button
              onClick={handleDistributeRemaining}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              disabled={summary.remainingRevenue === 0 && summary.remainingCost === 0}
            >
              Distribute Remaining
            </button>
            <button
              onClick={handleClearProjections}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Clear Projections
            </button>
          </div>

          {/* Monthly Allocation Grid */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Allocations</h3>
              <p className="text-sm text-gray-600">
                {viewMode === 'fiscal_year' 
                  ? `FY ${selectedFiscalYear}-${(selectedFiscalYear + 1).toString().slice(-2)}`
                  : 'Full Job Duration'
                }
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visibleAllocations.map((allocation) => {
                    const profit = allocation.allocatedRevenue - allocation.allocatedCost;
                    const isEditable = allocation.allocationType !== 'actual';
                    
                    return (
                      <tr key={allocation.month} className={getStatusColor(allocation)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {allocation.monthLabel}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={allocation.allocationType}
                            onChange={(e) => handleAllocationTypeChange(allocation.month, e.target.value as AllocationType)}
                            className="text-xs rounded px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="projection">Projection</option>
                            <option value="actual">Actual</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={getDisplayValue(allocation, 'revenue')}
                            onChange={(e) => handleAllocationUpdate(allocation.month, 'revenue', e.target.value)}
                            onBlur={() => handleInputBlur(allocation.month, 'revenue')}
                            disabled={!isEditable}
                            className={`text-sm w-32 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right ${
                              !isEditable ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="0"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={getDisplayValue(allocation, 'cost')}
                            onChange={(e) => handleAllocationUpdate(allocation.month, 'cost', e.target.value)}
                            onBlur={() => handleInputBlur(allocation.month, 'cost')}
                            disabled={!isEditable}
                            className={`text-sm w-32 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right ${
                              !isEditable ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="0"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(profit)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusLabelColor(allocation)}`}>
                            {getStatusLabel(allocation)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Status: <span className={`font-medium ${
                currentJob.allocationStatus === 'complete' ? 'text-green-600' :
                currentJob.allocationStatus === 'partial' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {currentJob.allocationStatus === 'complete' ? 'Fully Allocated' :
                 currentJob.allocationStatus === 'partial' ? 'Partially Allocated' : 'Not Started'}
              </span>
              {unsavedChanges && <span className="ml-2 text-orange-600">• Unsaved changes</span>}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!unsavedChanges}
                className={`px-6 py-2 text-sm font-medium text-white rounded-md ${
                  unsavedChanges 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAllocationInterface;