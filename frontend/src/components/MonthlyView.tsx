/**
 * Monthly View Component - Financial Statement Style
 * Clean financial dashboard with drill-down capabilities
 */

import { useState, useEffect } from 'react';
import { Job, formatCurrency } from '../utils/calculations';
import { calculateMonthlyBreakdown, calculateFiscalYearMonthlyBreakdown, MonthlyBreakdown, calculateJobMonthlyDistribution } from '../utils/monthlyCalculations';

interface MonthlyViewProps {
  jobs: Job[];
  viewType?: 'rolling12' | 'fiscal';
  fiscalYear?: number;
}

interface DrillDownData {
  month: string;
  monthLabel: string;
  type: 'revenue' | 'cost' | 'profit';
  total: number;
  jobs: Array<{
    id: number;
    jobName: string;
    market: string;
    type: 'Backlog' | 'SWAG';
    probability: number;
    amount: number;
    percentage: number;
    totalRevenue: number;
    totalCost: number;
    startDate: string;
    endDate: string;
  }>;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ 
  jobs, 
  viewType = 'rolling12', 
  fiscalYear 
}) => {
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [selectedJobTimeline, setSelectedJobTimeline] = useState<{
    job: any;
    monthlyBreakdown: Array<{
      month: string;
      monthLabel: string;
      revenue: number;
      cost: number;
      profit: number;
      isStartMonth: boolean;
      isEndMonth: boolean;
    }>;
  } | null>(null);
  
  // Calculate monthly breakdown based on view type
  const monthlyData: MonthlyBreakdown = viewType === 'fiscal' && fiscalYear
    ? calculateFiscalYearMonthlyBreakdown(jobs, fiscalYear)
    : calculateMonthlyBreakdown(jobs, 12);

  // Handle cell click for drill-down
  const handleCellClick = (month: any, type: 'revenue' | 'cost' | 'profit') => {
    const monthJobs = month.jobs.map((job: any) => {
      const amount = type === 'revenue' ? job.monthlyRevenue : 
                    type === 'cost' ? job.monthlyCost : 
                    job.monthlyRevenue - job.monthlyCost;
      
      return {
        id: job.id,
        jobName: job.jobName,
        market: job.market,
        type: job.type,
        probability: job.probability,
        amount: amount,
        percentage: month[type] !== 0 ? (amount / month[type]) * 100 : 0,
        totalRevenue: job.totalRevenue,
        totalCost: job.totalCost,
        startDate: job.startDate,
        endDate: job.endDate
      };
    }).filter(job => job.amount !== 0) // Only show jobs that contribute to this metric
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending

    setDrillDownData({
      month: month.month,
      monthLabel: month.monthLabel,
      type,
      total: month[type],
      jobs: monthJobs
    });
  };

  // Handle job timeline view
  const handleJobClick = (job: any) => {
    const timeline = calculateJobMonthlyDistribution(job);
    setSelectedJobTimeline({
      job,
      monthlyBreakdown: timeline
    });
    setDrillDownData(null); // Close drill-down modal
  };

  // Calculate totals for the rightmost column
  const totals = {
    revenue: monthlyData.months.reduce((sum, month) => sum + month.revenue, 0),
    cost: monthlyData.months.reduce((sum, month) => sum + month.cost, 0),
    profit: monthlyData.months.reduce((sum, month) => sum + month.profit, 0)
  };

  const profitMargin = totals.revenue !== 0 ? (totals.profit / totals.revenue) * 100 : 0;

  // ESC key handler for closing modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedJobTimeline) {
          setSelectedJobTimeline(null);
        } else if (drillDownData) {
          setDrillDownData(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [drillDownData, selectedJobTimeline]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-1">
              Monthly Financial View
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              {viewType === 'fiscal' ? `FY ${fiscalYear}-${((fiscalYear || 0) + 1).toString().slice(-2)}` : 'Rolling 12 Months'}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Statement Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Financial Statement</h2>
          <p className="text-sm text-gray-600 mt-1">Click any cell to see contributing jobs</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">Metric</th>
                {monthlyData.months.map((month) => (
                  <th key={month.month} className="px-4 py-4 text-center text-sm font-semibold text-gray-900 min-w-32">
                    {month.monthLabel}
                  </th>
                ))}
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-32 bg-blue-50">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Revenue Row */}
              <tr className="hover:bg-green-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-green-50">
                  Revenue
                </td>
                {monthlyData.months.map((month) => (
                  <td 
                    key={`revenue-${month.month}`}
                    className="px-4 py-4 text-center text-sm font-medium text-green-700 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => handleCellClick(month, 'revenue')}
                  >
                    {formatCurrency(month.revenue)}
                  </td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-bold text-green-700 bg-green-100">
                  {formatCurrency(totals.revenue)}
                </td>
              </tr>

              {/* Cost Row */}
              <tr className="hover:bg-red-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-red-50">
                  Cost
                </td>
                {monthlyData.months.map((month) => (
                  <td 
                    key={`cost-${month.month}`}
                    className="px-4 py-4 text-center text-sm font-medium text-red-700 cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => handleCellClick(month, 'cost')}
                  >
                    ({formatCurrency(month.cost)})
                  </td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-bold text-red-700 bg-red-100">
                  ({formatCurrency(totals.cost)})
                </td>
              </tr>

              {/* Profit Row */}
              <tr className="hover:bg-blue-50/50 transition-colors border-t-2 border-gray-300">
                <td className="px-6 py-4 text-sm font-bold text-gray-900 bg-blue-50">
                  Profit
                </td>
                {monthlyData.months.map((month) => (
                  <td 
                    key={`profit-${month.month}`}
                    className={`px-4 py-4 text-center text-sm font-bold cursor-pointer hover:bg-blue-100 transition-colors ${
                      month.profit >= 0 ? 'text-blue-700' : 'text-red-700'
                    }`}
                    onClick={() => handleCellClick(month, 'profit')}
                  >
                    {formatCurrency(month.profit)}
                  </td>
                ))}
                <td className={`px-6 py-4 text-center text-sm font-bold bg-blue-100 ${
                  totals.profit >= 0 ? 'text-blue-700' : 'text-red-700'
                }`}>
                  {formatCurrency(totals.profit)}
                </td>
              </tr>

              {/* Margin Row */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                  Margin %
                </td>
                {monthlyData.months.map((month) => {
                  const margin = month.revenue !== 0 ? (month.profit / month.revenue) * 100 : 0;
                  return (
                    <td 
                      key={`margin-${month.month}`}
                      className={`px-4 py-4 text-center text-xs font-medium ${
                        margin >= 20 ? 'text-green-600' : 
                        margin >= 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}
                    >
                      {margin.toFixed(1)}%
                    </td>
                  );
                })}
                <td className={`px-6 py-4 text-center text-xs font-bold ${
                  profitMargin >= 20 ? 'text-green-600' : 
                  profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {profitMargin.toFixed(1)}%
                </td>
              </tr>

              {/* Markup Row */}
              <tr className="bg-gray-100">
                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                  Markup %
                </td>
                {monthlyData.months.map((month) => {
                  const markup = month.cost !== 0 ? (month.profit / month.cost) * 100 : 0;
                  return (
                    <td 
                      key={`markup-${month.month}`}
                      className={`px-4 py-4 text-center text-xs font-medium ${
                        markup >= 30 ? 'text-green-600' : 
                        markup >= 15 ? 'text-yellow-600' : 'text-red-600'
                      }`}
                    >
                      {markup.toFixed(1)}%
                    </td>
                  );
                })}
                <td className={`px-6 py-4 text-center text-xs font-bold ${
                  totals.cost !== 0 ? 
                    ((totals.profit / totals.cost) * 100) >= 30 ? 'text-green-600' : 
                    ((totals.profit / totals.cost) * 100) >= 15 ? 'text-yellow-600' : 'text-red-600'
                  : 'text-gray-600'
                }`}>
                  {totals.cost !== 0 ? ((totals.profit / totals.cost) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-Down Modal */}
      {drillDownData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {drillDownData.monthLabel} {drillDownData.type.charAt(0).toUpperCase() + drillDownData.type.slice(1)} Breakdown
                  </h3>
                  <p className="text-lg font-semibold mt-1 text-gray-700">
                    Total: {formatCurrency(drillDownData.total)}
                  </p>
                </div>
                <button
                  onClick={() => setDrillDownData(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Jobs Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Market
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % of Total
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drillDownData.jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{job.jobName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {job.market}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.type === 'Backlog' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.type} {job.type === 'SWAG' && `(${job.probability}%)`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(job.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-600">{job.percentage.toFixed(1)}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(job.percentage, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleJobClick(job)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View Timeline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {drillDownData.jobs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No jobs contribute to {drillDownData.type} in {drillDownData.monthLabel}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Job Timeline Modal */}
      {selectedJobTimeline && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedJobTimeline.job.jobName}</h3>
                  <p className="text-gray-600">{selectedJobTimeline.job.market} • {selectedJobTimeline.job.type}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Total: {formatCurrency(selectedJobTimeline.job.totalRevenue)} Revenue • {formatCurrency(selectedJobTimeline.job.totalCost)} Cost
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJobTimeline(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Timeline Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profit
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedJobTimeline.monthlyBreakdown.map((month) => (
                      <tr key={month.month} className={`${
                        month.isStartMonth || month.isEndMonth ? 'bg-blue-50' : ''
                      }`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{month.monthLabel}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900">{formatCurrency(month.revenue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900">{formatCurrency(month.cost)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${
                            month.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(month.profit)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {month.isStartMonth && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Start
                            </span>
                          )}
                          {month.isEndMonth && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              End
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
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

export default MonthlyView;