import { useState } from 'react';

const Reports = () => {
  const [selectedReportType, setSelectedReportType] = useState('financial');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Sample reports data
  const reports = [
    {
      id: 1,
      title: "Q4 2024 Financial Summary",
      type: "Financial Report",
      period: "Q4 2024",
      generatedDate: "2024-12-15",
      status: "Completed",
      size: "2.3 MB",
      pages: 24,
      downloadUrl: "#",
      description: "Comprehensive financial analysis including revenue, costs, and profit margins across all markets."
    },
    {
      id: 2,
      title: "Solar Market Trend Analysis",
      type: "Market Analysis",
      period: "Nov 2024",
      generatedDate: "2024-11-30",
      status: "Completed",
      size: "1.8 MB",
      pages: 18,
      downloadUrl: "#",
      description: "Detailed analysis of solar market trends, opportunities, and forecasted growth."
    },
    {
      id: 3,
      title: "Public Works Performance Report",
      type: "Performance Report",
      period: "FY 2024",
      generatedDate: "2024-10-31",
      status: "Completed",
      size: "3.1 MB",
      pages: 32,
      downloadUrl: "#",
      description: "Performance metrics and outcomes for all public works projects in fiscal year 2024."
    },
    {
      id: 4,
      title: "Environmental Impact Forecast",
      type: "Forecast Report",
      period: "Dec 2024",
      generatedDate: "2024-12-01",
      status: "Processing",
      size: "-- MB",
      pages: "--",
      downloadUrl: null,
      description: "Environmental impact assessment and future projections for current projects."
    }
  ];

  const reportTypes = [
    { value: 'financial', label: 'Financial Report', description: 'Revenue, costs, and profit analysis' },
    { value: 'market', label: 'Market Analysis', description: 'Market trends and opportunities' },
    { value: 'performance', label: 'Performance Report', description: 'Job performance and outcomes' },
    { value: 'forecast', label: 'Forecast Report', description: 'Future projections and predictions' },
    { value: 'custom', label: 'Custom Report', description: 'Customizable report template' }
  ];

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Period' }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call an API to generate the report
    console.log('Generating report:', { type: selectedReportType, period: selectedPeriod });
    setIsGenerateModalOpen(false);
    // Show success message or update UI
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border border-gray-200/50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-cyan-600/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="flex justify-between items-center relative">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-1">Reports</h1>
              <p className="text-lg text-gray-600 font-medium">Generate and manage forecasting reports</p>
            </div>
          </div>
          <button 
            onClick={() => setIsGenerateModalOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">24</p>
              <p className="text-sm text-gray-500 font-medium">Total Reports</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-emerald-50 p-6 rounded-xl shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">18</p>
              <p className="text-sm text-gray-500 font-medium">This Month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">2.4 GB</p>
              <p className="text-sm text-gray-500 font-medium">Storage Used</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">1.2K</p>
              <p className="text-sm text-gray-500 font-medium">Downloads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Reports Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-xl">
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">Recent Reports</h3>
        </div>
        
        {reports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated yet</h3>
            <p className="text-gray-500 mb-4">
              Generate your first report to see it here.
            </p>
            <button 
              onClick={() => setIsGenerateModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Generate your first report
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500">{report.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.period}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.generatedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.size}</div>
                      <div className="text-sm text-gray-500">{report.pages} pages</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-800 px-3 py-1.5 rounded-lg font-semibold transition-all duration-200">View</button>
                        {report.downloadUrl && (
                          <button className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 px-3 py-1.5 rounded-lg font-semibold transition-all duration-200">Download</button>
                        )}
                        <button className="bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 px-3 py-1.5 rounded-lg font-semibold transition-all duration-200">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
        <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-900">Financial Summary</p>
              <p className="text-xs text-gray-500 font-medium">Generate monthly financials</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-6 border-2 border-dashed border-emerald-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 group">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-900">Market Analysis</p>
              <p className="text-xs text-gray-500 font-medium">Analyze market trends</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-900">Performance Report</p>
              <p className="text-xs text-gray-500 font-medium">Job performance metrics</p>
            </div>
          </button>
        </div>
      </div>

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Generate New Report</h3>
                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleGenerateReport} className="space-y-6">
                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Report Type
                  </label>
                  <div className="space-y-3">
                    {reportTypes.map((type) => (
                      <div key={type.value} className="flex items-start">
                        <input
                          id={type.value}
                          name="reportType"
                          type="radio"
                          value={type.value}
                          checked={selectedReportType === type.value}
                          onChange={(e) => setSelectedReportType(e.target.value)}
                          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <label htmlFor={type.value} className="text-sm font-medium text-gray-900">
                            {type.label}
                          </label>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Period */}
                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                    Time Period
                  </label>
                  <select
                    id="period"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {periods.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-200 border border-gray-300 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 border border-transparent rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Generate Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;