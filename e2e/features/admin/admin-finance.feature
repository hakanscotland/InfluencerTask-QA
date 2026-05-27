@admin @finance
Feature: Admin Finance and Treasury
  As an admin user
  I want to review deposit and financial requests
  So that I can manage platform treasury

  Background:
    Given the test data is reset for influencer user
    And I am logged in as an "admin" user
    And I navigate to the "admin finance" page

  Scenario: Finance page loads
    Then I should see the element with test id "admin-treasury-page"

  Scenario: Treasury table has approval actions
    Then I should see the element with test id matching pattern "admin-deposit-row-.*-approve-button"

  @mobile
  Scenario: Finance page on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "admin-treasury-page"
