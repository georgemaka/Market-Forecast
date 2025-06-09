/**
 * Date utility functions specifically for Market Forecasting Platform
 * Handles fiscal year logic, date ranges, and business calendar operations
 */

export interface DateRange {
  startDate: string;
  endDate: string;
  label?: string;
}

export interface FiscalYearInfo {
  current: number;
  previous: number;
  next: number;
  currentRange: DateRange;
  previousRange: DateRange;
  nextRange: DateRange;
}

// =====================================================
// FISCAL YEAR UTILITIES
// =====================================================

/**
 * Get comprehensive fiscal year information
 */
export const getFiscalYearInfo = (): FiscalYearInfo => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based
  
  // Determine current fiscal year
  const currentFY = currentMonth >= 10 ? currentYear : currentYear - 1;
  const previousFY = currentFY - 1;
  const nextFY = currentFY + 1;
  
  return {
    current: currentFY,
    previous: previousFY,
    next: nextFY,
    currentRange: {
      startDate: `${currentFY}-11-01`,
      endDate: `${currentFY + 1}-10-31`,
      label: `FY ${currentFY}-${(currentFY + 1).toString().slice(-2)}`
    },
    previousRange: {
      startDate: `${previousFY}-11-01`,
      endDate: `${previousFY + 1}-10-31`,
      label: `FY ${previousFY}-${(previousFY + 1).toString().slice(-2)}`
    },
    nextRange: {
      startDate: `${nextFY}-11-01`,
      endDate: `${nextFY + 1}-10-31`,
      label: `FY ${nextFY}-${(nextFY + 1).toString().slice(-2)}`
    }
  };
};

/**
 * Get fiscal quarter for a given date
 */
export const getFiscalQuarter = (date: string): { quarter: number; fiscalYear: number; label: string } => {
  const d = new Date(date);
  const month = d.getMonth(); // 0-based
  const year = d.getFullYear();
  
  let quarter: number;
  let fiscalYear: number;
  
  if (month >= 10) { // Nov, Dec - Q1 of new fiscal year
    quarter = 1;
    fiscalYear = year;
  } else if (month >= 7) { // Aug, Sep, Oct - Q4 of current fiscal year
    quarter = 4;
    fiscalYear = year - 1;
  } else if (month >= 4) { // May, Jun, Jul - Q3 of current fiscal year
    quarter = 3;
    fiscalYear = year - 1;
  } else { // Jan, Feb, Mar, Apr - Q2 of current fiscal year
    quarter = 2;
    fiscalYear = year - 1;
  }
  
  return {
    quarter,
    fiscalYear,
    label: `Q${quarter} FY${fiscalYear.toString().slice(-2)}`
  };
};

/**
 * Get all fiscal quarters for a fiscal year
 */
export const getFiscalQuarters = (fiscalYear: number): DateRange[] => {
  return [
    {
      startDate: `${fiscalYear}-11-01`,
      endDate: `${fiscalYear + 1}-01-31`,
      label: `Q1 FY${fiscalYear.toString().slice(-2)}`
    },
    {
      startDate: `${fiscalYear + 1}-02-01`,
      endDate: `${fiscalYear + 1}-04-30`,
      label: `Q2 FY${fiscalYear.toString().slice(-2)}`
    },
    {
      startDate: `${fiscalYear + 1}-05-01`,
      endDate: `${fiscalYear + 1}-07-31`,
      label: `Q3 FY${fiscalYear.toString().slice(-2)}`
    },
    {
      startDate: `${fiscalYear + 1}-08-01`,
      endDate: `${fiscalYear + 1}-10-31`,
      label: `Q4 FY${fiscalYear.toString().slice(-2)}`
    }
  ];
};

// =====================================================
// DATE RANGE UTILITIES
// =====================================================

/**
 * Get predefined date ranges for common periods
 */
export const getCommonDateRanges = (): Record<string, DateRange> => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const fyInfo = getFiscalYearInfo();
  
  // Current month
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  
  // Current quarter (calendar)
  const quarterStart = new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1);
  const quarterEnd = new Date(currentYear, Math.floor(currentMonth / 3) * 3 + 3, 0);
  
  // Year to date
  const ytdStart = new Date(currentYear, 0, 1);
  const ytdEnd = now;
  
  // Last 30 days
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Last 90 days
  const last90Start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  return {
    thisMonth: {
      startDate: monthStart.toISOString().split('T')[0],
      endDate: monthEnd.toISOString().split('T')[0],
      label: 'This Month'
    },
    thisQuarter: {
      startDate: quarterStart.toISOString().split('T')[0],
      endDate: quarterEnd.toISOString().split('T')[0],
      label: 'This Quarter'
    },
    yearToDate: {
      startDate: ytdStart.toISOString().split('T')[0],
      endDate: ytdEnd.toISOString().split('T')[0],
      label: 'Year to Date'
    },
    last30Days: {
      startDate: last30Start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      label: 'Last 30 Days'
    },
    last90Days: {
      startDate: last90Start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      label: 'Last 90 Days'
    },
    currentFiscalYear: fyInfo.currentRange,
    previousFiscalYear: fyInfo.previousRange,
    nextFiscalYear: fyInfo.nextRange
  };
};

