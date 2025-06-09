/**
 * Data service for Market Forecasting Platform
 * Centralized data management, validation, and business logic enforcement
 */

import { Job, calculateKPIs, calculateJobProfit, validateJob, autoCorrectJob } from '../utils/calculations';
import { getFiscalYearInfo, isValidJobDate } from '../utils/dateUtils';
import { JobWithAllocations } from '../utils/allocationTypes';
import { allocationService } from './allocationService';

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface JobFilters {
  searchTerm?: string;
  markets?: string[];
  types?: ('Backlog' | 'SWAG')[];
  dateFilter?: 'all' | 'fiscal' | 'custom';
  fiscalYear?: number;
  customStartDate?: string;
  customEndDate?: string;
  minRevenue?: number;
  maxRevenue?: number;
  minProfit?: number;
  maxProfit?: number;
}

class DataService {
  private jobs: Job[] = [];
  private jobsWithAllocations: Map<number, JobWithAllocations> = new Map();
  private nextId: number = 1;
  
  // Business configuration
  private readonly MARKETS = ['Environmental', 'Solar', 'Residential', 'Public Works'];
  private readonly JOB_TYPES = ['Backlog', 'SWAG'] as const;
  
  constructor() {
    this.initializeWithSampleData();
  }
  
  /**
   * Reset and reinitialize data (useful for development/testing)
   */
  resetData(): void {
    this.jobs = [];
    this.jobsWithAllocations.clear();
    this.nextId = 1;
    this.initializeWithSampleData();
  }
  
  // =====================================================
  // INITIALIZATION & SAMPLE DATA
  // =====================================================
  
  private initializeWithSampleData(): void {
    const sampleJobs: Omit<Job, 'id'>[] = [
      {
        market: "Environmental",
        jobName: "Environmental Impact Assessment",
        type: "Backlog",
        probability: 100,
        startDate: "2024-12-15",
        endDate: "2025-03-30",
        totalRevenue: 125000,
        totalCost: 82000
      },
      {
        market: "Environmental",
        jobName: "Water Quality Analysis",
        type: "SWAG",
        probability: 75,
        startDate: "2025-02-01",
        endDate: "2025-04-15",
        totalRevenue: 87500,
        totalCost: 61000
      },
      {
        market: "Solar",
        jobName: "Solar Panel Installation Study",
        type: "Backlog",
        probability: 100,
        startDate: "2024-11-01",
        endDate: "2025-02-28",
        totalRevenue: 520000,
        totalCost: 380000
      },
      {
        market: "Solar",
        jobName: "Renewable Energy Forecast",
        type: "SWAG",
        probability: 45,
        startDate: "2025-03-01",
        endDate: "2025-05-30",
        totalRevenue: 1500000,
        totalCost: 1120000
      },
      {
        market: "Residential",
        jobName: "Housing Market Analysis",
        type: "Backlog",
        probability: 100,
        startDate: "2025-01-15",
        endDate: "2025-04-20",
        totalRevenue: 980000,
        totalCost: 650000
      },
      {
        market: "Residential",
        jobName: "Property Development Study",
        type: "SWAG",
        probability: 60,
        startDate: "2025-03-10",
        endDate: "2025-06-15",
        totalRevenue: 1850000,
        totalCost: 1320000
      },
      {
        market: "Public Works",
        jobName: "Infrastructure Modernization",
        type: "Backlog",
        probability: 100,
        startDate: "2024-11-20",
        endDate: "2025-05-10",
        totalRevenue: 2200000,
        totalCost: 1680000
      },
      {
        market: "Public Works",
        jobName: "Transportation Planning",
        type: "SWAG",
        probability: 85,
        startDate: "2025-04-01",
        endDate: "2025-07-30",
        totalRevenue: 3100000,
        totalCost: 2450000
      },
      {
        market: "Environmental",
        jobName: "Wetland Restoration Project",
        type: "SWAG",
        probability: 40,
        startDate: "2025-06-01",
        endDate: "2025-09-30",
        totalRevenue: 750000,
        totalCost: 550000
      },
      {
        market: "Solar",
        jobName: "Commercial Solar Assessment",
        type: "Backlog",
        probability: 100,
        startDate: "2025-02-15",
        endDate: "2025-05-15",
        totalRevenue: 425000,
        totalCost: 320000
      }
    ];
    
    sampleJobs.forEach(jobData => {
      this.addJob(jobData);
    });
  }
  
  // =====================================================
  // CRUD OPERATIONS
  // =====================================================
  
  getAllJobs(): Job[] {
    return [...this.jobs];
  }
  
  getJobById(id: number): Job | undefined {
    return this.jobs.find(job => job.id === id);
  }
  
