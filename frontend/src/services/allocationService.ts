/**
 * Allocation Service for Monthly Revenue/Cost Distribution
 * Handles actuals vs projections, validation, and business logic
 */

import { 
  JobWithAllocations, 
  MonthlyAllocation, 
  AllocationSummary, 
  AllocationValidationResult,
  AllocationUpdate,
  ALLOCATION_CONSTRAINTS,
  AllocationType
} from '../utils/allocationTypes';
import { Job, getEffectiveRevenue, getEffectiveCost } from '../utils/calculations';
import { getMonthsBetween, formatMonthLabel, getFiscalYearInfo } from '../utils/dateUtils';

class AllocationService {
  
  // =====================================================
  // INITIALIZATION & CONVERSION
  // =====================================================
  
  /**
   * Convert a regular Job to JobWithAllocations
   */
  initializeJobAllocations(job: Job): JobWithAllocations {
    const jobWithAllocations: JobWithAllocations = {
      ...job,
      monthlyAllocations: [],
      allocationStatus: 'not_started',
      allocationSummary: this.calculateAllocationSummary(job, []),
      lastAllocationUpdate: new Date().toISOString(),
      allocationNotes: ''
    };
    
    return jobWithAllocations;
  }
  
  /**
   * Initialize allocations for fiscal year view (default)
   */
  initializeFiscalYearAllocations(job: JobWithAllocations, fiscalYear?: number): JobWithAllocations {
    const fyInfo = getFiscalYearInfo();
    const targetFY = fiscalYear || fyInfo.current;
    
    // Get fiscal year months
    const fyStartDate = `${targetFY}-11-01`;
    const fyEndDate = `${targetFY + 1}-10-31`;
    
    // Find overlap between job duration and fiscal year
    const jobStart = new Date(job.startDate);
    const jobEnd = new Date(job.endDate);
    const fyStart = new Date(fyStartDate);
    const fyEnd = new Date(fyEndDate);
    
    // Calculate actual overlap period
    const overlapStart = new Date(Math.max(jobStart.getTime(), fyStart.getTime()));
    const overlapEnd = new Date(Math.min(jobEnd.getTime(), fyEnd.getTime()));
    
    if (overlapStart > overlapEnd) {
      // No overlap with fiscal year
      return job;
    }
    
    // Generate months for the overlap period
    const overlapMonths = getMonthsBetween(
      overlapStart.toISOString().split('T')[0],
      overlapEnd.toISOString().split('T')[0]
    );
    
    // Create empty allocations for fiscal year months
    const fiscalYearAllocations: MonthlyAllocation[] = overlapMonths.map(month => ({
      month,
      monthLabel: formatMonthLabel(month),
      allocatedRevenue: 0,
      allocatedCost: 0,
      allocationType: 'projection' as AllocationType,
      isLocked: false,
      lastUpdated: new Date().toISOString(),
      notes: ''
    }));
    
    // Merge with existing allocations (preserve actuals)
    const mergedAllocations = this.mergeAllocations(job.monthlyAllocations, fiscalYearAllocations);
    
    const updatedJob = {
      ...job,
      monthlyAllocations: mergedAllocations,
      allocationSummary: this.calculateAllocationSummary(job, mergedAllocations),
      lastAllocationUpdate: new Date().toISOString()
    };
    
    updatedJob.allocationStatus = this.determineAllocationStatus(updatedJob);
    
    return updatedJob;
  }
  
