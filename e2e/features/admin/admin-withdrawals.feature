@admin @withdrawals
Feature: Admin Withdrawal Management
  As an admin user
  I want to review and approve influencer withdrawal requests
  So that I can process payments securely

  Background:
    Given the test data is reset for influencer user
    And I am logged in as an "admin" user
    And I navigate to the "admin withdrawals" page

  Scenario: Withdrawals page loads
    Then I should see the element with test id "admin-withdrawal-page"

  Scenario: Withdrawal table has approval actions
    Then I should see the element with test id matching pattern "admin-withdrawal-row-.*-approve-button"

  Scenario: Approve a withdrawal shows confirmation modal
    When I click the element with test id matching pattern "admin-withdrawal-row-.*-approve-button"
    Then I should see the element with test id "admin-withdrawal-action-modal"
    When I fill the field with test id "withdrawal-modal-note-input" with "Test admin note"
    And I click the element with test id "withdrawal-modal-confirm-button"
    Then I should not see the element with test id "admin-withdrawal-action-modal"

  @mobile
  Scenario: Withdrawals page on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "admin-withdrawal-page"
