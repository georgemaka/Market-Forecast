# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React + TypeScript)
```bash
cd frontend

# Development server (Vite)
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:ui
npm run test:coverage

# Code formatting
npm run format
```

### Backend (Node.js + Express)
```bash
cd backend

# Development server with auto-reload
npm run dev

# Production server
npm start

# Database operations
npm run db:migrate      # Run migrations
npm run db:reset        # Reset database
npm run db:seed         # Seed sample data
npm run db:studio       # Open Prisma Studio
npm run db:generate     # Generate Prisma client

# Testing and linting
npm run test
npm run test:watch
npm run lint
npm run lint:fix
```

## Architecture Overview

### Core Business Logic Flow

This is a **Market Forecasting Platform** for construction company job management with sophisticated monthly allocation tracking:

1. **Jobs Management** → **Monthly Allocation** → **Financial Dashboard** → **Executive Reporting**
2. **Fiscal Year Calculations** (Nov-Oct cycle) drive all financial breakdowns
3. **Probability-weighted calculations** for SWAG jobs vs 100% for Backlog jobs
4. **Real-time allocation tracking** with actuals vs projections

### Key Architectural Patterns

**Frontend Service Layer Architecture:**
- `dataService.ts` - Centralized data management with in-memory persistence
- `allocationService.ts` - Complex monthly allocation calculations and validation
- `monthlyCalculations.ts` - Fiscal year and job duration financial breakdowns
- `calculations.ts` - Core financial utilities and business rules

**Component Hierarchy:**
- **Jobs Page** (main entry) → **MonthlyView** (dashboard) → **JobAllocationInterface** (detailed allocations)
- **Modal-based workflows** for job details and timeline views
- **Hybrid approach** combining overview and drill-down capabilities

**State Management Strategy:**
- **Local state** for UI interactions and forms
- **Service layer** handles business logic and validation
- **No external API** - fully client-side with sample data

### Financial Calculation Engine

**Probability Weighting System:**
```typescript
// Backlog jobs: 100% probability (full amounts)
// SWAG jobs: Revenue/Cost × Probability percentage
const effectiveRevenue = job.type === 'Backlog' 
  ? job.totalRevenue 
  : job.totalRevenue * (job.probability / 100);
```

**Fiscal Year Logic:**
- Fiscal year runs November to October (e.g., FY 2025 = Nov 2024 - Oct 2025)
- All monthly breakdowns default to fiscal year view
- Jobs can span multiple fiscal years with proper allocation

**Monthly Allocation System:**
- Jobs distributed evenly across duration months by default
- Users can manually allocate monthly revenue/cost amounts
- Supports "actuals" vs "projections" distinction
- Real-time validation ensures totals match job values

### Critical Data Structures

**Job Interface:**
```typescript
interface Job {
  id: number;
  market: string; // 'Environmental' | 'Solar' | 'Residential' | 'Public Works'
  jobName: string;
  type: 'Backlog' | 'SWAG';
  probability: number; // 0-100, always 100 for Backlog
  startDate: string; // YYYY-MM-DD
  endDate: string;
  totalRevenue: number;
  totalCost: number;
}
```

**Monthly Allocation:**
```typescript
interface MonthlyAllocation {
  month: string; // YYYY-MM format
  monthLabel: string; // "Nov 2025"
  allocatedRevenue: number;
  allocatedCost: number;
  allocationType: 'projected' | 'actual';
  isLocked: boolean;
}
```

### Component Integration Patterns

**Modal Workflows:**
- `MonthlyView` → `selectedMonthJobs` modal → individual job timelines
- `JobAllocationInterface` → comprehensive allocation editing
- **Hybrid approach**: Contextual modals rather than separate pages

**Data Flow:**
1. `dataService` provides base job data and business logic
2. `monthlyCalculations` transforms jobs into monthly breakdowns
3. `allocationService` handles detailed monthly allocations
4. Components consume calculated data with minimal local state

## Key Business Rules

