@influencer @iqs
Feature: Influencer Quality Score
  As an influencer user
  I want to view my quality score
  So that I know how brands evaluate my profile

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer iqs" page

  Scenario: IQS page loads with score card
    Then the page should contain text "Influencer Quality Score"
    And I should see the element with test id matching pattern "iqs-badge-.*"
    And I should see the element with test id matching pattern "ip-score-card-.*"

  Scenario: IQS page explains score value
    Then the page should contain text "Why IQS matters?"
    And the page should contain text "How to boost your score?"

  Scenario: Recalculate action is visible
    Then I should see the element with test id "iqs-recalculate-button"

  @mobile
  Scenario: IQS page on mobile
    Given I set viewport to mobile
    Then the page should contain text "Influencer Quality Score"