  /**
   * Initialize allocations for full job duration
   */
  initializeJobDurationAllocations(job: JobWithAllocations): JobWithAllocations {
    const jobMonths = getMonthsBetween(job.startDate, job.endDate);
    
    const jobDurationAllocations: MonthlyAllocation[] = jobMonths.map(month => ({
      month,
      monthLabel: formatMonthLabel(month),
      allocatedRevenue: 0,
      allocatedCost: 0,
      allocationType: 'projection' as AllocationType,
      isLocked: false,
      lastUpdated: new Date().toISOString(),
      notes: ''
    }));
    
    const mergedAllocations = this.mergeAllocations(job.monthlyAllocations, jobDurationAllocations);
    
    const updatedJob = {
      ...job,
      monthlyAllocations: mergedAllocations,
      allocationSummary: this.calculateAllocationSummary(job, mergedAllocations),
      lastAllocationUpdate: new Date().toISOString()
    };
    
    updatedJob.allocationStatus = this.determineAllocationStatus(updatedJob);
    
    return updatedJob;
  }
  
  // =====================================================
  // ALLOCATION OPERATIONS
  // =====================================================
  
  /**
   * Update a single month's allocation
   */
  updateMonthlyAllocation(
    job: JobWithAllocations, 
    update: AllocationUpdate
  ): { success: boolean; job?: JobWithAllocations; errors?: string[] } {
    
    // Validate the update
    const validation = this.validateAllocationUpdate(job, update);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    
    // Find existing allocation for this month
    const existingIndex = job.monthlyAllocations.findIndex(a => a.month === update.month);
    
    if (existingIndex >= 0) {
      // Update existing allocation
      const existing = job.monthlyAllocations[existingIndex];
      
      // Don't allow editing locked actuals
      if (existing.isLocked && existing.allocationType === 'actual') {
        return { success: false, errors: ['Cannot modify actual values'] };
      }
      
      const updated = {
        ...existing,
        allocatedRevenue: update.revenue !== undefined ? update.revenue : existing.allocatedRevenue,
        allocatedCost: update.cost !== undefined ? update.cost : existing.allocatedCost,
        allocationType: update.allocationType,
        isLocked: update.allocationType === 'actual',
        lastUpdated: new Date().toISOString(),
        notes: update.notes || existing.notes
      };
      
      job.monthlyAllocations[existingIndex] = updated;
    } else {
      // Create new allocation
      const newAllocation: MonthlyAllocation = {
        month: update.month,
        monthLabel: formatMonthLabel(update.month),
        allocatedRevenue: update.revenue || 0,
        allocatedCost: update.cost || 0,
        allocationType: update.allocationType,
        isLocked: update.allocationType === 'actual',
        lastUpdated: new Date().toISOString(),
        notes: update.notes || ''
      };
      
      job.monthlyAllocations.push(newAllocation);
      job.monthlyAllocations.sort((a, b) => a.month.localeCompare(b.month));
    }
    
    // Recalculate summary and status
    const updatedJob = {
      ...job,
      allocationSummary: this.calculateAllocationSummary(job, job.monthlyAllocations),
      lastAllocationUpdate: new Date().toISOString()
    };
    
    updatedJob.allocationStatus = this.determineAllocationStatus(updatedJob);
    
    return { success: true, job: updatedJob };
  }
  
  /**
   * Apply straight-line allocation to projections only
   */
  applyStraightLineAllocation(job: JobWithAllocations, excludeActuals: boolean = true): JobWithAllocations {
    const editableAllocations = excludeActuals 
      ? job.monthlyAllocations.filter(a => a.allocationType !== 'actual')
      : job.monthlyAllocations;
    
    if (editableAllocations.length === 0) {
      return job;
    }
    
    // Calculate how much is already allocated to actuals
    const actualsTotal = job.monthlyAllocations
      .filter(a => a.allocationType === 'actual')
      .reduce((sum, a) => ({ 
        revenue: sum.revenue + a.allocatedRevenue,
        cost: sum.cost + a.allocatedCost 
      }), { revenue: 0, cost: 0 });
    
    // Calculate remaining amounts to distribute (use effective values for SWAG)
    const effectiveRevenue = getEffectiveRevenue(job);
    const effectiveCost = getEffectiveCost(job);
    const remainingRevenue = effectiveRevenue - actualsTotal.revenue;
    const remainingCost = effectiveCost - actualsTotal.cost;
    
    // Distribute remaining amounts equally across editable months
    const monthlyRevenue = remainingRevenue / editableAllocations.length;
    const monthlyCost = remainingCost / editableAllocations.length;
    
    // Apply straight-line to editable allocations
    const updatedAllocations = job.monthlyAllocations.map(allocation => {
      if (excludeActuals && allocation.allocationType === 'actual') {
        return allocation; // Don't modify actuals
      }
      
      return {
        ...allocation,
        allocatedRevenue: monthlyRevenue,
        allocatedCost: monthlyCost,
        lastUpdated: new Date().toISOString()
      };
    });
    
    const updatedJob = {
      ...job,
      monthlyAllocations: updatedAllocations,
      allocationSummary: this.calculateAllocationSummary(job, updatedAllocations),
      lastAllocationUpdate: new Date().toISOString()
    };
    
    updatedJob.allocationStatus = this.determineAllocationStatus(updatedJob);
    
    return updatedJob;
  }
  
