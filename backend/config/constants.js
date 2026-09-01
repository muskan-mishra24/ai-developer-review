const REVIEW_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

const ISSUE_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
};

const ISSUE_TYPE = {
  BUG: 'bug',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  CODE_QUALITY: 'code_quality',
  REFACTORING: 'refactoring',
  TESTING: 'testing',
  DOCUMENTATION: 'documentation'
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_TOKEN: 'Invalid or expired token',
  USER_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
  REPOSITORY_NOT_FOUND: 'Repository not found',
  REVIEW_NOT_FOUND: 'Review not found',
  INTERNAL_ERROR: 'Internal server error'
};

module.exports = {
  REVIEW_STATUS,
  ISSUE_SEVERITY,
  ISSUE_TYPE,
  ERROR_MESSAGES
};
