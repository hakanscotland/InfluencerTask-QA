@influencer @analytics
Feature: Influencer Analytics
  As an influencer user
  I want to view my performance analytics
  So that I can understand my audience and growth

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer analytics" page

  Scenario: Analytics page loads with charts
    Then I should see the element with test id "analytics-page"

  Scenario: Analytics shows metrics grid
    Then I should see the element with test id "analytics-metrics-grid"

  @mobile
  Scenario: Analytics on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "analytics-page"
