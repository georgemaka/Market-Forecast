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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-lg text-gray-600">Generate and manage forecasting reports</p>
          </div>
          <button 
            onClick={() => setIsGenerateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-gray-500">Total Reports</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">18</p>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">2.4 GB</p>
              <p className="text-sm text-gray-500">Storage Used</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <div className="w-6 h-6 bg-orange-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">1.2K</p>
              <p className="text-sm text-gray-500">Downloads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
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
                        <button className="text-indigo-600 hover:text-indigo-900">View</button>
                        {report.downloadUrl && (
                          <button className="text-gray-600 hover:text-gray-900">Download</button>
                        )}
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
              </div>
              <p className="text-sm font-medium text-gray-900">Financial Summary</p>
              <p className="text-xs text-gray-500">Generate monthly financials</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
              </div>
              <p className="text-sm font-medium text-gray-900">Market Analysis</p>
              <p className="text-xs text-gray-500">Analyze market trends</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-600 rounded"></div>
              </div>
              <p className="text-sm font-medium text-gray-900">Performance Report</p>
              <p className="text-xs text-gray-500">Job performance metrics</p>
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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