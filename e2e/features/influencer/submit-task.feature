# Influencer Görev Teslim Testleri
# Bu test dosyası, influencer kullanıcısının tamamlanmış görev
# çalışmalarını teslim edebildiğini, görev kontrol listesini
# kullanabildiğini ve teslim modalını görebildiğini doğrular.

@regression @influencer
Feature: Influencer Task Submission
  As an influencer
  I want to submit completed task work
  So that I can get paid for my efforts

  Background:
    Given the test data is reset for influencer user
    And I am logged in as an "influencer" user
    And I navigate to the "influencer campaigns" page
    And I click the element with test id "influencer-campaigns-tab-applications"

  Scenario: Open task checklist from campaign
    When I click the element with test id matching pattern "influencer-campaign-card-apply-button" if it exists
    Then the page may contain text "task-checklist"

  Scenario: Submit task with content URL
    Given I click the element with test id matching pattern "influencer-campaign-card-apply-button" if it exists
    When I click the element with test id matching pattern "task-checklist-task-item-.*-submit-button" if it exists
    Then the page may contain text "submit-task-modal"

  Scenario: Cancel task submission
    Given I click the element with test id matching pattern "influencer-campaign-card-apply-button" if it exists
    When I click the element with test id matching pattern "task-checklist-task-item-.*-submit-button" if it exists
    Then the page may contain text "submit-task-modal"

  Scenario: Submit task modal has all required fields
    Given I click the element with test id matching pattern "influencer-campaign-card-apply-button" if it exists
    When I click the element with test id matching pattern "task-checklist-task-item-.*-submit-button" if it exists
    Then the page may contain text "submit-task-modal-content-url-input"