  addJob(jobData: Omit<Job, 'id'>): { success: boolean; job?: Job; errors?: string[] } {
    // Auto-correct the job data
    const correctedData = autoCorrectJob(jobData);
    
    // Validate the job
    const validation = validateJob(correctedData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    
    // Create the job
    const newJob: Job = {
      ...correctedData as Job,
      id: this.nextId++
    };
    
    this.jobs.push(newJob);
    return { success: true, job: newJob };
  }
  
  updateJob(id: number, updates: Partial<Omit<Job, 'id'>>): { success: boolean; job?: Job; errors?: string[] } {
    const existingJob = this.getJobById(id);
    if (!existingJob) {
      return { success: false, errors: ['Job not found'] };
    }
    
    // Merge updates with existing job
    const updatedData = { ...existingJob, ...updates };
    
    // Auto-correct the job data
    const correctedData = autoCorrectJob(updatedData);
    
    // Validate the updated job
    const validation = validateJob(correctedData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    
    // Update the job
    const jobIndex = this.jobs.findIndex(job => job.id === id);
    this.jobs[jobIndex] = { ...correctedData as Job, id };
    
    return { success: true, job: this.jobs[jobIndex] };
  }
  
  deleteJob(id: number): { success: boolean; error?: string } {
    const jobIndex = this.jobs.findIndex(job => job.id === id);
    if (jobIndex === -1) {
      return { success: false, error: 'Job not found' };
    }
    
    this.jobs.splice(jobIndex, 1);
    return { success: true };
  }
  
  // =====================================================
  // FILTERING & SEARCHING
  // =====================================================
  
  filterJobs(filters: JobFilters): Job[] {
    let filteredJobs = [...this.jobs];
    
    // Search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.jobName.toLowerCase().includes(searchTerm) ||
        job.market.toLowerCase().includes(searchTerm) ||
        job.type.toLowerCase().includes(searchTerm) ||
        job.totalRevenue.toString().includes(searchTerm) ||
        job.totalCost.toString().includes(searchTerm) ||
        job.startDate.includes(searchTerm) ||
        job.endDate.includes(searchTerm) ||
        job.probability.toString().includes(searchTerm)
      );
    }
    
    // Market filter
    if (filters.markets && filters.markets.length > 0) {
      filteredJobs = filteredJobs.filter(job => filters.markets!.includes(job.market));
    }
    
    // Type filter
    if (filters.types && filters.types.length > 0) {
      filteredJobs = filteredJobs.filter(job => filters.types!.includes(job.type));
    }
    
    // Date filter
    if (filters.dateFilter === 'fiscal' && filters.fiscalYear) {
      filteredJobs = this.filterByFiscalYear(filteredJobs, filters.fiscalYear);
    } else if (filters.dateFilter === 'custom' && filters.customStartDate && filters.customEndDate) {
      filteredJobs = this.filterByDateRange(filteredJobs, filters.customStartDate, filters.customEndDate);
    }
    
    // Revenue filter
    if (filters.minRevenue !== undefined) {
      filteredJobs = filteredJobs.filter(job => job.totalRevenue >= filters.minRevenue!);
    }
    if (filters.maxRevenue !== undefined) {
      filteredJobs = filteredJobs.filter(job => job.totalRevenue <= filters.maxRevenue!);
    }
    
    // Profit filter
    if (filters.minProfit !== undefined) {
      filteredJobs = filteredJobs.filter(job => calculateJobProfit(job) >= filters.minProfit!);
    }
    if (filters.maxProfit !== undefined) {
      filteredJobs = filteredJobs.filter(job => calculateJobProfit(job) <= filters.maxProfit!);
    }
    
    return filteredJobs;
  }
  
  private filterByFiscalYear(jobs: Job[], fiscalYear: number): Job[] {
    const fyStart = new Date(`${fiscalYear}-11-01`);
    const fyEnd = new Date(`${fiscalYear + 1}-10-31`);
    
    return jobs.filter(job => {
      const jobStart = new Date(job.startDate);
      const jobEnd = new Date(job.endDate);
      // Check if job overlaps with fiscal year
      return jobStart <= fyEnd && jobEnd >= fyStart;
    });
  }
  
  private filterByDateRange(jobs: Job[], startDate: string, endDate: string): Job[] {
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);
    
