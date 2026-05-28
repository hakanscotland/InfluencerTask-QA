@influencer @analytics
Feature: Influencer Analytics
  As an influencer user
  I want to view my performance analytics
  So that I can understand my audience and growth

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer analytics" page

  Scenario: Analytics page loads
    Then the page should contain text "No Analytics Data Yet"

  Scenario: Analytics empty state links users to social accounts
    Then the page should contain text "Connect Account"
    When I click the first link containing href "/influencer/social"
    Then the URL should contain "/influencer/social"

  @mobile
  Scenario: Analytics on mobile
    Given I set viewport to mobile
    Then the page should contain text "No Analytics Data Yet"
