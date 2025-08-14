
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  SIGNUP: '/signup',
  
  // Protected routes
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  SUBCONTRACTORS: '/subcontractors',
  SUBCONTRACTOR_DETAIL: '/subcontractors/:id',
  TRADES: '/trades',
  TRADE_DETAIL: '/trades/:tradeId',
  RESPONSIBILITIES: '/responsibilities',
  SUBCONTRACTS: '/subcontracts',
  SUBCONTRACT_DETAIL: '/subcontracts/:id',
  ALERTS: '/alerts',
  REPORT: '/report',
  RATE_ESTIMATOR: '/rate-estimator',
  FILTERED_SUBCONTRACTS: '/reports/subcontracts',
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  ROLE_MANAGEMENT: '/admin/roles',
  PROFILE: '/profile',
  ACTIVITY_LOG: '/admin/activity-log',
} as const;
