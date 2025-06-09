/**
 * Monthly View Component - Financial Dashboard Style
 * Professional charts and data tables for monthly financial analysis
 */

import { useState } from 'react';
import { Job, formatCurrency } from '../utils/calculations';
import { calculateMonthlyBreakdown, calculateFiscalYearMonthlyBreakdown, MonthlyBreakdown, calculateJobMonthlyDistribution } from '../utils/monthlyCalculations';

interface MonthlyViewProps {
  jobs: Job[];
  viewType?: 'rolling12' | 'fiscal';
  fiscalYear?: number;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ 
  jobs, 
  viewType = 'rolling12', 
  fiscalYear 
}) => {
  const [showTable, setShowTable] = useState(false);
  const [selectedMonthJobs, setSelectedMonthJobs] = useState<{
    month: string;
    monthLabel: string;
    jobs: Array<{
      id: number;
      jobName: string;
      market: string;
      type: 'Backlog' | 'SWAG';
      probability: number;
      monthlyRevenue: number;
      monthlyCost: number;
      monthlyProfit: number;
      isStartMonth: boolean;
      isEndMonth: boolean;
      totalRevenue: number;
      totalCost: number;
      startDate: string;
      endDate: string;
    }>;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
  } | null>(null);

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
  
  // const trends = getMonthlyTrends(monthlyData); // Future use for trend analysis
  
  // Calculate global max values for consistent scaling
  const globalMaxRevenue = Math.max(...monthlyData.months.map(m => m.revenue));
  const globalMaxCost = Math.max(...monthlyData.months.map(m => m.cost));
  const globalMaxProfit = Math.max(...monthlyData.months.map(m => Math.abs(m.profit)));
  
  // Calculate month-over-month trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Handle job detail modal
  const handleJobsClick = (month: any) => {
    const monthJobs = month.jobs.map((job: any) => ({
      id: job.id,
      jobName: job.jobName,
      market: job.market,
      type: job.type,
      probability: job.probability,
      monthlyRevenue: job.monthlyRevenue,
      monthlyCost: job.monthlyCost,
      monthlyProfit: job.monthlyRevenue - job.monthlyCost,
      isStartMonth: job.isStartMonth,
      isEndMonth: job.isEndMonth,
      totalRevenue: job.totalRevenue,
      totalCost: job.totalCost,
      startDate: job.startDate,
      endDate: job.endDate
    }));

    setSelectedMonthJobs({
      month: month.month,
      monthLabel: month.monthLabel,
      jobs: monthJobs,
      totalRevenue: month.revenue,
      totalCost: month.cost,
      totalProfit: month.profit
    });
  };

  // Handle job timeline view
  const handleViewTimeline = (jobData: any) => {
    // Find the full job data from the jobs array
    const fullJob = jobs.find(j => j.id === jobData.id);
    if (!fullJob) return;

    // Calculate the full monthly breakdown for this job
    const monthlyBreakdown = calculateJobMonthlyDistribution(fullJob);
    
    setSelectedJobTimeline({
      job: fullJob,
      monthlyBreakdown: monthlyBreakdown.map(month => ({
        month: month.month,
        monthLabel: month.monthLabel,
        revenue: month.revenue,
        cost: month.cost,
        profit: month.profit,
        isStartMonth: month.isStartMonth,
        isEndMonth: month.isEndMonth
      }))
    });
  };
  
  // Calculate quarterly data
  interface QuarterData {
    name: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
    months: string;
    percentOfTotal: number;
  }
  
  const quarterlyData: QuarterData[] = [];
  for (let i = 0; i < monthlyData.months.length; i += 3) {
    const quarter = monthlyData.months.slice(i, i + 3);
    const qRevenue = quarter.reduce((sum, m) => sum + m.revenue, 0);
    const qCost = quarter.reduce((sum, m) => sum + m.cost, 0);
    const qProfit = qRevenue - qCost;
    const qMargin = qRevenue > 0 ? (qProfit / qRevenue) * 100 : 0;
    quarterlyData.push({
      name: `Q${Math.floor(i/3) + 1}`,
      revenue: qRevenue,
      cost: qCost,
      profit: qProfit,
      margin: qMargin,
      months: quarter.map(m => m.monthLabel.substring(0, 3)).join('-'),
      percentOfTotal: monthlyData.totalRevenue > 0 ? (qRevenue / monthlyData.totalRevenue) * 100 : 0
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl shadow-lg border border-gray-200/50 p-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="flex justify-between items-start relative">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Financial Dashboard
              </h2>
            </div>
            <p className="text-gray-600 font-medium">
              {viewType === 'fiscal' 
                ? `Fiscal Year ${fiscalYear}-${(fiscalYear! + 1).toString().slice(-2)} Monthly Analysis`
                : 'Rolling 12-Month Financial Performance'}
            </p>
          </div>
          
          {/* Enhanced View Toggle */}
          <div className="flex bg-white rounded-lg p-1 shadow-md border border-gray-200">
            <button
              onClick={() => setShowTable(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                !showTable 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md transform scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📊 Charts
            </button>
            <button
              onClick={() => setShowTable(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                showTable 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md transform scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📋 Data Table
            </button>
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedMonthJobs && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {selectedMonthJobs.monthLabel} Job Details
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {selectedMonthJobs.jobs.length} job{selectedMonthJobs.jobs.length !== 1 ? 's' : ''} • 
                    Total Revenue: {formatCurrency(selectedMonthJobs.totalRevenue)} • 
                    Total Profit: {formatCurrency(selectedMonthJobs.totalProfit)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMonthJobs(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Job List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Details
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Revenue
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Cost
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Profit
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedMonthJobs.jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">{job.jobName}</div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                job.type === 'Backlog' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {job.type}
                              </span>
                              <span className="text-xs text-gray-500">{job.market}</span>
                              {job.probability < 100 && (
                                <span className="text-xs text-gray-500">({job.probability}% probability)</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Duration: {job.startDate} to {job.endDate}
                              {job.isStartMonth && <span className="ml-2 text-green-600">▶ Start</span>}
                              {job.isEndMonth && <span className="ml-2 text-red-600">◼ End</span>}
                            </div>
                            <div className="text-xs text-gray-500">
                              Total: {formatCurrency(job.totalRevenue)} revenue, {formatCurrency(job.totalCost)} cost
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          {formatCurrency(job.monthlyRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          {formatCurrency(job.monthlyCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={job.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(job.monthlyProfit)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {job.isStartMonth && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Starting
                              </span>
                            )}
                            {job.isEndMonth && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Ending
                              </span>
                            )}
                            {!job.isStartMonth && !job.isEndMonth && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button 
                            onClick={() => handleViewTimeline(job)}
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

              {/* Modal Footer */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {selectedMonthJobs.jobs.length} job{selectedMonthJobs.jobs.length !== 1 ? 's' : ''} for {selectedMonthJobs.monthLabel}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedMonthJobs(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Export Month Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Timeline Modal */}
      {selectedJobTimeline && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-7xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Timeline Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {selectedJobTimeline.job.jobName} - Full Timeline
                  </h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedJobTimeline.job.type === 'Backlog' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedJobTimeline.job.type}
                    </span>
                    <span className="text-sm text-gray-600">{selectedJobTimeline.job.market}</span>
                    {selectedJobTimeline.job.probability < 100 && (
                      <span className="text-sm text-gray-600">({selectedJobTimeline.job.probability}% probability)</span>
                    )}
                    <span className="text-sm text-gray-600">
                      {selectedJobTimeline.job.startDate} to {selectedJobTimeline.job.endDate}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                    <span>Total Revenue: {formatCurrency(selectedJobTimeline.job.totalRevenue)}</span>
                    <span>Total Cost: {formatCurrency(selectedJobTimeline.job.totalCost)}</span>
                    <span className={`font-medium ${
                      (selectedJobTimeline.job.totalRevenue - selectedJobTimeline.job.totalCost) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Total Profit: {formatCurrency(selectedJobTimeline.job.totalRevenue - selectedJobTimeline.job.totalCost)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJobTimeline(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Timeline Visualization */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue & Cost Timeline</h4>
                
                {/* Timeline Chart */}
                <div className="space-y-4">
                  {selectedJobTimeline.monthlyBreakdown.map((monthData) => {
                    const maxAmount = Math.max(...selectedJobTimeline.monthlyBreakdown.map(m => Math.max(m.revenue, m.cost)));
                    const revenueWidth = maxAmount > 0 ? (monthData.revenue / maxAmount) * 100 : 0;
                    const costWidth = maxAmount > 0 ? (monthData.cost / maxAmount) * 100 : 0;
                    
                    return (
                      <div key={monthData.month} className="space-y-2">
                        {/* Month Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900 w-20">
                              {monthData.monthLabel}
                            </span>
                            {monthData.isStartMonth && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ▶ Start
                              </span>
                            )}
                            {monthData.isEndMonth && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ◼ End
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-4 text-xs text-gray-600">
                            <span className="text-green-700">R: {formatCurrency(monthData.revenue)}</span>
                            <span className="text-red-700">C: {formatCurrency(monthData.cost)}</span>
                            <span className={monthData.profit >= 0 ? 'text-purple-700' : 'text-red-700'}>
                              P: {formatCurrency(monthData.profit)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Visual Bars */}
                        <div className="space-y-1">
                          {/* Revenue Bar */}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-green-600 w-16">Revenue</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                              <div
                                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${revenueWidth}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-green-700 font-medium w-20 text-right">
                              {formatCurrency(monthData.revenue)}
                            </span>
                          </div>
                          
                          {/* Cost Bar */}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-red-600 w-16">Cost</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                              <div
                                className="bg-red-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${costWidth}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-red-700 font-medium w-20 text-right">
                              {formatCurrency(monthData.cost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Summary Table */}
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cumulative Profit
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedJobTimeline.monthlyBreakdown.map((monthData, index) => {
                      const cumulativeProfit = selectedJobTimeline.monthlyBreakdown
                        .slice(0, index + 1)
                        .reduce((sum, m) => sum + m.profit, 0);
                      
                      return (
                        <tr key={monthData.month} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{monthData.monthLabel}</div>
                            <div className="text-xs text-gray-500">{monthData.month}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {formatCurrency(monthData.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {formatCurrency(monthData.cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <span className={monthData.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(monthData.profit)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <span className={cumulativeProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(cumulativeProfit)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {monthData.isStartMonth && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Starting
                                </span>
                              )}
                              {monthData.isEndMonth && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Ending
                                </span>
                              )}
                              {!monthData.isStartMonth && !monthData.isEndMonth && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Active
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">TOTAL</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                        {formatCurrency(selectedJobTimeline.monthlyBreakdown.reduce((sum, m) => sum + m.revenue, 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                        {formatCurrency(selectedJobTimeline.monthlyBreakdown.reduce((sum, m) => sum + m.cost, 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                        {formatCurrency(selectedJobTimeline.monthlyBreakdown.reduce((sum, m) => sum + m.profit, 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                        {formatCurrency(selectedJobTimeline.monthlyBreakdown.reduce((sum, m) => sum + m.profit, 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                        {selectedJobTimeline.monthlyBreakdown.length} months
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Timeline Modal Footer */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Full timeline for {selectedJobTimeline.job.jobName} ({selectedJobTimeline.monthlyBreakdown.length} months)
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedJobTimeline(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Export Timeline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {showTable ? (
        /* Data Table View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Financial Data</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin %</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyData.months.map((month) => {
                  const margin = month.revenue > 0 ? ((month.profit / month.revenue) * 100) : 0;
                  return (
                    <tr key={month.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{month.monthLabel}</div>
                        <div className="text-xs text-gray-500">{month.month}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(month.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(month.cost)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(month.profit)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${margin >= 15 ? 'text-green-600' : margin >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {margin.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {month.jobCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">TOTAL</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {formatCurrency(monthlyData.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {formatCurrency(monthlyData.totalCost)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${monthlyData.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(monthlyData.totalProfit)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
                    monthlyData.totalRevenue > 0 ? 
                      (monthlyData.totalProfit / monthlyData.totalRevenue) * 100 >= 15 ? 'text-green-600' : 
                      (monthlyData.totalProfit / monthlyData.totalRevenue) * 100 >= 5 ? 'text-yellow-600' : 'text-red-600'
                    : 'text-red-600'
                  }`}>
                    {monthlyData.totalRevenue > 0 ? ((monthlyData.totalProfit / monthlyData.totalRevenue) * 100).toFixed(1) : '0.0'}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                    {monthlyData.months.reduce((sum, m) => sum + m.jobCount, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* Charts View */
        <div className="space-y-6">
          {/* Enhanced Multi-Metric Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Monthly Financial Overview</h3>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 rounded-full">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-sm"></div>
                  <span className="text-emerald-700 font-medium">Revenue</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-rose-50 rounded-full">
                  <div className="w-3 h-3 bg-gradient-to-r from-rose-400 to-rose-600 rounded-full shadow-sm"></div>
                  <span className="text-rose-700 font-medium">Cost</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-violet-50 rounded-full">
                  <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-violet-600 rounded-full shadow-sm"></div>
                  <span className="text-violet-700 font-medium">Profit</span>
                </div>
              </div>
            </div>
            
            {/* Multi-Bar Chart */}
            <div className="space-y-6">
              {monthlyData.months.map((month, index) => {
                // Calculate trends
                const prevMonth = index > 0 ? monthlyData.months[index - 1] : null;
                const revenueTrend = prevMonth ? calculateTrend(month.revenue, prevMonth.revenue) : 0;
                const profitTrend = prevMonth ? calculateTrend(month.profit, prevMonth.profit) : 0;
                
                // Calculate percentage of annual total
                const revenuePercent = monthlyData.totalRevenue > 0 ? (month.revenue / monthlyData.totalRevenue) * 100 : 0;
                const profitMargin = month.revenue > 0 ? (month.profit / month.revenue) * 100 : 0;
                
                // Determine quarter for visual grouping
                const quarterIndex = Math.floor(index / 3);
                const isQuarterStart = index % 3 === 0;
                
                return (
                  <div key={month.month} className={`space-y-3 ${isQuarterStart && index > 0 ? 'pt-4 border-t border-gray-200' : ''}`}>
                    {/* Quarter Header */}
                    {isQuarterStart && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          Q{quarterIndex + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          {quarterlyData[quarterIndex]?.percentOfTotal.toFixed(1)}% of annual revenue
                        </span>
                      </div>
                    )}
                    
                    {/* Month Label with Trends */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900 w-16">
                          {month.monthLabel.substring(0, 3)}
                        </span>
                        {/* Trend Indicators */}
                        {prevMonth && (
                          <div className="flex space-x-2">
                            {Math.abs(revenueTrend) > 0.1 && (
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                revenueTrend > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                              }`}>
                                {revenueTrend > 0 ? '↗' : '↘'} {Math.abs(revenueTrend).toFixed(1)}%
                              </span>
                            )}
                            {Math.abs(profitTrend) > 0.1 && (
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                profitTrend > 0 ? 'text-purple-700 bg-purple-100' : 'text-orange-700 bg-orange-100'
                              }`}>
                                P{profitTrend > 0 ? '↗' : '↘'} {Math.abs(profitTrend).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-4 text-xs text-gray-600">
                        <span className="text-green-700">R: {formatCurrency(month.revenue)}</span>
                        <span className="text-red-700">C: {formatCurrency(month.cost)}</span>
                        <span className={month.profit >= 0 ? 'text-purple-700' : 'text-red-700'}>
                          P: {formatCurrency(month.profit)} ({profitMargin.toFixed(1)}%)
                        </span>
                        <span className="text-indigo-600">{revenuePercent.toFixed(1)}% of total</span>
                      </div>
                    </div>
                    
                    {/* Enhanced Chart Area with Grid References */}
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                      {/* Grid Reference Lines */}
                      <div className="flex justify-between text-xs text-gray-500 mb-3 font-medium">
                        <span>0</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>Max</span>
                      </div>
                      
                      {/* Revenue Bar */}
                      <div className="flex items-center space-x-3 mb-3 group">
                        <span className="text-xs text-emerald-700 w-12 flex-shrink-0 font-semibold">Rev</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden shadow-inner">
                          {/* Grid lines */}
                          <div className="absolute inset-0 flex">
                            <div className="w-1/4 border-r border-gray-300/50"></div>
                            <div className="w-1/4 border-r border-gray-300/50"></div>
                            <div className="w-1/4 border-r border-gray-300/50"></div>
                            <div className="w-1/4"></div>
                          </div>
                          <div
                            className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-5 rounded-full transition-all duration-700 relative z-10 shadow-md group-hover:from-emerald-500 group-hover:to-emerald-700"
                            style={{
                              width: `${globalMaxRevenue > 0 ? (month.revenue / globalMaxRevenue) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-emerald-800 font-bold w-24 text-right flex-shrink-0">
                          {formatCurrency(month.revenue)}
                        </span>
                      </div>
                      
                      {/* Cost Bar */}
                      <div className="flex items-center space-x-3 mb-3 group">
                        <span className="text-xs text-rose-700 w-12 flex-shrink-0 font-semibold">Cost</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden shadow-inner">
                          {/* Grid lines */}
                          <div className="absolute inset-0 flex">
                            <div className="w-1/4 border-r border-gray-300/50"></div>
                            <div className="w-1/4 border-r border-gray-300/50"></div>
                            <div className="w-1/4 border-r border-gray-300/50"></div>
                            <div className="w-1/4"></div>
                          </div>
                          <div
                            className="bg-gradient-to-r from-rose-400 to-rose-600 h-5 rounded-full transition-all duration-700 relative z-10 shadow-md group-hover:from-rose-500 group-hover:to-rose-700"
                            style={{
                              width: `${globalMaxCost > 0 ? (month.cost / globalMaxCost) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-rose-800 font-bold w-24 text-right flex-shrink-0">
                          {formatCurrency(month.cost)}
                        </span>
                      </div>
                      
                      {/* Profit Bar */}
                      <div className="flex items-center space-x-3 group">
                        <span className={`text-xs w-12 flex-shrink-0 font-semibold ${month.profit >= 0 ? 'text-violet-700' : 'text-rose-700'}`}>
                          Profit
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden shadow-inner">
                          {/* Grid lines */}
                          <div className="absolute inset-0 flex">
                            <div className="w-1/4 border-r border-gray-300/50"></div>
                            <div className="w-1/4 border-r border-gray-300/50"></div>
                            <div className="w-1/4 border-r border-gray-300/50"></div>
                            <div className="w-1/4"></div>
                          </div>
                          <div
                            className={`h-5 rounded-full transition-all duration-700 relative z-10 shadow-md ${
                              month.profit >= 0 
                                ? 'bg-gradient-to-r from-violet-400 to-violet-600 group-hover:from-violet-500 group-hover:to-violet-700' 
                                : 'bg-gradient-to-r from-rose-400 to-rose-600 group-hover:from-rose-500 group-hover:to-rose-700'
                            }`}
                            style={{
                              width: `${globalMaxProfit > 0 ? (Math.abs(month.profit) / globalMaxProfit) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold w-24 text-right flex-shrink-0 ${
                          month.profit >= 0 ? 'text-violet-800' : 'text-rose-800'
                        }`}>
                          {formatCurrency(month.profit)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Enhanced Job count indicator - clickable */}
                    <div className="flex justify-end mt-2">
                      {month.jobCount > 0 ? (
                        <button
                          onClick={() => handleJobsClick(month)}
                          className="group flex items-center space-x-2 text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 px-3 py-2 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          <span>View {month.jobCount} job{month.jobCount !== 1 ? 's' : ''}</span>
                          <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">No jobs</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Quarterly Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quarterly Strategic Overview</h3>
              <span className="text-sm text-gray-500">Strategic Planning View</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {quarterlyData.map((quarter, qIndex) => {
                const prevQuarter = qIndex > 0 ? quarterlyData[qIndex - 1] : null;
                const revenueGrowth = prevQuarter ? calculateTrend(quarter.revenue, prevQuarter.revenue) : 0;
                const profitGrowth = prevQuarter ? calculateTrend(quarter.profit, prevQuarter.profit) : 0;
                
                return (
                  <div key={quarter.name} className={`border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                    quarter.margin >= 20 ? 'border-green-200 bg-green-50' :
                    quarter.margin >= 10 ? 'border-yellow-200 bg-yellow-50' :
                    'border-red-200 bg-red-50'
                  }`}>
                    <div className="text-center">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{quarter.name}</h4>
                        <div className="flex space-x-1">
                          {prevQuarter && Math.abs(revenueGrowth) > 1 && (
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              revenueGrowth > 0 ? 'text-green-700 bg-green-200' : 'text-red-700 bg-red-200'
                            }`}>
                              {revenueGrowth > 0 ? '↗' : '↘'}
                            </span>
                          )}
                          {prevQuarter && Math.abs(profitGrowth) > 1 && (
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              profitGrowth > 0 ? 'text-purple-700 bg-purple-200' : 'text-orange-700 bg-orange-200'
                            }`}>
                              P{profitGrowth > 0 ? '↗' : '↘'}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{quarter.months}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Revenue</p>
                          <p className="text-sm font-semibold text-green-600">{formatCurrency(quarter.revenue)}</p>
                          <p className="text-xs text-indigo-600">{quarter.percentOfTotal.toFixed(1)}% of annual</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Cost</p>
                          <p className="text-sm font-semibold text-red-600">{formatCurrency(quarter.cost)}</p>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-300">
                          <p className="text-xs text-gray-500">Profit & Margin</p>
                          <p className={`text-sm font-bold ${quarter.profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                            {formatCurrency(quarter.profit)}
                          </p>
                          <p className={`text-xs font-semibold ${
                            quarter.margin >= 20 ? 'text-green-700' :
                            quarter.margin >= 10 ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {quarter.margin.toFixed(1)}% margin
                          </p>
                        </div>
                        
                        {/* Growth indicators */}
                        {prevQuarter && (
                          <div className="pt-2 border-t border-gray-300">
                            <p className="text-xs text-gray-500">vs Previous Quarter</p>
                            <div className="flex justify-center space-x-2 text-xs">
                              <span className={Math.abs(revenueGrowth) > 1 ? (
                                revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                              ) : 'text-gray-500'}>
                                R: {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                              </span>
                              <span className={Math.abs(profitGrowth) > 1 ? (
                                profitGrowth > 0 ? 'text-purple-600' : 'text-red-600'
                              ) : 'text-gray-500'}>
                                P: {profitGrowth > 0 ? '+' : ''}{profitGrowth.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Quarterly Performance Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Annual Performance Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Strongest Quarter: </span>
                  <span className="font-medium text-green-700">
                    {quarterlyData.reduce((max, q) => q.revenue > max.revenue ? q : max, quarterlyData[0])?.name} 
                    ({formatCurrency(Math.max(...quarterlyData.map(q => q.revenue)))})
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Best Margin: </span>
                  <span className="font-medium text-purple-700">
                    {quarterlyData.reduce((max, q) => q.margin > max.margin ? q : max, quarterlyData[0])?.name}
                    ({quarterlyData.reduce((max, q) => q.margin > max.margin ? q : max, quarterlyData[0])?.margin.toFixed(1)}%)
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Growth Trend: </span>
                  <span className="font-medium text-indigo-700">
                    {quarterlyData.length > 1 && calculateTrend(
                      quarterlyData[quarterlyData.length - 1].revenue, 
                      quarterlyData[0].revenue
                    ) > 0 ? 'Improving' : 'Declining'} 
                    ({quarterlyData.length > 1 ? calculateTrend(
                      quarterlyData[quarterlyData.length - 1].revenue, 
                      quarterlyData[0].revenue
                    ).toFixed(1) : '0'}% vs Q1)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyView;