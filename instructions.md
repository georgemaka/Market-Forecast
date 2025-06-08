# Sukut Construction Market Forecasting Platform

## Overview

The Sukut Construction Market Forecasting Platform is a modern web application designed to replace Excel-based workflows for forecasting and tracking market trends across four key business segments: Environmental, Energy, Public Works, and Residential. 

The platform automates the entire forecasting cycle from data collection to executive reporting, eliminating manual coordination bottlenecks while maintaining data quality and providing strategic oversight capabilities.

### Key Problems Solved
- **Eliminates manual coordination** of Excel files across multiple contributors
- **Automates compilation and validation** of forecast data
- **Provides real-time collaboration** with conflict resolution
- **Delivers executive-ready reports** without manual intervention
- **Tracks forecast accuracy** and trends over time
- **Enables probability-weighted pipeline calculations** for better business planning

## Technologies Used

### Backend
- **Node.js** (v18.17.0+) - Runtime environment
- **Express.js** (v4.18.0+) - Web framework
- **PostgreSQL** (v15.0+) - Primary database
- **Prisma** (v5.0.0+) - Database ORM and migrations
- **Redis** (v7.0+) - Caching and session storage
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **joi** - Request validation
- **node-cron** - Scheduled tasks for automated forecasting cycles

### Frontend
- **React** (v18.2.0+) - UI framework
- **TypeScript** (v5.0.0+) - Type safety
- **Vite** (v4.4.0+) - Build tool and dev server
- **React Router** (v6.14.0+) - Client-side routing
- **React Query** (v4.29.0+) - Server state management
- **Zustand** (v4.4.0+) - Client state management
- **Recharts** (v2.7.0+) - Data visualization
- **Tailwind CSS** (v3.3.0+) - Styling framework
- **Headless UI** (v1.7.0+) - Accessible UI components
- **React Hook Form** (v7.45.0+) - Form handling
- **date-fns** (v2.30.0+) - Date manipulation

### DevOps & Tools
- **Docker** (v24.0+) - Containerization
- **Docker Compose** - Multi-container orchestration
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Unit testing
- **Cypress** - E2E testing
- **Winston** - Logging
- **PM2** - Process management (production)

## Setup & Installation

### Prerequisites
- Node.js v18.17.0 or higher
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/sukut-construction/market-forecasting-platform.git
cd market-forecasting-platform
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Install dependencies for both frontend and backend
npm run install:all
```

### 3. Database Setup
```bash
# Start PostgreSQL and Redis using Docker
docker-compose up -d db redis

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 4. Development Server
```bash
# Start both frontend and backend in development mode
npm run dev

# Or start them separately:
npm run dev:backend  # Backend on port 3001
npm run dev:frontend # Frontend on port 3000
```

### 5. Verify Installation
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/health
- API Documentation: http://localhost:3001/api-docs

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://sukut_user:sukut_password@localhost:5432/sukut_forecasting"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
BCRYPT_ROUNDS=12

# Application Settings
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@sukut.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@sukut.com"

# Logging
LOG_LEVEL="debug"

# Feature Flags
ENABLE_AUDIT_LOGGING=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_FORECAST_AUTOMATION=true

# File Upload
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES="xlsx,csv"
```

### Optional Environment Variables
```env
# Monitoring (if using external services)
SENTRY_DSN="https://your-sentry-dsn"
NEW_RELIC_LICENSE_KEY="your-new-relic-key"

# External Integrations (future use)
CRM_API_URL=""
CRM_API_KEY=""
```

## Usage Instructions

### Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```
   Access the application at http://localhost:3000

2. **Production Mode**
   ```bash
   npm run build
   npm start
   ```

3. **Docker Deployment**
   ```bash
   docker-compose up -d
   ```

### User Roles and Access

1. **System Administrator**
   - Full system access
   - User management
   - System configuration
   - Audit trail access

2. **Executive**
   - View all forecast reports
   - Access executive dashboards
   - Export capabilities
   - Trend analysis

3. **VP/Director**
   - Manage forecasts for assigned segments
   - Review and approve submissions
   - Access segment-specific analytics

4. **Contributor**
   - Input forecast data for assigned projects
   - Update project probabilities
   - View own submissions and history

### Key Workflows

1. **Forecast Submission**
   - Navigate to "My Forecasts"
   - Select active forecast period
   - Add/edit Backlog and SWAG projects
   - Set probabilities and financial projections
   - Submit for review

2. **Executive Reporting**
   - Automated generation on submission deadlines
   - Real-time dashboard updates
   - Email notifications to stakeholders
   - Export to Excel/PDF formats

3. **Trend Analysis**
   - Historical forecast accuracy tracking
   - Market segment performance comparison
   - Probability distribution analysis
   - Revenue pipeline visualization

