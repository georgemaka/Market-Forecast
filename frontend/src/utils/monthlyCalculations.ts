/**
 * Monthly breakdown calculations for Market Forecasting Platform
 * Handles monthly revenue/cost distribution and cash flow analysis
 */

import { Job } from './calculations';

export interface MonthlyData {
  month: string; // Format: "2024-11" (YYYY-MM)
  monthLabel: string; // Format: "Nov 2024"
  revenue: number;
  cost: number;
  profit: number;
  jobCount: number;
  jobs: Array<{
    id: number;
    jobName: string;
    market: string;
    type: 'Backlog' | 'SWAG';
    probability: number;
    startDate: string;
    endDate: string;
    totalRevenue: number;
    totalCost: number;
    monthlyRevenue: number;
    monthlyCost: number;
    monthlyProfit: number;
    isStartMonth: boolean;
    isEndMonth: boolean;
  }>;
}

export interface MonthlyBreakdown {
  months: MonthlyData[];
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  startMonth: string;
  endMonth: string;
}

/**
 * Get array of months between two dates (inclusive)
 */
export const getMonthsBetween = (startDate: string, endDate: string): string[] => {
  const months: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set to first day of start month
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  
  while (current <= endMonth) {
    const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    months.push(monthStr);
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
};

/**
 * Format month string for display
 */
export const formatMonthLabel = (month: string): string => {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
};

/**
 * Calculate monthly distribution for a single job
 */
export const calculateJobMonthlyDistribution = (job: Job): Array<{
  month: string;
  monthLabel: string;
  revenue: number;
  cost: number;
  profit: number;
  isStartMonth: boolean;
  isEndMonth: boolean;
}> => {
  const months = getMonthsBetween(job.startDate, job.endDate);
  const monthCount = months.length;
  
  if (monthCount === 0) return [];
  
  // Straight-line distribution
  const monthlyRevenue = job.totalRevenue / monthCount;
  const monthlyCost = job.totalCost / monthCount;
  const monthlyProfit = monthlyRevenue - monthlyCost;
  
  const startMonth = months[0];
  const endMonth = months[months.length - 1];
  
  return months.map(month => ({
    month,
    monthLabel: formatMonthLabel(month),
    revenue: monthlyRevenue,
    cost: monthlyCost,
    profit: monthlyProfit,
    isStartMonth: month === startMonth,
    isEndMonth: month === endMonth
  }));
};

/**
 * Calculate monthly breakdown for multiple jobs
 */
export const calculateMonthlyBreakdown = (jobs: Job[], monthsToShow: number = 12): MonthlyBreakdown => {
  // Find the date range to cover
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1); // Start 6 months ago
  const endDate = new Date(now.getFullYear(), now.getMonth() + monthsToShow - 6, 1); // Show requested months
  
  // Generate all months in the range
  const allMonths = getMonthsBetween(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );
  
  // Initialize monthly data structure
  const monthlyDataMap: Record<string, MonthlyData> = {};
  
  allMonths.forEach(month => {
    monthlyDataMap[month] = {
      month,
      monthLabel: formatMonthLabel(month),
      revenue: 0,
      cost: 0,
      profit: 0,
      jobCount: 0,
      jobs: []
    };
  });
  
  // Process each job
  jobs.forEach(job => {
    const jobMonthlyData = calculateJobMonthlyDistribution(job);
    
    jobMonthlyData.forEach(monthData => {
      if (monthlyDataMap[monthData.month]) {
        const monthEntry = monthlyDataMap[monthData.month];
        
        // Add to totals
        monthEntry.revenue += monthData.revenue;
        monthEntry.cost += monthData.cost;
        monthEntry.profit += monthData.profit;
        monthEntry.jobCount++;
        
        // Add job details
        monthEntry.jobs.push({
          id: job.id,
          jobName: job.jobName,
          market: job.market,
          type: job.type,
          probability: job.probability,
          startDate: job.startDate,
          endDate: job.endDate,
          totalRevenue: job.totalRevenue,
          totalCost: job.totalCost,
          monthlyRevenue: monthData.revenue,
          monthlyCost: monthData.cost,
          monthlyProfit: monthData.profit,
          isStartMonth: monthData.isStartMonth,
          isEndMonth: monthData.isEndMonth
        });
      }
    });
  });
  
  // Convert to array and sort by month
  const monthsArray = Object.values(monthlyDataMap).sort((a, b) => a.month.localeCompare(b.month));
  
  // Calculate totals
  const totalRevenue = monthsArray.reduce((sum, month) => sum + month.revenue, 0);
  const totalCost = monthsArray.reduce((sum, month) => sum + month.cost, 0);
  const totalProfit = totalRevenue - totalCost;
  
  return {
    months: monthsArray,
    totalRevenue,
    totalCost,
    totalProfit,
    startMonth: allMonths[0],
    endMonth: allMonths[allMonths.length - 1]
  };
};

/**
 * Calculate fiscal year monthly breakdown
 */
