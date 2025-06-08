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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forecasts</h1>
            <p className="text-lg text-gray-600">View and manage market forecasts and predictions</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
            <span>+</span>
            <span>New Forecast</span>
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
              <p className="text-2xl font-bold text-gray-900">48</p>
              <p className="text-sm text-gray-500">Total Forecasts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">92.1%</p>
              <p className="text-sm text-gray-500">Avg Accuracy</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-500">Active Models</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <div className="w-6 h-6 bg-orange-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-500">Predictions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forecasts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {forecasts.map((forecast) => (
          <div key={forecast.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{forecast.title}</h3>
                <p className="text-sm text-gray-500">{forecast.type} • {forecast.job}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(forecast.confidence)}`}>
                {forecast.confidence} Confidence
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Accuracy</p>
                <p className="text-lg font-semibold text-gray-900">{forecast.accuracy}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Period</p>
                <p className="text-lg font-semibold text-gray-900">{forecast.period}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getTrendIcon(forecast.trend)}</span>
                <span className={`text-xl font-bold ${getTrendColor(forecast.trend)}`}>
                  {forecast.value}
                </span>
              </div>
              <p className="text-sm text-gray-500">vs previous period</p>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Updated: {forecast.lastUpdated}</p>
              <div className="flex space-x-2">
                <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">View Details</button>
                <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">Export</button>
              </div>
            </div>
          </div>
        ))}
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
              <p className="text-sm font-medium text-gray-900">Generate Forecast</p>
              <p className="text-xs text-gray-500">Create new prediction</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
              </div>
              <p className="text-sm font-medium text-gray-900">Compare Models</p>
              <p className="text-xs text-gray-500">Analyze accuracy</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-600 rounded"></div>
              </div>
              <p className="text-sm font-medium text-gray-900">Export Data</p>
              <p className="text-xs text-gray-500">Download results</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Forecasts;