  /**
   * Clear all projection allocations (keep actuals)
   */
  clearProjectionAllocations(job: JobWithAllocations): JobWithAllocations {
    const clearedAllocations = job.monthlyAllocations.map(allocation => {
      if (allocation.allocationType === 'actual') {
        return allocation; // Keep actuals unchanged
      }
      
      return {
        ...allocation,
        allocatedRevenue: 0,
        allocatedCost: 0,
        lastUpdated: new Date().toISOString()
      };
    });
    
    const updatedJob = {
      ...job,
      monthlyAllocations: clearedAllocations,
      allocationSummary: this.calculateAllocationSummary(job, clearedAllocations),
      lastAllocationUpdate: new Date().toISOString()
    };
    
    updatedJob.allocationStatus = this.determineAllocationStatus(updatedJob);
    
    return updatedJob;
  }
  
  /**
   * Distribute remaining unallocated amounts
   */
  distributeRemainingAmounts(job: JobWithAllocations): JobWithAllocations {
    // Get editable allocations (not actuals)
    const editableAllocations = job.monthlyAllocations.filter(a => a.allocationType !== 'actual');
    
    if (editableAllocations.length === 0) {
      return job;
    }
    
    // Find allocations with empty revenue and empty cost separately
    const emptyRevenueAllocations = editableAllocations.filter(a => a.allocatedRevenue === 0);
    const emptyCostAllocations = editableAllocations.filter(a => a.allocatedCost === 0);
    
    // Calculate remaining amounts using effective values
    const effectiveRevenue = getEffectiveRevenue(job);
    const effectiveCost = getEffectiveCost(job);
    
    const allocatedRevenue = job.monthlyAllocations.reduce((sum, a) => sum + a.allocatedRevenue, 0);
    const allocatedCost = job.monthlyAllocations.reduce((sum, a) => sum + a.allocatedCost, 0);
    
    const remainingRevenue = effectiveRevenue - allocatedRevenue;
    const remainingCost = effectiveCost - allocatedCost;
    
    // Calculate per-month amounts for revenue and cost separately
    // Only distribute positive remaining amounts
    const remainingRevenuePerMonth = emptyRevenueAllocations.length > 0 && remainingRevenue > 0
      ? remainingRevenue / emptyRevenueAllocations.length 
      : 0;
    const remainingCostPerMonth = emptyCostAllocations.length > 0 && remainingCost > 0
      ? remainingCost / emptyCostAllocations.length 
      : 0;
    
    const distributedAllocations = job.monthlyAllocations.map(allocation => {
      // Skip actuals
      if (allocation.allocationType === 'actual') {
        return allocation;
      }
      
      // Distribute revenue and cost independently
      // Only update if the field is currently zero
      const newRevenue = allocation.allocatedRevenue === 0
        ? remainingRevenuePerMonth
        : allocation.allocatedRevenue;
        
      const newCost = allocation.allocatedCost === 0
        ? remainingCostPerMonth
        : allocation.allocatedCost;
      
      return {
        ...allocation,
        allocatedRevenue: newRevenue,
        allocatedCost: newCost,
        lastUpdated: new Date().toISOString()
      };
    });
    
    const updatedJob = {
      ...job,
      monthlyAllocations: distributedAllocations,
      allocationSummary: this.calculateAllocationSummary(job, distributedAllocations),
      lastAllocationUpdate: new Date().toISOString()
    };
    
    updatedJob.allocationStatus = this.determineAllocationStatus(updatedJob);
    
    return updatedJob;
  }
  