## Code Structure & Logic Flow

```
sukut-forecasting-platform/
├── backend/                          # Express.js API server
│   ├── src/
│   │   ├── controllers/             # Route handlers
│   │   │   ├── auth.controller.js   # Authentication endpoints
│   │   │   ├── forecast.controller.js # Forecast CRUD operations
│   │   │   ├── project.controller.js  # Project management
│   │   │   ├── user.controller.js     # User management
│   │   │   └── report.controller.js   # Report generation
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── validation.middleware.js # Request validation
│   │   │   ├── rbac.middleware.js   # Role-based access control
│   │   │   └── audit.middleware.js  # Audit logging
│   │   ├── models/                  # Prisma schema and models
│   │   │   └── schema.prisma        # Database schema definition
│   │   ├── services/                # Business logic layer
│   │   │   ├── forecast.service.js  # Forecast calculations
│   │   │   ├── notification.service.js # Email notifications
│   │   │   ├── report.service.js    # Report generation logic
│   │   │   └── automation.service.js # Scheduled tasks
│   │   ├── utils/                   # Utility functions
│   │   │   ├── validation.js        # Input validation schemas
│   │   │   ├── calculations.js      # Financial calculations
│   │   │   ├── email.js            # Email utilities
│   │   │   └── logger.js           # Winston logger setup
│   │   ├── routes/                  # API route definitions
│   │   │   ├── auth.routes.js       # Authentication routes
│   │   │   ├── forecast.routes.js   # Forecast endpoints
│   │   │   ├── project.routes.js    # Project endpoints
│   │   │   ├── user.routes.js       # User management endpoints
│   │   │   └── report.routes.js     # Reporting endpoints
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.js          # Database connection
│   │   │   ├── redis.js            # Redis connection
│   │   │   └── app.js              # Express app configuration
│   │   └── server.js               # Application entry point
│   ├── tests/                       # Backend tests
│   ├── prisma/                      # Database migrations and seeds
│   └── package.json
├── frontend/                        # React application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                 # Base UI components (buttons, inputs, etc.)
│   │   │   ├── forms/              # Form components
│   │   │   ├── charts/             # Data visualization components
│   │   │   ├── layout/             # Layout components (header, sidebar, etc.)
│   │   │   └── common/             # Common business components
│   │   ├── pages/                   # Page components (route components)
│   │   │   ├── Dashboard/          # Executive dashboard
│   │   │   ├── Forecasts/          # Forecast management
│   │   │   ├── Projects/           # Project management
│   │   │   ├── Reports/            # Report viewing
│   │   │   ├── Users/              # User management
│   │   │   └── Auth/               # Authentication pages
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js          # Authentication hook
│   │   │   ├── useForecast.js      # Forecast data hook
│   │   │   └── useNotifications.js # Notification hook
│   │   ├── store/                   # Zustand state management
│   │   │   ├── authStore.js        # Authentication state
│   │   │   ├── forecastStore.js    # Forecast state
│   │   │   └── uiStore.js          # UI state
│   │   ├── services/                # API service layer
│   │   │   ├── api.js              # Axios configuration
│   │   │   ├── authService.js      # Authentication API calls
│   │   │   ├── forecastService.js  # Forecast API calls
│   │   │   └── reportService.js    # Report API calls
│   │   ├── utils/                   # Frontend utilities
│   │   │   ├── formatters.js       # Data formatting functions
│   │   │   ├── validators.js       # Form validation
│   │   │   └── constants.js        # Application constants
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── styles/                  # Global styles and Tailwind config
│   │   └── App.tsx                 # Main application component
│   ├── public/                      # Static assets
│   ├── tests/                       # Frontend tests
│   └── package.json
├── docker-compose.yml               # Multi-container setup
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

### Key Files and Their Purpose

#### Backend Core Files

**`backend/src/server.js`**
- Application entry point
- Configures Express server, middleware, and routes
- Handles graceful shutdown and error handling

**`backend/src/controllers/forecast.controller.js`**
- Handles all forecast-related HTTP requests
- Methods: `createForecast()`, `updateForecast()`, `getForecastsByPeriod()`
- Validates input and delegates business logic to services

**`backend/src/services/forecast.service.js`**
- Core business logic for forecast operations
- `calculateProbabilityWeighted()` - Calculates weighted pipeline values
- `validateForecastData()` - Ensures data integrity
- `generateForecastSummary()` - Creates executive summary data

**`backend/src/services/automation.service.js`**
- Handles scheduled tasks using node-cron
- `startForecastCycle()` - Initiates new forecast periods
- `sendReminders()` - Automated deadline reminders
- `compileReports()` - Auto-generates executive reports

**`backend/src/models/schema.prisma`**
- Defines database schema using Prisma ORM
- Core entities: User, Forecast, Project, ForecastPeriod, AuditLog
- Relationships and constraints for data integrity

#### Frontend Core Files

**`frontend/src/App.tsx`**
- Main application component
- Sets up routing, authentication context, and global providers
- Handles authentication state and protected routes

**`frontend/src/pages/Dashboard/ExecutiveDashboard.tsx`**
- Primary executive view showing key metrics
- Real-time forecast progress, market segment performance
- Interactive charts using Recharts library

**`frontend/src/pages/Forecasts/ForecastEntry.tsx`**
- Main forecast input interface for contributors
- Dynamic form handling for Backlog and SWAG projects
- Real-time validation and probability calculations

**`frontend/src/hooks/useForecast.js`**
- Custom hook managing forecast data state
- Integrates with React Query for server state management
- Provides optimistic updates and error handling

**`frontend/src/services/api.js`**
- Axios configuration with interceptors
- Handles authentication tokens and error responses
- Base configuration for all API calls

### Major Functions and Classes

#### Backend Functions

**`ForecastService.calculateProbabilityWeighted(projects)`**
```javascript
// Calculates probability-weighted revenue for project arrays
// Parameters: projects - Array of project objects with amount and probability
// Returns: Object with weighted totals by market segment
```

**`AutomationService.startForecastCycle(period)`**
```javascript
// Initiates a new forecast period and notifies contributors
// Parameters: period - ForecastPeriod object with dates and settings
// Side effects: Creates database records, sends notifications
```

**`ReportService.generateExecutiveReport(periodId)`**
```javascript
// Compiles all forecast data into executive summary format
// Parameters: periodId - UUID of the forecast period
// Returns: Formatted report object with charts and summary data
```

#### Frontend Components

**`<ForecastForm />` Component**
- Handles dynamic project entry with add/remove functionality
- Real-time probability calculations and validation
- Auto-save functionality to prevent data loss

**`<ExecutiveCharts />` Component**
- Renders market segment performance using Recharts
- Interactive charts with drill-down capabilities
- Responsive design for mobile and desktop

## Dependencies & Assumptions

### Third-Party Services
- **PostgreSQL Database** - Primary data storage (local or cloud)
- **Redis Cache** - Session storage and caching (local or cloud)
- **SMTP Server** - Email notifications (Gmail, SendGrid, etc.)

### Key Assumptions
- **Network Connectivity** - Assumes reliable internet for real-time collaboration
- **Modern Browsers** - Requires Chrome 90+, Firefox 88+, Safari 14+
- **Email Delivery** - Assumes SMTP configuration for notifications
- **Data Integrity** - Assumes users input financial data in USD
- **Timezone** - All dates stored in UTC, displayed in user's local timezone
- **File Uploads** - Limited to 10MB Excel/CSV files for import functionality

### Security Assumptions
- **HTTPS Required** - All production deployments must use SSL/TLS
- **Environment Variables** - Sensitive data stored in environment variables, not code
- **JWT Security** - Tokens expire in 7 days, refresh token rotation implemented
- **Input Validation** - All user inputs validated on both client and server side

### Performance Considerations
- **Concurrent Users** - Optimized for up to 20 simultaneous users
- **Database Connections** - Connection pooling configured for efficient resource usage
- **Caching Strategy** - Redis caching for frequently accessed forecast data
- **File Processing** - Excel imports processed asynchronously to prevent blocking

## Extensibility

### Adding New Market Segments
1. Update `MarketSegment` enum in `backend/src/models/schema.prisma`
2. Run database migration: `npm run db:migrate`
3. Add segment to `MARKET_SEGMENTS` constant in `frontend/src/utils/constants.js`
4. Update chart configurations in `frontend/src/components/charts/`

### Implementing New Report Types
1. Create new service method in `backend/src/services/report.service.js`
2. Add corresponding route in `backend/src/routes/report.routes.js`
3. Create React component in `frontend/src/pages/Reports/`
4. Add route to `frontend/src/App.tsx`

### Adding External Integrations
1. Create new service file in `backend/src/services/integration/`
2. Add configuration variables to `.env`
3. Implement webhook endpoints if needed
4. Add corresponding frontend UI for configuration

### Extending User Roles
1. Update `Role` enum in Prisma schema
2. Modify RBAC middleware in `backend/src/middleware/rbac.middleware.js`
3. Update frontend route protection logic
4. Add role-specific UI components

### Database Schema Changes
```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Update TypeScript types
npx prisma generate

