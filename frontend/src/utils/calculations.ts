/**
 * Core calculation utilities for Market Forecasting Platform
 * Handles all financial calculations, date logic, and business rules
 */

export interface Job {
  id: number;
  market: string;
  jobName: string;
  type: 'Backlog' | 'SWAG';
  probability: number;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalCost: number;
}

export interface FiscalYear {
  year: number;
  startDate: string;
  endDate: string;
  label: string;
}

export interface KPIBreakdown {
  total: number;
  backlog: number;
  swag: number;
  swagWeighted?: number; // SWAG revenue/cost adjusted by probability
}

export interface MarketKPIs {
  revenue: KPIBreakdown;
  cost: KPIBreakdown;
  profit: KPIBreakdown;
  jobCount: {
    total: number;
    backlog: number;
    swag: number;
  };
}

// =====================================================
// CORE FINANCIAL CALCULATIONS
// =====================================================

/**
 * Calculate profit for a single job
 */
export const calculateJobProfit = (job: Job): number => {
  return job.totalRevenue - job.totalCost;
};

/**
 * Calculate weighted revenue/cost for SWAG jobs based on probability
 */
export const calculateWeightedValue = (value: number, type: string, probability: number): number => {
  if (type === 'Backlog') {
    return value; // Backlog is always 100% probability
  }
  return value * (probability / 100);
};

/**
 * Get effective revenue (probability-weighted for SWAG jobs)
 */
export const getEffectiveRevenue = (job: Job): number => {
  return calculateWeightedValue(job.totalRevenue, job.type, job.probability);
};

/**
 * Get effective cost (probability-weighted for SWAG jobs)
 */
export const getEffectiveCost = (job: Job): number => {
  return calculateWeightedValue(job.totalCost, job.type, job.probability);
};

/**
 * Get effective profit (probability-weighted for SWAG jobs)
 */
export const getEffectiveProfit = (job: Job): number => {
  return getEffectiveRevenue(job) - getEffectiveCost(job);
};

/**
 * Calculate profit margin as percentage
 */
export const calculateProfitMargin = (revenue: number, cost: number): number => {
  if (revenue === 0) return 0;
  return ((revenue - cost) / revenue) * 100;
};

/**
 * Calculate job duration in days
 */
export const calculateJobDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate average daily revenue for a job
 */
export const calculateDailyRevenue = (job: Job): number => {
  const duration = calculateJobDuration(job.startDate, job.endDate);
  return duration > 0 ? job.totalRevenue / duration : 0;
};

// =====================================================
// FISCAL YEAR CALCULATIONS
// =====================================================

/**
 * Get current fiscal year (November - October)
 */
export const getCurrentFiscalYear = (): number => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (0 = January, 10 = November)
  
  // If current month is November (10) or December (11), we're in the new fiscal year
  if (currentMonth >= 10) {
    return currentYear;
  } else {
    // If January-October, we're still in the previous fiscal year
    return currentYear - 1;
  }
};

/**
 * Get fiscal year date range
 */
export const getFiscalYearDates = (fiscalYear: number): { start: string; end: string } => {
  return {
    start: `${fiscalYear}-11-01`,
    end: `${fiscalYear + 1}-10-31`
  };
};

/**
 * Get fiscal year object with all details
 */
export const getFiscalYear = (year: number): FiscalYear => {
  const dates = getFiscalYearDates(year);
  return {
    year,
    startDate: dates.start,
    endDate: dates.end,
    label: `FY ${year}-${(year + 1).toString().slice(-2)}`
  };
};

/**
 * Get available fiscal years (current and next 2 years)
 */
export const getAvailableFiscalYears = (): FiscalYear[] => {
  const currentFY = getCurrentFiscalYear();
  return [
    getFiscalYear(currentFY),
    getFiscalYear(currentFY + 1),
    getFiscalYear(currentFY + 2)
  ];
};

/**
 * Check if a job overlaps with a fiscal year
 */