export const calculateFiscalYearMonthlyBreakdown = (jobs: Job[], fiscalYear: number): MonthlyBreakdown => {
  // Fiscal year runs November to October
  const startDate = `${fiscalYear}-11-01`;
  const endDate = `${fiscalYear + 1}-10-31`;
  
  const fiscalMonths = getMonthsBetween(startDate, endDate);
  
  // Initialize monthly data for fiscal year
  const monthlyDataMap: Record<string, MonthlyData> = {};
  
  fiscalMonths.forEach(month => {
    monthlyDataMap[month] = {
      month,
      monthLabel: formatMonthLabel(month),
      revenue: 0,
      cost: 0,
      profit: 0,
      jobCount: 0,
      jobs: []
    };
  });
  
  // Filter jobs that overlap with fiscal year
  const fiscalYearJobs = jobs.filter(job => {
    const jobStart = new Date(job.startDate);
    const jobEnd = new Date(job.endDate);
    const fyStart = new Date(startDate);
    const fyEnd = new Date(endDate);
    
    return jobStart <= fyEnd && jobEnd >= fyStart;
  });
  
  // Process each job
  fiscalYearJobs.forEach(job => {
    const jobMonthlyData = calculateJobMonthlyDistribution(job);
    
    jobMonthlyData.forEach(monthData => {
      if (monthlyDataMap[monthData.month]) {
        const monthEntry = monthlyDataMap[monthData.month];
        
        monthEntry.revenue += monthData.revenue;
        monthEntry.cost += monthData.cost;
        monthEntry.profit += monthData.profit;
        monthEntry.jobCount++;
        
        monthEntry.jobs.push({
          id: job.id,
          jobName: job.jobName,
          market: job.market,
          type: job.type,
          probability: job.probability,
          startDate: job.startDate,
          endDate: job.endDate,
          totalRevenue: job.totalRevenue,
          totalCost: job.totalCost,
          monthlyRevenue: monthData.revenue,
          monthlyCost: monthData.cost,
          monthlyProfit: monthData.profit,
          isStartMonth: monthData.isStartMonth,
          isEndMonth: monthData.isEndMonth
        });
      }
    });
  });
  
  const monthsArray = Object.values(monthlyDataMap).sort((a, b) => a.month.localeCompare(b.month));
  
  const totalRevenue = monthsArray.reduce((sum, month) => sum + month.revenue, 0);
  const totalCost = monthsArray.reduce((sum, month) => sum + month.cost, 0);
  const totalProfit = totalRevenue - totalCost;
  
  return {
    months: monthsArray,
    totalRevenue,
    totalCost,
    totalProfit,
    startMonth: fiscalMonths[0],
    endMonth: fiscalMonths[fiscalMonths.length - 1]
  };
};

/**
 * Get monthly trends and comparisons
 */
export const getMonthlyTrends = (monthlyBreakdown: MonthlyBreakdown): Array<{
  month: string;
  monthLabel: string;
  revenue: number;
  cost: number;
  profit: number;
  revenueChange: number;
  revenueChangePercent: number;
  profitMargin: number;
  cumulativeRevenue: number;
  cumulativeCost: number;
  cumulativeProfit: number;
}> => {
  const trends = [];
  let cumulativeRevenue = 0;
  let cumulativeCost = 0;
  let cumulativeProfit = 0;
  
  for (let i = 0; i < monthlyBreakdown.months.length; i++) {
    const month = monthlyBreakdown.months[i];
    const previousMonth = i > 0 ? monthlyBreakdown.months[i - 1] : null;
    
    cumulativeRevenue += month.revenue;
    cumulativeCost += month.cost;
    cumulativeProfit += month.profit;
    
    const revenueChange = previousMonth ? month.revenue - previousMonth.revenue : 0;
    const revenueChangePercent = previousMonth && previousMonth.revenue > 0 
      ? (revenueChange / previousMonth.revenue) * 100 
      : 0;
    
    const profitMargin = month.revenue > 0 ? (month.profit / month.revenue) * 100 : 0;
    
    trends.push({
      month: month.month,
      monthLabel: month.monthLabel,
      revenue: month.revenue,
      cost: month.cost,
      profit: month.profit,
      revenueChange,
      revenueChangePercent,
      profitMargin,
      cumulativeRevenue,
      cumulativeCost,
      cumulativeProfit
    });
  }
  
  return trends;
};

/**
 * Calculate quarterly summary from monthly data
 */
export const getQuarterlySummary = (monthlyBreakdown: MonthlyBreakdown): Array<{
  quarter: string;
  quarterLabel: string;
  months: string[];
  revenue: number;
  cost: number;
  profit: number;
  jobCount: number;
}> => {
  const quarters: Record<string, {
    quarter: string;
    quarterLabel: string;
    months: string[];
    revenue: number;
    cost: number;
    profit: number;
    jobCount: number;
  }> = {};
  
  monthlyBreakdown.months.forEach(month => {
    const [year, monthNum] = month.month.split('-');
    const quarterNum = Math.ceil(parseInt(monthNum) / 3);
    const quarterKey = `${year}-Q${quarterNum}`;
    
    if (!quarters[quarterKey]) {
      quarters[quarterKey] = {
        quarter: quarterKey,
        quarterLabel: `Q${quarterNum} ${year}`,
        months: [],
        revenue: 0,
        cost: 0,
        profit: 0,
        jobCount: 0
      };
    }
    
    quarters[quarterKey].months.push(month.month);
    quarters[quarterKey].revenue += month.revenue;
    quarters[quarterKey].cost += month.cost;
    quarters[quarterKey].profit += month.profit;
    quarters[quarterKey].jobCount += month.jobCount;
  });
  
  return Object.values(quarters).sort((a, b) => a.quarter.localeCompare(b.quarter));
};

export default {
  getMonthsBetween,
  formatMonthLabel,
  calculateJobMonthlyDistribution,
  calculateMonthlyBreakdown,
  calculateFiscalYearMonthlyBreakdown,
  getMonthlyTrends,
  getQuarterlySummary
};