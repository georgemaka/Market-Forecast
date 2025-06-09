/**
 * Type definitions for monthly allocation system
 * Handles actuals vs projections and monthly distribution
 */

export type AllocationType = 'actual' | 'projection';

export interface MonthlyAllocation {
  month: string; // Format: "YYYY-MM"
  monthLabel: string; // Format: "Nov 2024"
  allocatedRevenue: number;
  allocatedCost: number;
  allocationType: AllocationType;
  isLocked: boolean; // Actuals are locked, projections are editable
  lastUpdated: string; // ISO date string
  updatedBy?: string; // User who made the allocation
  notes?: string;
}

export interface AllocationSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  allocatedRevenue: number;
  allocatedCost: number;
  remainingRevenue: number;
  remainingCost: number;
  allocationPercentageRevenue: number; // 0-100
  allocationPercentageCost: number; // 0-100
  actualsRevenue: number;
  actualsCost: number;
  projectionsRevenue: number;
  projectionsCost: number;
}

export interface JobWithAllocations {
  // Base job properties
  id: number;
  market: string;
  jobName: string;
  type: 'Backlog' | 'SWAG';
  probability: number;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalCost: number;
  
  // Allocation properties
  monthlyAllocations: MonthlyAllocation[];
  allocationStatus: 'not_started' | 'partial' | 'complete';
  allocationSummary: AllocationSummary;
  
  // Metadata
  lastAllocationUpdate: string;
  allocationNotes?: string;
}

export interface AllocationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canSave: boolean;
}

export interface AllocationUpdate {
  month: string;
  revenue?: number;
  cost?: number;
  allocationType: AllocationType;
  notes?: string;
}

export interface BulkAllocationOperation {
  type: 'straightline' | 'clear' | 'distribute_remaining' | 'copy_pattern';
  targetMonths?: string[]; // If not provided, applies to all job months
  sourceJobId?: number; // For copy_pattern operation
  excludeActuals?: boolean; // Don't overwrite actual values
}

// Predefined allocation patterns
export interface AllocationPattern {
  id: string;
  name: string;
  description: string;
  pattern: Array<{
    monthOffset: number; // 0 = first month, 1 = second month, etc.
    revenuePercentage: number; // 0-100
    costPercentage: number; // 0-100
  }>;
}

export const DEFAULT_ALLOCATION_PATTERNS: AllocationPattern[] = [
  {
    id: 'straightline',
    name: 'Straight Line',
    description: 'Equal distribution across all months',
    pattern: [] // Will be calculated dynamically
  },
  {
    id: 'front_loaded',
    name: 'Front Loaded',
    description: 'Higher amounts in early months',
    pattern: [
      { monthOffset: 0, revenuePercentage: 40, costPercentage: 30 },
      { monthOffset: 1, revenuePercentage: 30, costPercentage: 25 },
      { monthOffset: 2, revenuePercentage: 20, costPercentage: 25 },
      { monthOffset: 3, revenuePercentage: 10, costPercentage: 20 }
    ]
  },
  {
    id: 'back_loaded',
    name: 'Back Loaded',
    description: 'Higher amounts in later months',
    pattern: [
      { monthOffset: 0, revenuePercentage: 10, costPercentage: 30 },
      { monthOffset: 1, revenuePercentage: 20, costPercentage: 25 },
      { monthOffset: 2, revenuePercentage: 30, costPercentage: 25 },
      { monthOffset: 3, revenuePercentage: 40, costPercentage: 20 }
    ]
  },
  {
    id: 'milestone_based',
    name: 'Milestone Based',
    description: 'Revenue at milestones, costs distributed',
    pattern: [
      { monthOffset: 0, revenuePercentage: 25, costPercentage: 30 },
      { monthOffset: 1, revenuePercentage: 0, costPercentage: 30 },
      { monthOffset: 2, revenuePercentage: 50, costPercentage: 25 },
      { monthOffset: 3, revenuePercentage: 25, costPercentage: 15 }
    ]
  }
];

// Validation constraints
export const ALLOCATION_CONSTRAINTS = {
  MAX_ALLOCATION_VARIANCE: 0.01, // Allow 1% variance for rounding
  MIN_MONTHLY_AMOUNT: 0,
  MAX_MONTHS_FUTURE: 60, // Don't allow allocations more than 5 years out
  REQUIRE_FULL_ALLOCATION: true, // Must allocate 100% before marking complete
  ALLOW_ACTUALS_OVERRIDE: false, // Actuals cannot be modified once set
  AUTO_SAVE_DELAY: 2000 // Auto-save after 2 seconds of inactivity
};

// Helper types for UI state
export interface AllocationUIState {
  selectedJob: JobWithAllocations | null;
  currentView: 'fiscal_year' | 'job_duration' | 'custom_range';
  viewStartDate: string;
  viewEndDate: string;
  editingMonth: string | null;
  showActualsOnly: boolean;
  showProjectionsOnly: boolean;
  unsavedChanges: boolean;
  selectedPattern: string | null;
}

export interface AllocationFormData {
  month: string;
  revenue: string; // String for form input
  cost: string; // String for form input
  allocationType: AllocationType;
  notes: string;
}

export default {
  DEFAULT_ALLOCATION_PATTERNS,
  ALLOCATION_CONSTRAINTS
};