/**
 * Check if a date is within a business day (Monday-Friday)
 */
export const isBusinessDay = (date: string): boolean => {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday = 1, Friday = 5
};

/**
 * Get business days between two dates
 */
export const getBusinessDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessDays = 0;
  
  const current = new Date(start);
  while (current <= end) {
    if (isBusinessDay(current.toISOString().split('T')[0])) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
};

/**
 * Add business days to a date
 */
export const addBusinessDays = (startDate: string, businessDays: number): string => {
  const date = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < businessDays) {
    date.setDate(date.getDate() + 1);
    if (isBusinessDay(date.toISOString().split('T')[0])) {
      daysAdded++;
    }
  }
  
  return date.toISOString().split('T')[0];
};

// =====================================================
// DATE VALIDATION
// =====================================================

/**
 * Validate that a date range is logical
 */
export const validateDateRange = (startDate: string, endDate: string): { isValid: boolean; error?: string } => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime())) {
    return { isValid: false, error: 'Invalid start date' };
  }
  
  if (isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid end date' };
  }
  
  if (start >= end) {
    return { isValid: false, error: 'End date must be after start date' };
  }
  
  // Check if range is too far in the future (more than 10 years)
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
  
  if (end > tenYearsFromNow) {
    return { isValid: false, error: 'End date cannot be more than 10 years in the future' };
  }
  
  return { isValid: true };
};

/**
 * Check if a date is within a reasonable range for job scheduling
 */
export const isValidJobDate = (date: string): { isValid: boolean; warning?: string } => {
  const d = new Date(date);
  const now = new Date();
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  const fiveYearsFromNow = new Date();
  fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
  
  if (d < fiveYearsAgo) {
    return { isValid: false, warning: 'Date is more than 5 years in the past' };
  }
  
  if (d > fiveYearsFromNow) {
    return { isValid: false, warning: 'Date is more than 5 years in the future' };
  }
  
  if (d < now) {
    return { isValid: true, warning: 'This is a past date' };
  }
  
  return { isValid: true };
};

// =====================================================
// DATE FORMATTING
// =====================================================

/**
 * Format date for different contexts
 */
export const formatDateForContext = (date: string, context: 'display' | 'short' | 'long' | 'relative'): string => {
  const d = new Date(date);
  const now = new Date();
  
  switch (context) {
    case 'display':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit'
      });
    
    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    
    case 'relative':
      const diffTime = d.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
      if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
      if (diffDays > 7) return `${Math.ceil(diffDays / 7)} weeks from now`;
      if (diffDays < -7) return `${Math.ceil(Math.abs(diffDays) / 7)} weeks ago`;
      
      return formatDateForContext(date, 'display');
    
    default:
      return formatDateForContext(date, 'display');
  }
};

/**
 * Get fiscal year label for display
 */
export const getFiscalYearLabel = (fiscalYear: number, format: 'short' | 'long' = 'short'): string => {
  if (format === 'long') {
    return `Fiscal Year ${fiscalYear}-${fiscalYear + 1}`;
  }
  return `FY ${fiscalYear}-${(fiscalYear + 1).toString().slice(-2)}`;
};

/**
 * Get all months between two dates (inclusive)
 */
export const getMonthsBetween = (startDate: string, endDate: string): string[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months: string[] = [];
  
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  
  while (current <= endMonth) {
    const year = current.getFullYear();
    const month = (current.getMonth() + 1).toString().padStart(2, '0');
    months.push(`${year}-${month}`);
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
};

/**
 * Format month string to display label
 */
export const formatMonthLabel = (monthString: string): string => {
  const date = new Date(`${monthString}-01`);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
};

export default {
  getFiscalYearInfo,
  getFiscalQuarter,
  getFiscalQuarters,
  getCommonDateRanges,
  isBusinessDay,
  getBusinessDaysBetween,
  addBusinessDays,
  validateDateRange,
  isValidJobDate,
  formatDateForContext,
  getFiscalYearLabel,
  getMonthsBetween,
  formatMonthLabel
};