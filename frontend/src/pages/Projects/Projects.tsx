import { useState, useEffect } from 'react';
import { Job, getCurrentFiscalYear, getAvailableFiscalYears, getFiscalYearDates } from '../../utils/calculations';
import { dataService } from '../../services/dataService';
import MonthlyView from '../../components/MonthlyView';
import JobAllocationInterface from '../../components/JobAllocationInterface';
import { JobWithAllocations } from '../../utils/allocationTypes';

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'fiscal' | 'custom'>('fiscal');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number | null>(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [isViewEditModalOpen, setIsViewEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [selectedJobForAllocation, setSelectedJobForAllocation] = useState<JobWithAllocations | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'monthly'>('table');
  const [jobs, setJobs] = useState<Array<Job & { allocationStatus: 'not_started' | 'partial' | 'complete'; allocationPercentage: number }>>([]);
  
  // Load jobs from dataService
  useEffect(() => {
    const loadJobs = () => {
      const jobsWithStatus = dataService.getAllJobsWithAllocationStatus();
      setJobs(jobsWithStatus);
    };
    
    loadJobs();
  }, []);

  // Get markets and fiscal year data from utilities
  const markets = dataService.getMarkets();
  const currentFiscalYear = getCurrentFiscalYear();
  const availableFiscalYears = getAvailableFiscalYears().map(fy => fy.year);
  
  // Set default fiscal year if not already set
  useEffect(() => {
    if (selectedFiscalYear === null) {
      setSelectedFiscalYear(currentFiscalYear);
    }
  }, [selectedFiscalYear, currentFiscalYear]);

  // Get active fiscal year dates
  const activeFiscalYearDates = selectedFiscalYear !== null 
    ? getFiscalYearDates(selectedFiscalYear)
    : getFiscalYearDates(currentFiscalYear);

  // Date filtering logic
  const isJobInDateRange = (job: any) => {
    if (dateFilter === 'all') return true;
    
    const jobStart = new Date(job.startDate);
    const jobEnd = new Date(job.endDate);
    
    if (dateFilter === 'fiscal') {
      const fiscalStart = new Date(activeFiscalYearDates.start);
      const fiscalEnd = new Date(activeFiscalYearDates.end);
      
      // Check if job overlaps with fiscal year
      return jobStart <= fiscalEnd && jobEnd >= fiscalStart;
    }
    
    if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const customStart = new Date(customStartDate);
      const customEnd = new Date(customEndDate);
      
      // Check if job overlaps with custom range
      return jobStart <= customEnd && jobEnd >= customStart;
    }
    
    return true;
  };

  // Filter jobs based on search term, selected markets, and date range
  const filteredJobs = jobs.filter(job => {
    // Search filter - check all relevant fields
    const searchMatch = searchTerm === '' || 
      job.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.totalRevenue.toString().includes(searchTerm) ||
      job.totalCost.toString().includes(searchTerm) ||
      job.startDate.includes(searchTerm) ||
      job.endDate.includes(searchTerm) ||
      job.probability.toString().includes(searchTerm);
    
    // Market filter
    const marketMatch = selectedMarkets.length === 0 || selectedMarkets.includes(job.market);
    
    // Date filter
    const dateMatch = isJobInDateRange(job);
    
    return searchMatch && marketMatch && dateMatch;
  });

  // Group and sort filtered jobs by market, then by type (Backlog first, then SWAG)
  const groupedJobs = filteredJobs.reduce((acc, job) => {
    if (!acc[job.market]) {
      acc[job.market] = { Backlog: [], SWAG: [] };
    }
    acc[job.market][job.type].push(job);
    return acc;
  }, {} as Record<string, { Backlog: typeof jobs; SWAG: typeof jobs }>);

  // Calculate KPIs based on filtered jobs
  const calculateKPIs = () => {
    const backlogJobs = filteredJobs.filter(job => job.type === 'Backlog');
    const swagJobs = filteredJobs.filter(job => job.type === 'SWAG');
    
    const backlogRevenue = backlogJobs.reduce((sum, job) => sum + job.totalRevenue, 0);
    const swagRevenue = swagJobs.reduce((sum, job) => sum + job.totalRevenue, 0);
    const totalRevenue = backlogRevenue + swagRevenue;
    
    const backlogCost = backlogJobs.reduce((sum, job) => sum + job.totalCost, 0);
    const swagCost = swagJobs.reduce((sum, job) => sum + job.totalCost, 0);
    const totalCost = backlogCost + swagCost;
    
    const backlogEarnings = backlogRevenue - backlogCost;
    const swagEarnings = swagRevenue - swagCost;
    const totalEarnings = backlogEarnings + swagEarnings;
    
    return {
      revenue: { total: totalRevenue, backlog: backlogRevenue, swag: swagRevenue },
      cost: { total: totalCost, backlog: backlogCost, swag: swagCost },
      earnings: { total: totalEarnings, backlog: backlogEarnings, swag: swagEarnings }
    };
  };

  const kpis = calculateKPIs();
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  // Handle market filter changes
  const handleMarketToggle = (market: string) => {
    setSelectedMarkets(prev => 
      prev.includes(market) 
        ? prev.filter(m => m !== market)
        : [...prev, market]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMarkets([]);
    setDateFilter('fiscal');
    setSelectedFiscalYear(currentFiscalYear);
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Create new job form state
  const [newJob, setNewJob] = useState({
    jobName: '',
    market: 'Environmental', // Default to first market
    type: 'Backlog',
    probability: 100,
    startDate: '',
    endDate: '',
    totalRevenue: '',
    totalCost: ''
  });

  // Handle form input changes
  const handleNewJobChange = (field: string, value: string | number) => {
    setNewJob(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-set probability based on type
    if (field === 'type') {
      setNewJob(prev => ({
        ...prev,
        probability: value === 'Backlog' ? 100 : prev.probability
      }));
    }
  };

  // Submit new job
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newJob.jobName || !newJob.startDate || !newJob.endDate || !newJob.totalRevenue || !newJob.totalCost) {
      alert('Please fill in all required fields');
      return;
    }

    // Create new job object
    const newJobData = {
      id: Math.max(...jobs.map(j => j.id)) + 1,
      market: newJob.market,
      jobName: newJob.jobName,
      type: newJob.type as 'Backlog' | 'SWAG',
      probability: newJob.type === 'Backlog' ? 100 : Number(newJob.probability),
      startDate: newJob.startDate,
      endDate: newJob.endDate,
      totalRevenue: Number(newJob.totalRevenue),
      totalCost: Number(newJob.totalCost)
    };

    // Add to jobs list through dataService
    const result = dataService.addJob(newJobData);
    if (result.success && result.job) {
      // Reload jobs to get proper allocation status
      const jobsWithStatus = dataService.getAllJobsWithAllocationStatus();
      setJobs(jobsWithStatus);
    } else {
      alert(`Error creating job: ${result.errors?.join(', ')}`);
    }

    // Reset form and close modal
    setNewJob({
      jobName: '',
      market: 'Environmental',
      type: 'Backlog',
      probability: 100,
      startDate: '',
      endDate: '',
      totalRevenue: '',
      totalCost: ''
    });
    setIsCreateJobModalOpen(false);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsCreateJobModalOpen(false);
    // Reset form when closing
    setNewJob({
      jobName: '',
      market: 'Environmental',
      type: 'Backlog',
      probability: 100,
      startDate: '',
      endDate: '',
      totalRevenue: '',
      totalCost: ''
    });
  };

  // Allocation handlers
  const handleOpenAllocation = (job: Job) => {
    const jobWithAllocations = dataService.getJobWithAllocations(job.id);
    if (jobWithAllocations) {
      setSelectedJobForAllocation(jobWithAllocations);
      setIsAllocationModalOpen(true);
    }
  };

  const handleAllocationUpdate = (updatedJob: JobWithAllocations) => {
    const result = dataService.updateJobAllocations(updatedJob);
    if (result.success) {
      // Reload jobs to show updated allocation status
      const jobsWithStatus = dataService.getAllJobsWithAllocationStatus();
      setJobs(jobsWithStatus);
      setIsAllocationModalOpen(false);
      setSelectedJobForAllocation(null);
    } else {
      alert(`Error updating allocation: ${result.error}`);
    }
  };

  const handleCloseAllocation = () => {
    setIsAllocationModalOpen(false);
    setSelectedJobForAllocation(null);
  };


  // Edit job handler
  const handleEditJob = (job: any) => {
    setSelectedJob(job);
    setIsEditMode(true);
    setIsViewEditModalOpen(true);
  };

  // Save edited job
  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedJob) return;

    // Update the job through dataService
    const updateData = {
      jobName: selectedJob.jobName,
      market: selectedJob.market,
      type: selectedJob.type,
      probability: selectedJob.type === 'Backlog' ? 100 : Number(selectedJob.probability),
      startDate: selectedJob.startDate,
      endDate: selectedJob.endDate,
      totalRevenue: Number(selectedJob.totalRevenue),
      totalCost: Number(selectedJob.totalCost)
    };

    const result = dataService.updateJob(selectedJob.id, updateData);
    if (result.success) {
      // Reload jobs to show updated data
      const jobsWithStatus = dataService.getAllJobsWithAllocationStatus();
      setJobs(jobsWithStatus);
    } else {
      alert(`Error updating job: ${result.errors?.join(', ')}`);
    }

    // Close modal
    setIsViewEditModalOpen(false);
    setSelectedJob(null);
    setIsEditMode(false);
  };

  // Handle selected job changes
  const handleSelectedJobChange = (field: string, value: string | number) => {
    if (!selectedJob) return;
    
    setSelectedJob((prev: any) => ({
      ...prev,
      [field]: value
    }));

    // Auto-set probability based on type
    if (field === 'type') {
      setSelectedJob((prev: any) => ({
        ...prev,
        probability: value === 'Backlog' ? 100 : prev.probability
      }));
    }
  };

  // Close view/edit modal
  const handleCloseViewEditModal = () => {
    setIsViewEditModalOpen(false);
    setSelectedJob(null);
    setIsEditMode(false);
  };

  // Delete job handler
  const handleDeleteJob = () => {
    if (!selectedJob) return;
    
    if (window.confirm('Are you sure you want to delete this job?')) {
      const result = dataService.deleteJob(selectedJob.id);
      if (result.success) {
        // Reload jobs to show updated list
        const jobsWithStatus = dataService.getAllJobsWithAllocationStatus();
        setJobs(jobsWithStatus);
        handleCloseViewEditModal();
      } else {
        alert(`Error deleting job: ${result.error}`);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Backlog':
        return 'bg-green-100 text-green-800';
      case 'SWAG':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs</h1>
            <p className="text-lg text-gray-600">Manage your forecasting jobs and projects</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly View
              </button>
            </div>
            
            {/* Create Job Button */}
            <button 
              onClick={() => setIsCreateJobModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span>+</span>
              <span>Create New Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Top Row: Search and Date Filter */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <label htmlFor="search" className="sr-only">Search jobs</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Search jobs, markets, dates, amounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                    dateFilter === 'all'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  All Time
                </button>
                
                {/* Fiscal Year Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDateFilter('fiscal')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                      dateFilter === 'fiscal'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Fiscal Year
                  </button>
                  {dateFilter === 'fiscal' && (
                    <select
                      value={selectedFiscalYear || currentFiscalYear}
                      onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
                      className="absolute top-8 left-0 mt-1 px-2 py-1 border border-gray-300 rounded-md text-xs bg-white shadow-lg z-10 min-w-32"
                    >
                      {availableFiscalYears.map(year => (
                        <option key={year} value={year}>
                          FY {year}-{(year + 1).toString().slice(-2)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <button
                  onClick={() => setDateFilter('custom')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                    dateFilter === 'custom'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  Custom Range
                </button>
              </div>
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {dateFilter === 'custom' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Custom Date Range:</span>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="start-date" className="text-sm text-gray-600">From:</label>
                  <input
                    id="start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="end-date" className="text-sm text-gray-600">To:</label>
                  <input
                    id="end-date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Market Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by Market:</span>
            {markets.map(market => (
              <button
                key={market}
                onClick={() => handleMarketToggle(market)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                  selectedMarkets.includes(market)
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {market}
              </button>
            ))}
            {(searchTerm || selectedMarkets.length > 0 || dateFilter !== 'fiscal' || selectedFiscalYear !== currentFiscalYear) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 transition-colors duration-200"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedMarkets.length > 0 || dateFilter !== 'all') && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {dateFilter === 'fiscal' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                FY {selectedFiscalYear || currentFiscalYear}-{((selectedFiscalYear || currentFiscalYear) + 1).toString().slice(-2)}
                <button
                  onClick={() => setDateFilter('all')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {dateFilter === 'custom' && customStartDate && customEndDate && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                {customStartDate} to {customEndDate}
                <button
                  onClick={() => {
                    setDateFilter('all');
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedMarkets.map(market => (
              <span key={market} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                {market}
                <button
                  onClick={() => handleMarketToggle(market)}
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
            <span className="text-xs text-gray-500">
              ({filteredJobs.length} of {jobs.length} jobs)
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.revenue.total)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Backlog:</span>
              <span className="text-sm font-medium text-green-700">{formatCurrency(kpis.revenue.backlog)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">SWAG:</span>
              <span className="text-sm font-medium text-blue-700">{formatCurrency(kpis.revenue.swag)}</span>
            </div>
          </div>
        </div>
        
        {/* Total Cost */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 bg-red-600 rounded"></div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Cost</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.cost.total)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Backlog:</span>
              <span className="text-sm font-medium text-green-700">{formatCurrency(kpis.cost.backlog)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">SWAG:</span>
              <span className="text-sm font-medium text-blue-700">{formatCurrency(kpis.cost.swag)}</span>
            </div>
          </div>
        </div>
        
        {/* Total Earnings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Earnings</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.earnings.total)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Backlog:</span>
              <span className="text-sm font-medium text-green-700">{formatCurrency(kpis.earnings.backlog)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">SWAG:</span>
              <span className="text-sm font-medium text-blue-700">{formatCurrency(kpis.earnings.swag)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === 'monthly' ? (
        <MonthlyView 
          jobs={filteredJobs}
          viewType="fiscal"
          fiscalYear={selectedFiscalYear || currentFiscalYear}
        />
      ) : (
        /* Jobs Table - Grouped by Market */
        <div className="space-y-6">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.462-.881-6.065-2.33C5.364 11.108 5 9.615 5 8V4a1 1 0 011-1h12a1 1 0 011 1v4c0 1.615-.364 3.108-.935 4.67A7.962 7.962 0 0112 15z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedMarkets.length > 0 || dateFilter !== 'fiscal' || selectedFiscalYear !== currentFiscalYear
                ? "Try adjusting your search or filter criteria."
                : "No jobs available at the moment."}
            </p>
            {(searchTerm || selectedMarkets.length > 0 || dateFilter !== 'fiscal' || selectedFiscalYear !== currentFiscalYear) && (
              <button
                onClick={clearFilters}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          markets.map(market => {
            const marketJobs = groupedJobs[market];
            if (!marketJobs || (marketJobs.Backlog.length === 0 && marketJobs.SWAG.length === 0)) {
              return null;
            }
          
          // Combine Backlog first, then SWAG
          const sortedJobs = [...marketJobs.Backlog, ...marketJobs.SWAG];
          
          return (
            <div key={market} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">{market} Market</h3>
                <p className="text-sm text-gray-600">
                  {marketJobs.Backlog.length} Backlog • {marketJobs.SWAG.length} SWAG
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Probability %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Profit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allocation Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{job.jobName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(job.type)}`}>
                            {job.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${job.type === 'Backlog' ? 'bg-green-600' : 'bg-blue-600'}`}
                                style={{ width: `${job.probability}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-700">{job.probability}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.startDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(job.totalRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(job.totalCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={`${job.totalRevenue - job.totalCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(job.totalRevenue - job.totalCost)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  job.allocationStatus === 'complete' ? 'bg-green-600' :
                                  job.allocationStatus === 'partial' ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${job.allocationPercentage}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-medium ${
                              job.allocationStatus === 'complete' ? 'text-green-600' :
                              job.allocationStatus === 'partial' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {job.allocationPercentage.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleOpenAllocation(job)}
                              className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 px-3 py-1 rounded-md transition-colors font-medium"
                            >
                              Allocate
                            </button>
                            <button 
                              onClick={() => handleEditJob(job)}
                              className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 px-3 py-1 rounded-md transition-colors font-medium"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
        )}
        </div>
      )}

      {/* Allocation Modal */}
      {isAllocationModalOpen && selectedJobForAllocation && (
        <JobAllocationInterface
          job={selectedJobForAllocation}
          onJobUpdate={handleAllocationUpdate}
          onClose={handleCloseAllocation}
        />
      )}

      {/* Create Job Modal */}
      {isCreateJobModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Create New Job</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Job Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="jobName" className="block text-sm font-medium text-gray-700 mb-2">
                      Job Name *
                    </label>
                    <input
                      type="text"
                      id="jobName"
                      value={newJob.jobName}
                      onChange={(e) => handleNewJobChange('jobName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter job name"
                      required
                    />
                  </div>

                  {/* Market */}
                  <div>
                    <label htmlFor="market" className="block text-sm font-medium text-gray-700 mb-2">
                      Market *
                    </label>
                    <select
                      id="market"
                      value={newJob.market}
                      onChange={(e) => handleNewJobChange('market', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {markets.map(market => (
                        <option key={market} value={market}>{market}</option>
                      ))}
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      id="type"
                      value={newJob.type}
                      onChange={(e) => handleNewJobChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="Backlog">Backlog</option>
                      <option value="SWAG">SWAG</option>
                    </select>
                  </div>

                  {/* Probability */}
                  <div>
                    <label htmlFor="probability" className="block text-sm font-medium text-gray-700 mb-2">
                      Probability % *
                    </label>
                    <input
                      type="number"
                      id="probability"
                      min="0"
                      max="100"
                      value={newJob.probability}
                      onChange={(e) => handleNewJobChange('probability', Number(e.target.value))}
                      disabled={newJob.type === 'Backlog'}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                        newJob.type === 'Backlog' ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                    />
                    {newJob.type === 'Backlog' && (
                      <p className="text-xs text-gray-500 mt-1">Backlog jobs are automatically set to 100%</p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={newJob.startDate}
                      onChange={(e) => handleNewJobChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={newJob.endDate}
                      onChange={(e) => handleNewJobChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Total Revenue */}
                  <div>
                    <label htmlFor="totalRevenue" className="block text-sm font-medium text-gray-700 mb-2">
                      Total Revenue ($) *
                    </label>
                    <input
                      type="text"
                      id="totalRevenue"
                      value={newJob.totalRevenue}
                      onChange={(e) => handleNewJobChange('totalRevenue', e.target.value.replace(/,/g, ''))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0"
                      required
                    />
                  </div>

                  {/* Total Cost */}
                  <div>
                    <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700 mb-2">
                      Total Cost ($) *
                    </label>
                    <input
                      type="text"
                      id="totalCost"
                      value={newJob.totalCost}
                      onChange={(e) => handleNewJobChange('totalCost', e.target.value.replace(/,/g, ''))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Profit Preview */}
                {newJob.totalRevenue && newJob.totalCost && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Estimated Profit:</span>
                      <span className={`text-lg font-semibold ${
                        Number(newJob.totalRevenue) - Number(newJob.totalCost) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Number(newJob.totalRevenue) - Number(newJob.totalCost))}
                      </span>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Job Modal */}
      {isViewEditModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {isEditMode ? 'Edit Job' : 'View Job Details'}
                </h3>
                <div className="flex items-center space-x-2">
                  {!isEditMode && (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={handleCloseViewEditModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Job Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="selectedJobName" className="block text-sm font-medium text-gray-700 mb-2">
                      Job Name *
                    </label>
                    <input
                      type="text"
                      id="selectedJobName"
                      value={selectedJob.jobName}
                      onChange={(e) => handleSelectedJobChange('jobName', e.target.value)}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                        !isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      required
                    />
                  </div>

                  {/* Market */}
                  <div>
                    <label htmlFor="selectedMarket" className="block text-sm font-medium text-gray-700 mb-2">
                      Market *
                    </label>
                    <select
                      id="selectedMarket"
                      value={selectedJob.market}
                      onChange={(e) => handleSelectedJobChange('market', e.target.value)}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                        !isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      required
                    >
                      {markets.map(market => (
                        <option key={market} value={market}>{market}</option>
                      ))}
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label htmlFor="selectedType" className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      id="selectedType"
                      value={selectedJob.type}
                      onChange={(e) => handleSelectedJobChange('type', e.target.value)}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                        !isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      required
                    >
                      <option value="Backlog">Backlog</option>
                      <option value="SWAG">SWAG</option>
                    </select>
                  </div>

                  {/* Probability */}
                  <div>
                    <label htmlFor="selectedProbability" className="block text-sm font-medium text-gray-700 mb-2">
                      Probability % *
                    </label>
                    <input
                      type="number"
                      id="selectedProbability"
                      min="0"
                      max="100"
                      value={selectedJob.probability}
                      onChange={(e) => handleSelectedJobChange('probability', Number(e.target.value))}
                      disabled={!isEditMode || selectedJob.type === 'Backlog'}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                        !isEditMode || selectedJob.type === 'Backlog' ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                    />
                    {selectedJob.type === 'Backlog' && (
                      <p className="text-xs text-gray-500 mt-1">Backlog jobs are automatically set to 100%</p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label htmlFor="selectedStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="selectedStartDate"
                      value={selectedJob.startDate}
                      onChange={(e) => handleSelectedJobChange('startDate', e.target.value)}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                        !isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label htmlFor="selectedEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="selectedEndDate"
                      value={selectedJob.endDate}
                      onChange={(e) => handleSelectedJobChange('endDate', e.target.value)}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                        !isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      required
                    />
                  </div>

                  {/* Total Revenue */}
                  <div>
                    <label htmlFor="selectedTotalRevenue" className="block text-sm font-medium text-gray-700 mb-2">
                      Total Revenue ($) *
                    </label>
                    <input
                      type="text"
                      id="selectedTotalRevenue"
                      value={isEditMode ? selectedJob.totalRevenue.toString() : formatCurrency(selectedJob.totalRevenue)}
                      onChange={(e) => handleSelectedJobChange('totalRevenue', e.target.value.replace(/,/g, ''))}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                        !isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      required
                    />
                  </div>

                  {/* Total Cost */}
                  <div>
                    <label htmlFor="selectedTotalCost" className="block text-sm font-medium text-gray-700 mb-2">
                      Total Cost ($) *
                    </label>
                    <input
                      type="text"
                      id="selectedTotalCost"
                      value={isEditMode ? selectedJob.totalCost.toString() : formatCurrency(selectedJob.totalCost)}
                      onChange={(e) => handleSelectedJobChange('totalCost', e.target.value.replace(/,/g, ''))}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                        !isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Profit Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Current Profit:</span>
                    <span className={`text-lg font-semibold ${
                      Number(selectedJob.totalRevenue) - Number(selectedJob.totalCost) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Number(selectedJob.totalRevenue) - Number(selectedJob.totalCost))}
                    </span>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-between pt-4">
                  <div>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={handleDeleteJob}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete Job
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseViewEditModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      {isEditMode ? 'Cancel' : 'Close'}
                    </button>
                    {isEditMode && (
                      <button
                        type="submit"
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Save Changes
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;