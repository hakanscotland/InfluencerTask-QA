/**
 * Centralized Playwright selector utilities for E2E tests.
 * 
 * All selectors use `data-testid` as defined in playwright.config.ts.
 * Import these helpers in step definitions and page objects.
 * 
 * @example
 * import { loginSelectors, sidebarSelectors } from '@/e2e/utils/selectors';
 * await page.getByTestId(loginSelectors.emailInput).fill('test@example.com');
 */

// ─── Auth Selectors ───
export const loginSelectors = {
  page: 'login-page',
  form: 'login-form',
  emailInput: 'login-email-input',
  passwordInput: 'login-password-input',
  passwordToggle: 'login-password-toggle',
  forgotPasswordLink: 'login-forgot-password-link',
  submitButton: 'login-submit-button',
  googleButton: 'login-google-button',
  errorMessage: 'login-error-message',
  registerLink: 'login-register-link',
} as const;

export const registerSelectors = {
  page: 'register-page',
  form: 'register-form',
  roleBrand: 'register-role-brand',
  roleInfluencer: 'register-role-influencer',
  emailInput: 'register-email-input',
  passwordInput: 'register-password-input',
  submitButton: 'register-submit-button',
  googleButton: 'register-google-button',
  loginLink: 'register-login-link',
} as const;

export const forgotPasswordSelectors = {
  page: 'forgot-password-page',
  emailInput: 'forgot-password-email-input',
  submitButton: 'forgot-password-submit-button',
} as const;

export const resetPasswordSelectors = {
  page: 'reset-password-page',
  passwordInput: 'reset-password-password-input',
  confirmInput: 'reset-password-confirm-input',
  submitButton: 'reset-password-submit-button',
} as const;

// ─── Layout Selectors ───
export const sidebarSelectors = {
  sidebar: 'sidebar',
  logo: 'sidebar-logo',
  navLink: (route: string) => `sidebar-nav-link-${route}`,
  logoutButton: 'sidebar-logout-button',
  settingsLink: 'sidebar-settings-link',
  homeLink: 'sidebar-home-link',
} as const;

export const headerSelectors = {
  header: 'header',
  mobileMenuButton: 'header-mobile-menu-button',
  languageSwitcher: 'header-language-switcher',
  notificationsButton: 'header-notifications-button',
  walletButton: 'header-wallet-button',
  userMenu: 'header-user-menu',
  userName: 'header-user-name',
} as const;

export const mobileNavSelectors = {
  overlay: 'mobile-nav-overlay',
  closeButton: 'mobile-nav-close-button',
  navLink: (route: string) => `mobile-nav-link-${route}`,
} as const;

// ─── Settings Selectors ───
export const settingsSelectors = {
  page: 'settings-page',
  profileTab: 'settings-profile-tab',
  kycTab: 'settings-kyc-tab',
  subscriptionTab: 'settings-subscription-tab',
  saveButton: 'settings-save-button',
  nameInput: 'settings-name-input',
  bioTextarea: 'settings-bio-textarea',
  successToast: 'settings-success-toast',
} as const;

// ─── Influencer Opportunities Selectors ───
export const opportunitiesSelectors = {
  page: 'opportunities-page',
  card: (id: string) => `opportunity-card-${id}`,
  cardApplyButton: (id: string) => `opportunity-card-${id}-apply-button`,
  filterCategory: 'opportunities-filter-category',
  filterBudget: 'opportunities-filter-budget',
} as const;

// ─── Brand Discover Selectors ───
export const discoverSelectors = {
  page: 'discover-page',
  influencerCard: (id: string) => `discover-influencer-card-${id}`,
  filterPlatform: 'discover-filter-platform',
  searchInput: 'discover-search-input',
} as const;

// ─── Campaign Detail Selectors ───
export const campaignDetailSelectors = {
  page: 'campaign-detail-page',
  title: 'campaign-detail-title',
  statusBadge: 'campaign-detail-status-badge',
  applicationsTab: 'campaign-detail-applications-tab',
  tasksTab: 'campaign-detail-tasks-tab',
  submissionsPanel: 'campaign-submissions-panel',
} as const;

