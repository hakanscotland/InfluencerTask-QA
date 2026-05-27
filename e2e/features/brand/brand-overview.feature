@smoke @regression @brand @overview
Feature: Brand Dashboard Overview
  As a brand user
  I want to see my dashboard overview
  So that I can track campaigns and profile status

  Background:
    Given I am logged in as a "brand" user
    And I navigate to the "brand overview" page

  @smoke @critical
  Scenario: Overview page loads with key elements
    Then I should see the element with test id "brand-overview-page"
    And I should see the element with test id "brand-create-campaign-button"

  Scenario: Overview shows campaign summary
    Then the page may contain text "Active"
    And the page may contain text "Pending"
    And the page may contain text "Rejected"

  Scenario: Create campaign button navigates to wizard
    When I click the element with test id "brand-create-campaign-button"
    Then the URL should contain "/campaigns/new"
    And I should see the element with test id "campaign-wizard"