  // =====================================================
  // CALCULATION & VALIDATION
  // =====================================================
  
  /**
   * Calculate allocation summary
   */
  calculateAllocationSummary(job: Job, allocations: MonthlyAllocation[]): AllocationSummary {
    const totals = allocations.reduce((sum, allocation) => ({
      allocatedRevenue: sum.allocatedRevenue + allocation.allocatedRevenue,
      allocatedCost: sum.allocatedCost + allocation.allocatedCost,
      actualsRevenue: sum.actualsRevenue + (allocation.allocationType === 'actual' ? allocation.allocatedRevenue : 0),
      actualsCost: sum.actualsCost + (allocation.allocationType === 'actual' ? allocation.allocatedCost : 0),
      projectionsRevenue: sum.projectionsRevenue + (allocation.allocationType === 'projection' ? allocation.allocatedRevenue : 0),
      projectionsCost: sum.projectionsCost + (allocation.allocationType === 'projection' ? allocation.allocatedCost : 0)
    }), {
      allocatedRevenue: 0,
      allocatedCost: 0,
      actualsRevenue: 0,
      actualsCost: 0,
      projectionsRevenue: 0,
      projectionsCost: 0
    });
    
    // Use effective values for SWAG jobs (probability-weighted)
    const effectiveRevenue = getEffectiveRevenue(job);
    const effectiveCost = getEffectiveCost(job);
    const effectiveProfit = effectiveRevenue - effectiveCost;
    
    const remainingRevenue = effectiveRevenue - totals.allocatedRevenue;
    const remainingCost = effectiveCost - totals.allocatedCost;
    
    return {
      totalRevenue: effectiveRevenue, // Show effective values in summary
      totalCost: effectiveCost,
      totalProfit: effectiveProfit,
      allocatedRevenue: totals.allocatedRevenue,
      allocatedCost: totals.allocatedCost,
      remainingRevenue,
      remainingCost,
      allocationPercentageRevenue: effectiveRevenue > 0 ? (totals.allocatedRevenue / effectiveRevenue) * 100 : 0,
      allocationPercentageCost: effectiveCost > 0 ? (totals.allocatedCost / effectiveCost) * 100 : 0,
      actualsRevenue: totals.actualsRevenue,
      actualsCost: totals.actualsCost,
      projectionsRevenue: totals.projectionsRevenue,
      projectionsCost: totals.projectionsCost
    };
  }
  
  /**
   * Determine allocation status
   */
  determineAllocationStatus(job: JobWithAllocations): 'not_started' | 'partial' | 'complete' {
    const summary = job.allocationSummary;
    
    if (summary.allocatedRevenue === 0 && summary.allocatedCost === 0) {
      return 'not_started';
    }
    
    const revenueComplete = Math.abs(summary.remainingRevenue) <= ALLOCATION_CONSTRAINTS.MAX_ALLOCATION_VARIANCE;
    const costComplete = Math.abs(summary.remainingCost) <= ALLOCATION_CONSTRAINTS.MAX_ALLOCATION_VARIANCE;
    
    if (revenueComplete && costComplete) {
      return 'complete';
    }
    
    return 'partial';
  }
  
  /**
   * Validate allocation update
   */
  validateAllocationUpdate(job: JobWithAllocations, update: AllocationUpdate): AllocationValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if month is within the currently available allocation months
    const availableMonths = job.monthlyAllocations.map(a => a.month);
    if (!availableMonths.includes(update.month)) {
      errors.push('Month is not available for allocation in current view');
    }
    