// ─── Analytics Selectors ───
export const analyticsSelectors = {
  page: 'analytics-page',
  engagementChart: 'analytics-engagement-chart',
  followersChart: 'analytics-followers-chart',
  metricsGrid: 'analytics-metrics-grid',
} as const;

// ─── Social Accounts Selectors ───
export const socialSelectors = {
  page: 'social-page',
  connectButton: 'social-connect-button',
  connectedChannelsTable: 'connected-channels-table',
  channelRow: (id: string) => `social-channel-row-${id}`,
} as const;

// ─── Brand Dashboard Selectors ───
export const brandSelectors = {
  overviewPage: 'brand-overview-page',
  createCampaignButton: 'brand-create-campaign-button',
} as const;

export const campaignWizardSelectors = {
  wizard: 'campaign-wizard',
  step: (n: number) => `campaign-wizard-step-${n}`,
  progressBar: 'campaign-wizard-progress-bar',
  nextButton: 'campaign-wizard-next-button',
  backButton: 'campaign-wizard-back-button',
  submitButton: 'campaign-wizard-submit-button',
  // Step 1
  step1TitleInput: 'wizard-step-1-title-input',
  step1DescriptionTextarea: 'wizard-step-1-description-textarea',
  step1CategorySelect: 'wizard-step-1-category-select',
  step1BudgetInput: 'wizard-step-1-budget-input',
  // Step 2
  step2TaskBuilder: 'wizard-step-2-task-builder',
  step2AddTaskButton: 'wizard-step-2-add-task-button',
  // Step 3
  step3PlatformMultiSelect: 'wizard-step-3-platform-multi-select',
  step3AudienceAgeSelect: 'wizard-step-3-audience-age-select',
  step3AudienceGenderSelect: 'wizard-step-3-audience-gender-select',
  // Step 4
  step4ReviewCard: 'wizard-step-4-review-card',
  step4EditStepButton: (n: number) => `wizard-step-4-edit-step-${n}-button`,
} as const;

export const taskBuilderSelectors = {
  builder: 'task-builder',
  taskItem: (index: number) => `task-builder-task-item-${index}`,
  platformSelect: (index: number) => `task-builder-platform-select-${index}`,
  taskTypeSelect: (index: number) => `task-builder-task-type-select-${index}`,
  rewardInput: (index: number) => `task-builder-reward-input-${index}`,
  descriptionInput: (index: number) => `task-builder-description-input-${index}`,
  validationRulesSection: (index: number) => `task-builder-validation-rules-section-${index}`,
  removeTaskButton: (index: number) => `task-builder-remove-task-button-${index}`,
  addTaskButton: 'task-builder-add-task-button',
  reorderUp: (index: number) => `task-builder-reorder-up-${index}`,
  reorderDown: (index: number) => `task-builder-reorder-down-${index}`,
} as const;

export const campaignCardSelectors = {
  card: (campaignId: string) => `campaign-card-${campaignId}`,
  title: 'campaign-card-title',
  statusBadge: 'campaign-card-status-badge',
  budget: 'campaign-card-budget',
  viewButton: 'campaign-card-view-button',
  editButton: 'campaign-card-edit-button',
  deleteButton: 'campaign-card-delete-button',
} as const;

export const campaignTableSelectors = {
  table: 'campaign-table',
  header: (column: string) => `campaign-table-header-${column}`,
  row: (campaignId: string) => `campaign-table-row-${campaignId}`,
  rowStatus: (campaignId: string) => `campaign-table-row-${campaignId}-status`,
  rowActions: (campaignId: string) => `campaign-table-row-${campaignId}-actions`,
  emptyState: 'campaign-table-empty-state',
  searchInput: 'campaign-table-search-input',
  filterDropdown: 'campaign-table-filter-dropdown',
} as const;

// ─── Influencer Dashboard Selectors ───
export const influencerSelectors = {
  overviewPage: 'influencer-overview-page',
} as const;

