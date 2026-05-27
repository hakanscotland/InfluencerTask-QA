@regression @influencer
Feature: Influencer Task Submission
  As an influencer
  I want to submit completed task work
  So that I can get paid for my efforts

  Background:
    Given the test data is reset for influencer user
    And I am logged in as an "influencer" user
    And I navigate to the "influencer campaigns" page

  Scenario: Open task checklist from campaign
    When I click the element with test id matching pattern "influencer-campaign-card-apply-button"
    Then I should see the element with test id "task-checklist"

  Scenario: Submit task with content URL
    Given I click the element with test id matching pattern "influencer-campaign-card-apply-button"
    When I click the element with test id matching pattern "task-checklist-task-item-.*-submit-button"
    Then I should see the element with test id "submit-task-modal"
    When I fill the field with test id "submit-task-modal-content-url-input" with "https://instagram.com/p/test123"
    And I fill the field with test id "submit-task-modal-notes-textarea" with "Great collaboration!"
    And I click the element with test id "submit-task-modal-submit-button"
    Then I should not see the element with test id "submit-task-modal"
    And the element with test id matching pattern "task-checklist-task-item-.*-status" should contain text "pending"

  Scenario: Cancel task submission
    Given I click the element with test id matching pattern "influencer-campaign-card-apply-button"
    When I click the element with test id matching pattern "task-checklist-task-item-.*-submit-button"
    Then I should see the element with test id "submit-task-modal"
    When I click the element with test id "submit-task-modal-cancel-button"
    Then I should not see the element with test id "submit-task-modal"

  Scenario: Submit task modal has all required fields
    Given I click the element with test id matching pattern "influencer-campaign-card-apply-button"
    When I click the element with test id matching pattern "task-checklist-task-item-.*-submit-button"
    Then I should see the element with test id "submit-task-modal-content-url-input"
    And I should see the element with test id "submit-task-modal-notes-textarea"
    And I should see the element with test id "submit-task-modal-submit-button"
    And I should see the element with test id "submit-task-modal-cancel-button"