    // Validate amounts
    if (update.revenue !== undefined && update.revenue < 0) {
      errors.push('Revenue cannot be negative');
    }
    
    if (update.cost !== undefined && update.cost < 0) {
      errors.push('Cost cannot be negative');
    }
    
    // Check for over-allocation
    if (update.revenue !== undefined || update.cost !== undefined) {
      const tempAllocations = [...job.monthlyAllocations];
      const existingIndex = tempAllocations.findIndex(a => a.month === update.month);
      
      if (existingIndex >= 0) {
        tempAllocations[existingIndex] = {
          ...tempAllocations[existingIndex],
          allocatedRevenue: update.revenue !== undefined ? update.revenue : tempAllocations[existingIndex].allocatedRevenue,
          allocatedCost: update.cost !== undefined ? update.cost : tempAllocations[existingIndex].allocatedCost
        };
      } else {
        tempAllocations.push({
          month: update.month,
          monthLabel: formatMonthLabel(update.month),
          allocatedRevenue: update.revenue || 0,
          allocatedCost: update.cost || 0,
          allocationType: update.allocationType,
          isLocked: false,
          lastUpdated: new Date().toISOString(),
          notes: update.notes || ''
        });
      }
      
      const tempSummary = this.calculateAllocationSummary(job, tempAllocations);
      
      if (tempSummary.remainingRevenue < -ALLOCATION_CONSTRAINTS.MAX_ALLOCATION_VARIANCE) {
        errors.push('Total allocated revenue exceeds job total');
      }
      
      if (tempSummary.remainingCost < -ALLOCATION_CONSTRAINTS.MAX_ALLOCATION_VARIANCE) {
        errors.push('Total allocated cost exceeds job total');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canSave: errors.length === 0
    };
  }
  
  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================
  
  /**
   * Merge existing allocations with new template allocations
   */
  private mergeAllocations(existing: MonthlyAllocation[], template: MonthlyAllocation[]): MonthlyAllocation[] {
    const merged: MonthlyAllocation[] = [];
    const existingMap = new Map(existing.map(a => [a.month, a]));
    
    // Add template months, preserving existing data where available
    template.forEach(templateAllocation => {
      const existingAllocation = existingMap.get(templateAllocation.month);
      if (existingAllocation) {
        merged.push(existingAllocation);
      } else {
        merged.push(templateAllocation);
      }
    });
    
    // Add any existing allocations not in template (for months outside current view)
    existing.forEach(existingAllocation => {
      if (!template.find(t => t.month === existingAllocation.month)) {
        merged.push(existingAllocation);
      }
    });
    
    return merged.sort((a, b) => a.month.localeCompare(b.month));
  }
  
  /**
   * Get available months for allocation (within job duration)
   */
  getAvailableMonths(job: JobWithAllocations): string[] {
    return getMonthsBetween(job.startDate, job.endDate);
  }
  
  /**
   * Get fiscal year months that overlap with job
   */
  getFiscalYearOverlapMonths(job: JobWithAllocations, fiscalYear: number): string[] {
    const fyStartDate = `${fiscalYear}-11-01`;
    const fyEndDate = `${fiscalYear + 1}-10-31`;
    
    const jobStart = new Date(job.startDate);
    const jobEnd = new Date(job.endDate);
    const fyStart = new Date(fyStartDate);
    const fyEnd = new Date(fyEndDate);
    
    const overlapStart = new Date(Math.max(jobStart.getTime(), fyStart.getTime()));
    const overlapEnd = new Date(Math.min(jobEnd.getTime(), fyEnd.getTime()));
    
    if (overlapStart > overlapEnd) {
      return [];
    }
    
    return getMonthsBetween(
      overlapStart.toISOString().split('T')[0],
      overlapEnd.toISOString().split('T')[0]
    );
  }
}

// Export singleton instance
export const allocationService = new AllocationService();
export default allocationService;