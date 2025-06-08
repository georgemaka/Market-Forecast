// Enums matching backend schema
export enum Role {
  ADMIN = 'ADMIN',
  EXECUTIVE = 'EXECUTIVE',
  VP_DIRECTOR = 'VP_DIRECTOR',
  CONTRIBUTOR = 'CONTRIBUTOR',
}

export enum MarketSegment {
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  ENERGY = 'ENERGY',
  PUBLIC_WORKS = 'PUBLIC_WORKS',
  RESIDENTIAL = 'RESIDENTIAL',
}

export enum ProjectType {
  BACKLOG = 'BACKLOG',
  SWAG = 'SWAG',
}

export enum ForecastStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PeriodStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

// Core data types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  marketSegments: MarketSegment[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForecastPeriod {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  status: PeriodStatus;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  forecastId: string;
  name: string;
  type: ProjectType;
  estimatedValue: number;
  probability: number; // 0-100
  expectedCloseDate: string;
  clientName?: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Forecast {
  id: string;
  userId: string;
  periodId: string;
  marketSegment: MarketSegment;
  status: ForecastStatus;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  period?: ForecastPeriod;
  projects: Project[];
}

export interface Report {
  id: string;
  periodId: string;
  name: string;
  type: string;
  data: any; // JSON data
  generatedAt: string;
  createdBy?: string;
  period?: ForecastPeriod;
}

// API Response types
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  message?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
  marketSegments?: MarketSegment[];
}

export interface ProjectForm {
  name: string;
  type: ProjectType;
  estimatedValue: number;
  probability: number;
  expectedCloseDate: string;
  clientName?: string;
  description?: string;
  notes?: string;
}

export interface ForecastForm {
  marketSegment: MarketSegment;
  projects: ProjectForm[];
  notes?: string;
}

// Chart and Dashboard types
export interface ChartData {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface SegmentSummary {
  segment: MarketSegment;
  backlog: number;
  swag: number;
  weighted: number;
  projectCount: number;
  submissionRate: number;
}

export interface ExecutiveSummary {
  totalBacklog: number;
  totalSwag: number;
  weightedTotal: number;
  submissionRate: number;
  bySegment: Record<MarketSegment, SegmentSummary>;
  trends: TrendData[];
  topProjects: Project[];
}

export interface TrendData {
  period: string;
  actualRevenue: number;
  forecastAccuracy: number;
  date: string;
}

// UI Component types
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  content: React.ReactNode;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
  badge?: string | number;
  roles?: Role[];
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Filter and Search types
export interface FilterOptions {
  segments?: MarketSegment[];
  status?: ForecastStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Constants
export const MARKET_SEGMENT_LABELS: Record<MarketSegment, string> = {
  [MarketSegment.ENVIRONMENTAL]: 'Environmental',
  [MarketSegment.ENERGY]: 'Energy',
  [MarketSegment.PUBLIC_WORKS]: 'Public Works',
  [MarketSegment.RESIDENTIAL]: 'Residential',
};

export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'Administrator',
  [Role.EXECUTIVE]: 'Executive',
  [Role.VP_DIRECTOR]: 'VP/Director',
  [Role.CONTRIBUTOR]: 'Contributor',
};

export const FORECAST_STATUS_LABELS: Record<ForecastStatus, string> = {
  [ForecastStatus.DRAFT]: 'Draft',
  [ForecastStatus.SUBMITTED]: 'Submitted',
  [ForecastStatus.APPROVED]: 'Approved',
  [ForecastStatus.REJECTED]: 'Rejected',
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  [ProjectType.BACKLOG]: 'Backlog',
  [ProjectType.SWAG]: 'SWAG',
};