# Seed new data if needed
npm run db:seed
```

### Adding New Validation Rules
1. Update Joi schemas in `backend/src/utils/validation.js`
2. Add corresponding frontend validation in React Hook Form
3. Update error messages in `frontend/src/utils/validators.js`

### Performance Optimizations
- **Database Indexing** - Add indexes to frequently queried columns
- **Query Optimization** - Use Prisma's `include` and `select` judiciously
- **Frontend Optimization** - Implement React.memo for expensive components
- **Caching Strategy** - Extend Redis caching for additional data types

## API Documentation

### Authentication Endpoints

**POST `/api/auth/login`**
```json
// Request
{
  "email": "user@sukut.com",
  "password": "securePassword123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@sukut.com",
    "role": "CONTRIBUTOR",
    "firstName": "John",
    "lastName": "Doe",
    "marketSegments": ["ENVIRONMENTAL", "ENERGY"]
  }
}
```

**POST `/api/auth/refresh`**
```json
// Request (requires valid JWT in Authorization header)
{}

// Response
{
  "token": "newJwtToken..."
}
```

### Forecast Endpoints

**GET `/api/forecasts/periods`**
```json
// Response
{
  "periods": [
    {
      "id": "uuid",
      "name": "Q1 2025 Forecast",
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2025-03-31T23:59:59Z",
      "submissionDeadline": "2025-01-15T17:00:00Z",
      "status": "ACTIVE",
      "isLocked": false
    }
  ]
}
```

**POST `/api/forecasts`**
```json
// Request
{
  "periodId": "uuid",
  "marketSegment": "ENVIRONMENTAL",
  "projects": [
    {
      "name": "Highway Cleanup Project",
      "type": "BACKLOG",
      "estimatedValue": 250000,
      "probability": 90,
      "expectedCloseDate": "2025-02-15T00:00:00Z",
      "clientName": "CalTrans",
      "notes": "Contract pending final approval"
    },
    {
      "name": "Industrial Site Remediation",
      "type": "SWAG",
      "estimatedValue": 500000,
      "probability": 30,
      "expectedCloseDate": "2025-03-30T00:00:00Z",
      "clientName": "Pacific Manufacturing",
      "notes": "Early stage opportunity"
    }
  ]
}

