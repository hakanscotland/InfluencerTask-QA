Feature: Admin Submission Review
  As an admin
  I want to review influencer task submissions
  So that I can approve or reject completed work

  Background:
    Given the test data is reset with a pending submission
    And I am logged in as an "admin" user
    And I navigate to the "admin submissions" page

  Scenario: View submissions table
    Then I should see the element with test id "admin-submissions-page"
    And I should see the element with test id "admin-submissions-table"

  Scenario: Filter submissions by status
    When I select "pending" from the dropdown with test id "admin-submissions-filter-status"
    Then I should see the element with test id "admin-submissions-table"

  Scenario: Approve a submission
    Given I see at least one submission in the table
    When I click the element with test id matching pattern "admin-submissions-row-.*-approve-button"
    Then I should see the element with test id "confirm-modal"
    When I click the element with test id "confirm-modal-confirm-button"
    Then I should not see the element with test id "confirm-modal"

  Scenario: Reject a submission
    Given I see at least one submission in the table
    When I click the element with test id matching pattern "admin-submissions-row-.*-reject-button"
    Then I should see the element with test id "confirm-modal"
    When I click the element with test id "confirm-modal-confirm-button"
    Then I should not see the element with test id "confirm-modal"

  Scenario: Review submission details
    Given I see at least one submission in the table
    When I click the element with test id matching pattern "admin-submissions-row-.*-review-button"
    Then I should see the element with test id "submit-task-modal"