export const taskChecklistSelectors = {
  checklist: 'task-checklist',
  taskItem: (taskId: string) => `task-checklist-task-item-${taskId}`,
  taskStatus: (taskId: string) => `task-checklist-task-item-${taskId}-status`,
  taskRequirements: (taskId: string) => `task-checklist-task-item-${taskId}-requirements`,
  taskSubmitButton: (taskId: string) => `task-checklist-task-item-${taskId}-submit-button`,
  progressBar: 'task-checklist-progress-bar',
  closeButton: 'task-checklist-close-button',
} as const;

export const submitTaskModalSelectors = {
  modal: 'submit-task-modal',
  contentUrlInput: 'submit-task-modal-content-url-input',
  postIdInput: 'submit-task-modal-post-id-input',
  proofUploadZone: 'submit-task-modal-proof-upload-zone',
  proofPreview: 'submit-task-modal-proof-preview',
  notesTextarea: 'submit-task-modal-notes-textarea',
  submitButton: 'submit-task-modal-submit-button',
  cancelButton: 'submit-task-modal-cancel-button',
} as const;

// ─── Admin Dashboard Selectors ───
export const adminSelectors = {
  overviewPage: 'admin-overview-page',
} as const;

export const adminSubmissionsSelectors = {
  page: 'admin-submissions-page',
  table: 'admin-submissions-table',
  row: (submissionId: string) => `admin-submissions-table-row-${submissionId}`,
  rowProofThumbnail: (submissionId: string) => `admin-submissions-row-${submissionId}-proof-thumbnail`,
  rowApproveButton: (submissionId: string) => `admin-submissions-row-${submissionId}-approve-button`,
  rowRejectButton: (submissionId: string) => `admin-submissions-row-${submissionId}-reject-button`,
  rowReviewButton: (submissionId: string) => `admin-submissions-row-${submissionId}-review-button`,
  filterStatus: 'admin-submissions-filter-status',
  filterCampaign: 'admin-submissions-filter-campaign',
} as const;

export const adminUsersSelectors = {
  page: 'admin-users-page',
  table: 'admin-users-table',
  row: (userId: string) => `admin-users-table-row-${userId}`,
  rowRoleBadge: (userId: string) => `admin-users-row-${userId}-role-badge`,
  rowStatusBadge: (userId: string) => `admin-users-row-${userId}-status-badge`,
  rowEditButton: (userId: string) => `admin-users-row-${userId}-edit-button`,
  rowSuspendButton: (userId: string) => `admin-users-row-${userId}-suspend-button`,
  searchInput: 'admin-users-search-input',
} as const;

// ─── Shared Component Selectors ───
export const confirmModalSelectors = {
  modal: 'confirm-modal',
  title: 'confirm-modal-title',
  description: 'confirm-modal-description',
  confirmButton: 'confirm-modal-confirm-button',
  cancelButton: 'confirm-modal-cancel-button',
  closeButton: 'confirm-modal-close-button',
} as const;

export const walletSelectors = {
  page: 'wallet-page',
  tabsContainer: 'wallet-tabs-container',
  tab: (tabName: string) => `wallet-tab-${tabName}`,
  balanceCard: 'wallet-balance-card',
  depositButton: 'wallet-deposit-button',
  withdrawButton: 'wallet-withdraw-button',
  transactionTable: 'wallet-transaction-table',
  transactionRow: (index: number) => `wallet-transaction-row-${index}`,
} as const;

export const notificationSelectors = {
  popover: 'notifications-popover',
  list: 'notifications-list',
  item: (index: number) => `notification-item-${index}`,
  markReadButton: 'notification-mark-read-button',
  bellButton: 'notification-bell-button',
  unreadBadge: 'notification-unread-badge',
} as const;

export const chatSelectors = {
  window: 'chat-window',
  messageList: 'chat-message-list',
  messageInput: 'chat-message-input',
  sendButton: 'chat-send-button',
  attachmentButton: 'chat-attachment-button',
  conversationList: 'conversation-list',
  conversationItem: (conversationId: string) => `conversation-item-${conversationId}`,
} as const;