### Fiscal Year Calculations
- **Current fiscal year auto-detection** based on November cutoff
- **Job overlap logic** - jobs included if any part overlaps with fiscal year
- **Monthly distribution** defaults to even allocation across job duration

### Probability Weighting
- **Backlog jobs**: Always 100% probability, use full amounts
- **SWAG jobs**: Revenue/cost multiplied by probability percentage
- **KPI calculations**: Default to probability-weighted amounts for accurate forecasting

### Allocation Validation
- **Total consistency**: Monthly allocations must sum to job totals
- **Date validation**: Allocations only allowed within job duration
- **View switching**: Supports both fiscal year and full duration views

### Data Persistence
- **Client-side only**: No backend integration currently
- **Sample data**: Comprehensive test dataset with realistic financial figures
- **Reset capability**: `dataService.resetData()` for development

## File Structure Significance

### Frontend Core Services (`frontend/src/services/`)
- `dataService.ts` - **Central business logic hub**, job CRUD, filtering, KPI calculations
- `allocationService.ts` - **Complex allocation engine**, validation, fiscal year handling
- `api.ts` - API configuration (placeholder for future backend integration)

### Frontend Calculation Utilities (`frontend/src/utils/`)
- `calculations.ts` - **Core financial functions**, job profit, KPI aggregation, validation
- `monthlyCalculations.ts` - **Monthly breakdown engine**, fiscal year distributions
- `allocationTypes.ts` - **TypeScript interfaces** for allocation system
- `dateUtils.ts` - **Fiscal year logic**, date validation, business calendar

### Frontend Key Components (`frontend/src/components/` & `frontend/src/pages/`)
- `Projects/Projects.tsx` - **Main jobs management page**, filtering, table/monthly views
- `MonthlyView.tsx` - **Financial dashboard**, charts, quarterly analysis, job detail modals
- `JobAllocationInterface.tsx` - **Allocation editor**, monthly distribution, validation

### Backend Structure (`backend/src/`)
- `server.js` - **Express application entry point**
- `controllers/` - **Route handlers** for auth, forecasts, projects, reports, users
- `services/` - **Business logic layer** (placeholder for future development)
- `middleware/` - **Auth and error handling middleware**
- `routes/` - **API route definitions**
- `prisma/schema.prisma` - **Database schema** (currently unused by frontend)

### Important Implementation Details

**Number Formatting:**
- All financial displays use comma separators (`formatCurrency`)
- Input fields accept both formatted and raw numbers
- Auto-formatting on blur for better UX

**Error Handling:**
- Comprehensive validation in `allocationService`
- User-friendly error messages for business rule violations
- Real-time validation feedback in forms

**Performance Considerations:**
- **Memoization** for expensive calculations (global scaling, trends)
- **Efficient filtering** in dataService with multiple criteria support
- **Optimized re-renders** using proper React patterns

## Development Patterns

### Adding New Features
1. **Business logic** goes in appropriate service (`dataService` or `allocationService`)
2. **Calculations** in `utils/calculations.ts` or `utils/monthlyCalculations.ts`
3. **UI components** consume service data with minimal transformation
4. **TypeScript interfaces** defined in relevant files (`types/`, `allocationTypes.ts`)

### Testing Approach
- **Sample data** provides comprehensive test scenarios
- **Validation functions** have built-in business rule testing
- **Component testing** focuses on user interactions and data display

### State Management
- **Service layer** handles complex state (jobs, allocations)
- **Components** manage UI state (modals, form inputs, view toggles)
- **No global state library** needed due to service-based architecture

### Current Development Status
- **Frontend**: Fully functional with sophisticated job management and allocation system
- **Backend**: Basic Express setup with Prisma schema, but not integrated with frontend
- **Data Flow**: Currently client-side only with sample data in `dataService`
- **Future Integration**: Backend ready for connection when needed

This architecture prioritizes **business logic separation**, **type safety**, and **user experience** while maintaining **flexibility** for future backend integration.