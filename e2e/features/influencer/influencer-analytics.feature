@influencer @analytics
Feature: Influencer Analytics
  As an influencer user
  I want to view my performance analytics
  So that I can understand my audience and growth

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer analytics" page

  Scenario: Analytics page loads
    Then I should see the element with test id "analytics-page"

  Scenario: Analytics shows data or empty state
    Then the page may contain text "No Analytics Data Yet"
    And the page may contain text "Connect Account"

  @mobile
  Scenario: Analytics on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "analytics-page"
