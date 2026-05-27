@navigation @sidebar
Feature: Admin Sidebar Navigation
  As an admin user
  I want to navigate between admin panel sections via the sidebar
  So that I can manage the platform efficiently

  Background:
    Given I am logged in as an "admin" user

  Scenario: Admin sidebar navigation links
    Then I should see the element with test id "sidebar-nav-link-admin"
    And I should see the element with test id "sidebar-nav-link-admin-users"
    And I should see the element with test id "sidebar-nav-link-admin-brands"
    And I should see the element with test id "sidebar-nav-link-admin-campaigns"
    And I should see the element with test id "sidebar-nav-link-admin-submissions"
    And I should see the element with test id "sidebar-nav-link-admin-iqs"
    And I should see the element with test id "sidebar-nav-link-admin-iqs-settings"
    And I should see the element with test id "sidebar-nav-link-admin-withdrawals"
    And I should see the element with test id "sidebar-nav-link-admin-finance"
    And I should see the element with test id "sidebar-nav-link-admin-subscriptions"
    And I should see the element with test id "sidebar-nav-link-admin-settings"
    And I should see the element with test id "sidebar-nav-link-admin-versions"
    And I should see the element with test id "sidebar-nav-link-admin-tickets"
    And I should see the element with test id "sidebar-nav-link-admin-waitlist"

  Scenario: Navigate to admin users from sidebar
    When I click the element with test id "sidebar-nav-link-admin-users"
    Then the URL should contain "/admin/users"

  Scenario: Navigate to admin campaigns from sidebar
    When I click the element with test id "sidebar-nav-link-admin-campaigns"
    Then the URL should contain "/admin/campaigns"

  Scenario: Navigate to admin finance from sidebar
    When I click the element with test id "sidebar-nav-link-admin-finance"
    Then the URL should contain "/admin/finance"

  Scenario: Navigate to admin withdrawals from sidebar
    When I click the element with test id "sidebar-nav-link-admin-withdrawals"
    Then the URL should contain "/admin/withdrawals"
