@admin @users
Feature: Admin User Management
  As an admin user
  I want to manage platform users
  So that I can verify, suspend, or edit accounts

  Background:
    Given I am logged in as an "admin" user
    And I navigate to the "admin users" page

  Scenario: Users page loads with table and search
    Then I should see the element with test id "admin-users-page"
    And I should see the element with test id "admin-users-table"
    And I should see the element with test id "admin-users-search-input"

  Scenario: Search for a brand user
    When I fill the field with test id "admin-users-search-input" with "marka"
    Then the element with test id matching pattern "admin-users-row-.*-role-badge" should contain text "brand"

  Scenario: Users table shows role badges
    Then I should see the element with test id matching pattern "admin-users-row-.*-role-badge"

  Scenario: Users table shows status badges
    Then I should see the element with test id matching pattern "admin-users-row-.*-status-badge"

  @mobile
  Scenario: Users page on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "admin-users-page"
