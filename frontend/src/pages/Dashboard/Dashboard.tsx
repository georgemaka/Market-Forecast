const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">Welcome to Sukut Market Forecasting Platform</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <div className="w-6 h-6 bg-indigo-600 rounded"></div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Active Jobs</h3>
              <p className="text-3xl font-bold text-indigo-600">12</p>
              <p className="text-sm text-gray-500 mt-1">+2 from last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Total Forecasts</h3>
              <p className="text-3xl font-bold text-green-600">48</p>
              <p className="text-sm text-gray-500 mt-1">+8 from last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Reports Generated</h3>
              <p className="text-3xl font-bold text-blue-600">156</p>
              <p className="text-sm text-gray-500 mt-1">+15 from last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Accuracy Rate</h3>
              <p className="text-3xl font-bold text-purple-600">94.2%</p>
              <p className="text-sm text-gray-500 mt-1">+1.2% improvement</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
              <p className="text-gray-500">No recent activity to display.</p>
              <p className="text-sm text-gray-400 mt-1">Activity will appear here as you use the platform.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Forecasts</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
              <p className="text-gray-500">No upcoming forecasts scheduled.</p>
              <p className="text-sm text-gray-400 mt-1">Schedule forecasts to see them here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;