    return jobs.filter(job => {
      const jobStart = new Date(job.startDate);
      const jobEnd = new Date(job.endDate);
      // Check if job overlaps with date range
      return jobStart <= rangeEnd && jobEnd >= rangeStart;
    });
  }
  
  // =====================================================
  // ANALYTICS & REPORTING
  // =====================================================
  
  getJobsByMarket(): Record<string, Job[]> {
    const result: Record<string, Job[]> = {};
    
    this.MARKETS.forEach(market => {
      result[market] = this.jobs.filter(job => job.market === market);
    });
    
    return result;
  }
  
  getJobsByType(): Record<string, Job[]> {
    return {
      Backlog: this.jobs.filter(job => job.type === 'Backlog'),
      SWAG: this.jobs.filter(job => job.type === 'SWAG')
    };
  }
  
  getJobsByFiscalYear(fiscalYear?: number): Job[] {
    const targetFY = fiscalYear || getFiscalYearInfo().current;
    return this.filterByFiscalYear(this.jobs, targetFY);
  }
  
  getKPIs(filters?: JobFilters) {
    const filteredJobs = filters ? this.filterJobs(filters) : this.jobs;
    return calculateKPIs(filteredJobs);
  }
  
  getMarketPerformance() {
    const marketJobs = this.getJobsByMarket();
    const result: Record<string, any> = {};
    
    Object.entries(marketJobs).forEach(([market, jobs]) => {
      const kpis = calculateKPIs(jobs);
      result[market] = {
        jobCount: jobs.length,
        totalRevenue: kpis.revenue.total,
        totalCost: kpis.cost.total,
        totalProfit: kpis.profit.total,
        avgJobValue: jobs.length > 0 ? kpis.revenue.total / jobs.length : 0,
        profitMargin: kpis.revenue.total > 0 ? (kpis.profit.total / kpis.revenue.total) * 100 : 0
      };
    });
    
    return result;
  }
  
  // =====================================================
  // VALIDATION & BUSINESS RULES
  // =====================================================
  
  validateJobData(jobData: Partial<Job>): DataValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Use the core validation function
    const coreValidation = validateJob(jobData);
    errors.push(...coreValidation.errors);
    
    // Additional business validations
    if (jobData.startDate) {
      const startValidation = isValidJobDate(jobData.startDate);
      if (!startValidation.isValid && startValidation.warning) {
        warnings.push(`Start date: ${startValidation.warning}`);
      }
    }
    
    if (jobData.endDate) {
      const endValidation = isValidJobDate(jobData.endDate);
      if (!endValidation.isValid && endValidation.warning) {
        warnings.push(`End date: ${endValidation.warning}`);
      }
    }
    
    // Check for duplicate job names in the same market
    if (jobData.jobName && jobData.market) {
      const duplicates = this.jobs.filter(job => 
        job.jobName.toLowerCase() === jobData.jobName!.toLowerCase() && 
        job.market === jobData.market
      );
      if (duplicates.length > 0) {
        warnings.push('A job with this name already exists in this market');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // =====================================================
  // ALLOCATION MANAGEMENT
  // =====================================================
  
  /**
   * Get job with allocations
   */
  getJobWithAllocations(id: number): JobWithAllocations | undefined {
    const baseJob = this.getJobById(id);
    if (!baseJob) return undefined;
    
    // Check if we have allocation data for this job
    const existingAllocations = this.jobsWithAllocations.get(id);
    if (existingAllocations) {
      return existingAllocations;
    }
    
    // Initialize new allocation data with fiscal year allocations by default
    const jobWithAllocations = allocationService.initializeJobAllocations(baseJob);
    const initializedJob = allocationService.initializeFiscalYearAllocations(jobWithAllocations);
    this.jobsWithAllocations.set(id, initializedJob);
    return initializedJob;
  }
  
  /**
   * Update job allocations
   */
  updateJobAllocations(jobWithAllocations: JobWithAllocations): { success: boolean; error?: string } {
    const baseJob = this.getJobById(jobWithAllocations.id);
    if (!baseJob) {
      return { success: false, error: 'Job not found' };
    }
    
    // Update allocation data
    this.jobsWithAllocations.set(jobWithAllocations.id, jobWithAllocations);
    
    return { success: true };
  }
  
  /**
   * Get all jobs with allocation status
   */
  getAllJobsWithAllocationStatus(): Array<Job & { allocationStatus: 'not_started' | 'partial' | 'complete'; allocationPercentage: number }> {
    return this.jobs.map(job => {
      const allocatedJob = this.jobsWithAllocations.get(job.id);
      if (allocatedJob) {
        return {
          ...job,
          allocationStatus: allocatedJob.allocationStatus,
          allocationPercentage: Math.max(
            allocatedJob.allocationSummary.allocationPercentageRevenue,
            allocatedJob.allocationSummary.allocationPercentageCost
          )
        };
      }
      
      return {
        ...job,
        allocationStatus: 'not_started' as const,
        allocationPercentage: 0
      };
    });
  }
  
  /**
   * Get monthly breakdown using allocated amounts where available
   */
  getMonthlyBreakdownWithAllocations(filters?: JobFilters) {
    const filteredJobs = filters ? this.filterJobs(filters) : this.jobs;
    
    // Convert to jobs with allocations for monthly calculations
    const jobsWithAllocations = filteredJobs.map(job => {
      const allocated = this.jobsWithAllocations.get(job.id);
      return allocated || allocationService.initializeJobAllocations(job);
    });
    
    // Calculate monthly breakdown using actual allocations
    return this.calculateMonthlyBreakdownFromAllocations(jobsWithAllocations);
  }
  
  private calculateMonthlyBreakdownFromAllocations(jobs: JobWithAllocations[]) {
    const monthlyData: Record<string, {
      month: string;
      monthLabel: string;
      revenue: number;
      cost: number;
      profit: number;
      actualRevenue: number;
      actualCost: number;
      projectedRevenue: number;
      projectedCost: number;
      jobCount: number;
    }> = {};
    
    jobs.forEach(job => {
      job.monthlyAllocations.forEach(allocation => {
        if (!monthlyData[allocation.month]) {
          monthlyData[allocation.month] = {
            month: allocation.month,
            monthLabel: allocation.monthLabel,
            revenue: 0,
            cost: 0,
            profit: 0,
            actualRevenue: 0,
            actualCost: 0,
            projectedRevenue: 0,
            projectedCost: 0,
            jobCount: 0
          };
        }
        
        const monthEntry = monthlyData[allocation.month];
        monthEntry.revenue += allocation.allocatedRevenue;
        monthEntry.cost += allocation.allocatedCost;
        monthEntry.profit += (allocation.allocatedRevenue - allocation.allocatedCost);
        
        if (allocation.allocationType === 'actual') {
          monthEntry.actualRevenue += allocation.allocatedRevenue;
          monthEntry.actualCost += allocation.allocatedCost;
        } else {
          monthEntry.projectedRevenue += allocation.allocatedRevenue;
          monthEntry.projectedCost += allocation.allocatedCost;
        }
        
        monthEntry.jobCount++;
      });
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  // =====================================================
  // CONFIGURATION
  // =====================================================
  
  getMarkets(): string[] {
    return [...this.MARKETS];
  }
  
  getJobTypes(): string[] {
    return [...this.JOB_TYPES];
  }
  
  getAvailableFiscalYears(): number[] {
    const fyInfo = getFiscalYearInfo();
    return [fyInfo.previous, fyInfo.current, fyInfo.next];
  }
  
  // =====================================================
  // BULK OPERATIONS
  // =====================================================
  
  bulkUpdateJobs(updates: Array<{ id: number; updates: Partial<Omit<Job, 'id'>> }>): {
    success: number;
    failed: Array<{ id: number; errors: string[] }>;
  } {
    let successCount = 0;
    const failures: Array<{ id: number; errors: string[] }> = [];
    
    updates.forEach(({ id, updates: jobUpdates }) => {
      const result = this.updateJob(id, jobUpdates);
      if (result.success) {
        successCount++;
      } else {
        failures.push({ id, errors: result.errors || ['Unknown error'] });
      }
    });
    
    return {
      success: successCount,
      failed: failures
    };
  }
  
  bulkDeleteJobs(ids: number[]): { success: number; failed: number[] } {
    let successCount = 0;
    const failures: number[] = [];
    
    ids.forEach(id => {
      const result = this.deleteJob(id);
      if (result.success) {
        successCount++;
      } else {
        failures.push(id);
      }
    });
    
    return {
      success: successCount,
      failed: failures
    };
  }
  
  // =====================================================
  // DATA EXPORT/IMPORT
  // =====================================================
  
  exportData(): {
    jobs: Job[];
    exportDate: string;
    version: string;
  } {
    return {
      jobs: this.getAllJobs(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }
  
  importData(data: { jobs: Job[] }): { success: boolean; imported: number; errors: string[] } {
    const errors: string[] = [];
    let importedCount = 0;
    
    // Clear existing data (in a real app, you'd want to be more careful about this)
    // this.jobs = [];
    // this.nextId = 1;
    
    data.jobs.forEach((jobData, index) => {
      const { id, ...jobWithoutId } = jobData;
      const result = this.addJob(jobWithoutId);
      
      if (result.success) {
        importedCount++;
      } else {
        errors.push(`Job ${index + 1}: ${result.errors?.join(', ')}`);
      }
    });
    
    return {
      success: errors.length === 0,
      imported: importedCount,
      errors
    };
  }
}

// Create and export a singleton instance
export const dataService = new DataService();

// Expose reset method globally for development/debugging
if (typeof window !== 'undefined') {
  (window as any).resetJobData = () => {
    dataService.resetData();
    console.log('Job data reset successfully! Refresh the page to see the updated data.');
  };
}

export default dataService;