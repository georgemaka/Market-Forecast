const Forecasts = () => {
  // Sample forecast data
  const forecasts = [
    {
      id: 1,
      title: "Construction Material Demand",
      type: "Demand Forecast",
      job: "Q4 Market Analysis",
      accuracy: 94.2,
      confidence: "High",
      period: "Q1 2024",
      trend: "up",
      value: "+12.5%",
      lastUpdated: "2024-02-15"
    },
    {
      id: 2,
      title: "Infrastructure Investment",
      type: "Investment Forecast", 
      job: "Infrastructure Demand Forecast",
      accuracy: 87.8,
      confidence: "Medium",
      period: "Q2 2024",
      trend: "up",
      value: "+8.3%",
      lastUpdated: "2024-02-12"
    },
    {
      id: 3,
      title: "Steel Price Projection",
      type: "Price Forecast",
      job: "Material Cost Projection",
      accuracy: 91.5,
      confidence: "High",
      period: "Q1 2024",
      trend: "down",
      value: "-5.2%",
      lastUpdated: "2024-02-10"
    },
    {
      id: 4,
      title: "Regional Growth Rate",
      type: "Growth Forecast",
      job: "Regional Growth Analysis",
      accuracy: 89.1,
      confidence: "Medium",
      period: "2024",
      trend: "up",
      value: "+15.7%",
      lastUpdated: "2024-02-08"
    }
  ];

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '↗️' : '↘️';
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-1">Forecasts</h1>
              <p className="text-lg text-gray-600 font-medium">View and manage market forecasts and predictions</p>
            </div>
          </div>
          <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Forecast</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">48</p>
              <p className="text-sm text-gray-500 font-medium">Total Forecasts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-emerald-50 p-6 rounded-xl shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">92.1%</p>
              <p className="text-sm text-gray-500 font-medium">Avg Accuracy</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">12</p>
              <p className="text-sm text-gray-500 font-medium">Active Models</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">156</p>
              <p className="text-sm text-gray-500 font-medium">Predictions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Forecasts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {forecasts.map((forecast) => (
          <div key={forecast.id} className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-1">{forecast.title}</h3>
                <p className="text-sm text-gray-500 font-medium">{forecast.type} • {forecast.job}</p>
              </div>
              <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full shadow-md ${getConfidenceColor(forecast.confidence)}`}>
                {forecast.confidence} Confidence
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-white to-blue-50 rounded-lg">
                <p className="text-sm text-gray-500 font-medium">Accuracy</p>
                <p className="text-lg font-bold text-blue-600">{forecast.accuracy}%</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-white to-purple-50 rounded-lg">
                <p className="text-sm text-gray-500 font-medium">Period</p>
                <p className="text-lg font-bold text-purple-600">{forecast.period}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${forecast.trend === 'up' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  <svg className={`w-5 h-5 ${forecast.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={forecast.trend === 'up' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                  </svg>
                </div>
                <span className={`text-xl font-bold ${getTrendColor(forecast.trend)}`}>
                  {forecast.value}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium">vs previous period</p>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 font-medium">Updated: {forecast.lastUpdated}</p>
              <div className="flex space-x-2">
                <button className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-800 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200">View Details</button>
                <button className="bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200">Export</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
        <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-900">Generate Forecast</p>
              <p className="text-xs text-gray-500 font-medium">Create new prediction</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-6 border-2 border-dashed border-emerald-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 group">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-900">Compare Models</p>
              <p className="text-xs text-gray-500 font-medium">Analyze accuracy</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-900">Export Data</p>
              <p className="text-xs text-gray-500 font-medium">Download results</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Forecasts;