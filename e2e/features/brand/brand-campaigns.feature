@smoke @regression @brand @campaigns
Feature: Brand Campaigns List
  As a brand user
  I want to view and manage my campaigns
  So that I can track their status and performance

  Background:
    Given the test data is reset for influencer user
    And I am logged in as a "brand" user
    And I navigate to the "brand campaigns" page

  @smoke @critical
  Scenario: Campaigns page loads with table
    Then I should see the element with test id "campaign-table"
    And I should see the element with test id "campaign-table-search-input"
    And I should see the element with test id "campaign-table-filter-dropdown"

  Scenario: Search campaigns by title
    When I fill the field with test id "campaign-table-search-input" with "Summer"
    Then I should see the element with test id "campaign-table"

  Scenario: Create new campaign button opens wizard
    When I click the element with test id "brand-create-campaign-button"
    Then I should see the element with test id "campaign-wizard"

  @mobile
  Scenario: Campaigns page loads on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "campaign-table"