// Response
{
  "id": "uuid",
  "periodId": "uuid",
  "marketSegment": "ENVIRONMENTAL",
  "status": "DRAFT",
  "submittedAt": null,
  "projects": [...],
  "summary": {
    "totalBacklog": 225000,
    "totalSwag": 150000,
    "weightedTotal": 375000
  }
}
```

**PUT `/api/forecasts/:id/submit`**
```json
// Response
{
  "id": "uuid",
  "status": "SUBMITTED",
  "submittedAt": "2025-01-10T14:30:00Z",
  "lockedForEditing": true
}
```

### Report Endpoints

**GET `/api/reports/executive/:periodId`**
```json
// Response
{
  "period": {
    "name": "Q1 2025 Forecast",
    "generatedAt": "2025-01-16T09:00:00Z"
  },
  "summary": {
    "totalBacklog": 5250000,
    "totalSwag": 3200000,
    "weightedTotal": 7890000,
    "submissionRate": 85
  },
  "bySegment": {
    "ENVIRONMENTAL": {
      "backlog": 1500000,
      "swag": 800000,
      "weighted": 2100000
    },
    "ENERGY": {
      "backlog": 2000000,
      "swag": 1200000,
      "weighted": 2890000
    },
    "PUBLIC_WORKS": {
      "backlog": 1200000,
      "swag": 900000,
      "weighted": 1950000
    },
    "RESIDENTIAL": {
      "backlog": 550000,
      "swag": 300000,
      "weighted": 950000
    }
  },
  "trends": [
    {
      "period": "Q4 2024",
      "actualRevenue": 6750000,
      "forecastAccuracy": 94.2
    }
  ]
}
```

### Error Responses
All endpoints return consistent error format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid forecast data provided",
    "details": {
      "field": "projects[0].probability",
      "value": 150,
      "constraint": "Must be between 0 and 100"
    }
  }
}
```

### Authentication
All API endpoints (except `/auth/login`) require JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Getting Help

### Development Resources
- **API Documentation**: http://localhost:3001/api-docs (when running locally)
- **Database Schema**: View with `npx prisma studio`
- **Component Library**: Check Storybook at http://localhost:6006

### Common Issues
1. **Database Connection Errors**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **JWT Errors**: Check JWT_SECRET is set and tokens haven't expired
3. **CORS Issues**: Verify FRONTEND_URL matches your development server
4. **Email Notifications**: Confirm SMTP settings are valid

### Contributing
1. Create feature branch from `main`
2. Follow existing code style (ESLint/Prettier configured)
3. Add tests for new functionality
4. Update documentation as needed
5. Submit pull request with descriptive title

---

*This documentation is maintained by the Sukut Construction development team. Last updated: June 2025*