export const isJobInFiscalYear = (job: Job, fiscalYear: number): boolean => {
  const jobStart = new Date(job.startDate);
  const jobEnd = new Date(job.endDate);
  const fyDates = getFiscalYearDates(fiscalYear);
  const fyStart = new Date(fyDates.start);
  const fyEnd = new Date(fyDates.end);
  
  // Check if job overlaps with fiscal year
  return jobStart <= fyEnd && jobEnd >= fyStart;
};

/**
 * Check if a job is within a custom date range
 */
export const isJobInDateRange = (job: Job, startDate: string, endDate: string): boolean => {
  const jobStart = new Date(job.startDate);
  const jobEnd = new Date(job.endDate);
  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);
  
  return jobStart <= rangeEnd && jobEnd >= rangeStart;
};

// =====================================================
// KPI AGGREGATION FUNCTIONS
// =====================================================

/**
 * Calculate comprehensive KPIs for a list of jobs
 */
export const calculateKPIs = (jobs: Job[]): MarketKPIs => {
  const backlogJobs = jobs.filter(job => job.type === 'Backlog');
  const swagJobs = jobs.filter(job => job.type === 'SWAG');
  
  // Revenue calculations
  const backlogRevenue = backlogJobs.reduce((sum, job) => sum + job.totalRevenue, 0);
  const swagRevenue = swagJobs.reduce((sum, job) => sum + job.totalRevenue, 0);
  const swagWeightedRevenue = swagJobs.reduce((sum, job) => 
    sum + calculateWeightedValue(job.totalRevenue, job.type, job.probability), 0);
  const effectiveTotalRevenue = backlogRevenue + swagWeightedRevenue; // Use weighted for effective total
  
  // Cost calculations
  const backlogCost = backlogJobs.reduce((sum, job) => sum + job.totalCost, 0);
  const swagCost = swagJobs.reduce((sum, job) => sum + job.totalCost, 0);
  const swagWeightedCost = swagJobs.reduce((sum, job) => 
    sum + calculateWeightedValue(job.totalCost, job.type, job.probability), 0);
  const effectiveTotalCost = backlogCost + swagWeightedCost; // Use weighted for effective total
  
  // Profit calculations
  const backlogProfit = backlogRevenue - backlogCost;
  const swagProfit = swagRevenue - swagCost;
  const swagWeightedProfit = swagWeightedRevenue - swagWeightedCost;
  const effectiveTotalProfit = effectiveTotalRevenue - effectiveTotalCost;
  
  return {
    revenue: {
      total: effectiveTotalRevenue, // Use effective (probability-weighted) totals by default
      backlog: backlogRevenue,
      swag: swagRevenue,
      swagWeighted: swagWeightedRevenue
    },
    cost: {
      total: effectiveTotalCost, // Use effective (probability-weighted) totals by default
      backlog: backlogCost,
      swag: swagCost,
      swagWeighted: swagWeightedCost
    },
    profit: {
      total: effectiveTotalProfit, // Use effective (probability-weighted) totals by default
      backlog: backlogProfit,
      swag: swagProfit,
      swagWeighted: swagWeightedProfit
    },
    jobCount: {
      total: jobs.length,
      backlog: backlogJobs.length,
      swag: swagJobs.length
    }
  };
};

/**
 * Calculate KPIs by market
 */
export const calculateMarketKPIs = (jobs: Job[]): Record<string, MarketKPIs> => {
  const markets = [...new Set(jobs.map(job => job.market))];
  const result: Record<string, MarketKPIs> = {};
  
  markets.forEach(market => {
    const marketJobs = jobs.filter(job => job.market === market);
    result[market] = calculateKPIs(marketJobs);
  });
  
  return result;
};

/**
 * Calculate trend comparison between two periods
 */
export const calculateTrend = (current: number, previous: number): {
  change: number;
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
} => {
  const change = current - previous;
  const percentage = previous !== 0 ? (change / previous) * 100 : 0;
  
  let direction: 'up' | 'down' | 'neutral' = 'neutral';
  if (change > 0) direction = 'up';
  else if (change < 0) direction = 'down';
  
  return {
    change,
    percentage,
    direction
  };
};

