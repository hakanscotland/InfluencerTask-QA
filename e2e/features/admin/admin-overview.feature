@admin @overview
Feature: Admin Dashboard Overview
  As an admin user
  I want to see the platform overview
  So that I can monitor key metrics and access management tools

  Background:
    Given I am logged in as an "admin" user
    And I navigate to the "admin overview" page

  Scenario: Overview page loads with stats
    Then I should see the element with test id "admin-overview-page"
    And the page may contain text "Users"
    And the page may contain text "Campaigns"
    And the page may contain text "Applications"

  Scenario: Quick access links are visible
    Then the page may contain text "Manage Users"
    And the page may contain text "Approve Campaigns"
    And the page may contain text "Financial Reports"
    And the page may contain text "Withdrawal Requests"
    And the page may contain text "Platform Settings"

  Scenario: Admin profile card is visible
    Then the page may contain text "Super Admin"

  @mobile
  Scenario: Admin overview on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "admin-overview-page"
