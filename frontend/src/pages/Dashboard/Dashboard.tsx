import { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { formatCurrency, getCurrentFiscalYear } from '../../utils/calculations';
import { getFiscalYearInfo } from '../../utils/dateUtils';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalJobs: 0,
    activeJobs: 0,
    backlogJobs: 0,
    swagJobs: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    avgJobValue: 0,
    profitMargin: 0,
    allocationProgress: 0,
    marketPerformance: {} as any,
    recentActivity: [] as any[]
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'fiscal' | 'current_month'>('fiscal');

  useEffect(() => {
    const loadDashboardData = () => {
      const currentFY = getCurrentFiscalYear();
      
      // Get jobs based on selected timeframe
      let filteredJobs;
      if (selectedTimeframe === 'fiscal') {
        filteredJobs = dataService.getJobsByFiscalYear(currentFY);
      } else if (selectedTimeframe === 'current_month') {
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const monthEndStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;
        
        filteredJobs = dataService.filterJobs({
          dateFilter: 'custom',
          customStartDate: monthStart,
          customEndDate: monthEndStr
        });
      } else {
        filteredJobs = dataService.getAllJobs();
      }

      const kpis = dataService.getKPIs();
      const marketPerformance = dataService.getMarketPerformance();
      const jobsWithAllocation = dataService.getAllJobsWithAllocationStatus();
      
      // Calculate allocation progress
      const allocatedJobs = jobsWithAllocation.filter(job => job.allocationStatus !== 'not_started');
      const allocationProgress = jobsWithAllocation.length > 0 
        ? (allocatedJobs.length / jobsWithAllocation.length) * 100 
        : 0;

      setDashboardData({
        totalJobs: filteredJobs.length,
        activeJobs: filteredJobs.filter(job => {
          const now = new Date();
          const startDate = new Date(job.startDate);
          const endDate = new Date(job.endDate);
          return startDate <= now && endDate >= now;
        }).length,
        backlogJobs: filteredJobs.filter(job => job.type === 'Backlog').length,
        swagJobs: filteredJobs.filter(job => job.type === 'SWAG').length,
        totalRevenue: kpis.revenue.total,
        totalCost: kpis.cost.total,
        totalProfit: kpis.profit.total,
        avgJobValue: filteredJobs.length > 0 ? kpis.revenue.total / filteredJobs.length : 0,
        profitMargin: kpis.revenue.total > 0 ? (kpis.profit.total / kpis.revenue.total) * 100 : 0,
        allocationProgress,
        marketPerformance,
        recentActivity: [] // We'll add this later
      });
    };

    loadDashboardData();
  }, [selectedTimeframe]);

  const getTimeframeLabel = () => {
    const fyInfo = getFiscalYearInfo();
    switch (selectedTimeframe) {
      case 'fiscal':
        return `FY ${fyInfo.current}-${(fyInfo.current + 1).toString().slice(-2)}`;
      case 'current_month':
        return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      default:
        return 'All Time';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-lg text-gray-600">Welcome to Sukut Market Forecasting Platform</p>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedTimeframe('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTimeframe === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedTimeframe('fiscal')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTimeframe === 'fiscal'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Fiscal Year
            </button>
            <button
              onClick={() => setSelectedTimeframe('current_month')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTimeframe === 'current_month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Showing data for: {getTimeframeLabel()}</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Total Jobs</h3>
              <p className="text-3xl font-bold text-indigo-600">{dashboardData.totalJobs}</p>
              <p className="text-sm text-gray-500 mt-1">
                {dashboardData.backlogJobs} Backlog • {dashboardData.swagJobs} SWAG
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(dashboardData.totalRevenue)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Avg: {formatCurrency(dashboardData.avgJobValue)} per job
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Total Profit</h3>
              <p className={`text-3xl font-bold ${dashboardData.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(dashboardData.totalProfit)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {dashboardData.profitMargin.toFixed(1)}% margin
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Allocation Progress</h3>
              <p className="text-3xl font-bold text-purple-600">{dashboardData.allocationProgress.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 mt-1">
                Jobs with allocations
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Market Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(dashboardData.marketPerformance).map(([market, performance]: [string, any]) => (
                <div key={market} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{market}</h4>
                    <p className="text-xs text-gray-500">{performance.jobCount} jobs</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(performance.totalRevenue)}
                    </p>
                    <p className={`text-xs ${performance.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {performance.profitMargin.toFixed(1)}% margin
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (performance.totalRevenue / Math.max(...Object.values(dashboardData.marketPerformance).map((p: any) => p.totalRevenue))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(dashboardData.marketPerformance).length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No market data available.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Jobs Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.activeJobs > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Jobs</span>
                    <span className="text-lg font-semibold text-indigo-600">{dashboardData.activeJobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Backlog Jobs</span>
                    <span className="text-sm font-medium text-green-600">{dashboardData.backlogJobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">SWAG Jobs</span>
                    <span className="text-sm font-medium text-blue-600">{dashboardData.swagJobs}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Allocation Progress</span>
                      <span className="text-sm font-medium text-purple-600">{dashboardData.allocationProgress.toFixed(0)}%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${dashboardData.allocationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.totalProfit)}</p>
                      <p className="text-sm text-gray-500">Total Profit ({dashboardData.profitMargin.toFixed(1)}% margin)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No active jobs for selected timeframe.</p>
                  <p className="text-sm text-gray-400 mt-1">Create jobs to see activity here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;