// =====================================================
// BUSINESS RULE VALIDATION
// =====================================================

/**
 * Validate job data according to business rules
 */
export const validateJob = (job: Partial<Job>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields
  if (!job.jobName?.trim()) errors.push('Job name is required');
  if (!job.market) errors.push('Market is required');
  if (!job.type) errors.push('Job type is required');
  if (!job.startDate) errors.push('Start date is required');
  if (!job.endDate) errors.push('End date is required');
  if (job.totalRevenue === undefined || job.totalRevenue < 0) errors.push('Total revenue must be a positive number');
  if (job.totalCost === undefined || job.totalCost < 0) errors.push('Total cost must be a positive number');
  
  // Date validation
  if (job.startDate && job.endDate) {
    const start = new Date(job.startDate);
    const end = new Date(job.endDate);
    if (start >= end) {
      errors.push('End date must be after start date');
    }
  }
  
  // Probability validation
  if (job.type === 'Backlog' && job.probability !== 100) {
    errors.push('Backlog jobs must have 100% probability');
  }
  
  if (job.type === 'SWAG') {
    if (job.probability === undefined || job.probability < 0 || job.probability > 100) {
      errors.push('SWAG job probability must be between 0 and 100');
    }
  }
  
  // Business logic validation
  if (job.totalRevenue !== undefined && job.totalCost !== undefined) {
    const margin = calculateProfitMargin(job.totalRevenue, job.totalCost);
    
    // Warning for low profit margins (not an error, just validation)
    if (margin < 5) {
      errors.push('Warning: Profit margin is less than 5%');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Auto-correct job data according to business rules
 */
export const autoCorrectJob = (job: Partial<Job>): Partial<Job> => {
  const corrected = { ...job };
  
  // Auto-set probability for Backlog jobs
  if (corrected.type === 'Backlog') {
    corrected.probability = 100;
  }
  
  // Ensure probability is within bounds for SWAG jobs
  if (corrected.type === 'SWAG' && corrected.probability !== undefined) {
    corrected.probability = Math.max(0, Math.min(100, corrected.probability));
  }
  
  // Round financial values to 2 decimal places
  if (corrected.totalRevenue !== undefined) {
    corrected.totalRevenue = Math.round(corrected.totalRevenue * 100) / 100;
  }
  if (corrected.totalCost !== undefined) {
    corrected.totalCost = Math.round(corrected.totalCost * 100) / 100;
  }
  
  return corrected;
};

// =====================================================
// FORMATTING UTILITIES
// =====================================================

/**
 * Format currency values
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format duration in days
 */
export const formatDuration = (days: number): string => {
  if (days < 30) {
    return `${days} days`;
  } else if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.round(days / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
};

// =====================================================
// FORECASTING UTILITIES
// =====================================================

/**
 * Project future revenue based on historical data
 */
export const projectFutureRevenue = (historicalJobs: Job[], monthsAhead: number): number => {
  if (historicalJobs.length === 0) return 0;
  
  const monthlyRevenue = historicalJobs.reduce((sum, job) => sum + job.totalRevenue, 0) / 12;
  return monthlyRevenue * monthsAhead;
};

/**
 * Calculate market growth rate
 */
export const calculateGrowthRate = (jobs: Job[], market: string): number => {
  const marketJobs = jobs.filter(job => job.market === market);
  // Simplified growth rate calculation - in real implementation, 
  // this would use historical data across multiple periods
  return marketJobs.length > 0 ? 8.5 : 0; // Placeholder growth rate
};

export default {
  calculateJobProfit,
  calculateWeightedValue,
  calculateProfitMargin,
  calculateJobDuration,
  calculateDailyRevenue,
  getCurrentFiscalYear,
  getFiscalYearDates,
  getFiscalYear,
  getAvailableFiscalYears,
  isJobInFiscalYear,
  isJobInDateRange,
  calculateKPIs,
  calculateMarketKPIs,
  calculateTrend,
  validateJob,
  autoCorrectJob,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDuration,
  projectFutureRevenue,
  calculateGrowthRate
};