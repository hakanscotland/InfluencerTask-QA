@brand @campaign-detail
Feature: Brand Campaign Detail
  As a brand user
  I want to view campaign details and applications
  So that I can manage a specific campaign

  Background:
    Given the test data is reset for influencer user
    And I am logged in as a "brand" user
    And I navigate to the "brand campaigns" page

  Scenario: Navigate to first campaign detail
    When I click the element with test id matching pattern "campaign-table-row-.*"
    Then the URL should contain "/brand/campaigns/"

  Scenario: Campaign detail page has tabs
    Given I navigate to the "brand campaigns" page
    When I click the element with test id matching pattern "campaign-table-row-.*"
    Then I should see the element with test id "campaign-detail-title"
    And I should see the element with test id "campaign-detail-status-badge"

  @mobile
  Scenario: Campaign detail on mobile
    Given I set viewport to mobile
    And I navigate to the "brand campaigns" page
    When I click the element with test id matching pattern "campaign-table-row-.*"
    Then I should see the element with test id "campaign-detail-title"
