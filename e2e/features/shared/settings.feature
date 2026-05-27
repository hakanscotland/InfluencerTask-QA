@shared @settings
Feature: User Settings
  As a logged-in user
  I want to update my profile and preferences
  So that my account information stays current

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "settings" page

  Scenario: Settings page loads
    Then I should see the element with test id "settings-page"

  Scenario: Profile form is visible
    Then I should see the element with test id "settings-name-input"
    And I should see the element with test id "settings-bio-textarea"
    And I should see the element with test id "settings-save-button"

  Scenario: Navigate to subscription settings
    When I navigate to the "settings subscription" page
    Then the URL should contain "/settings/subscription"

  @mobile
  Scenario: Settings on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "settings-page"
