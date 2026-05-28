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
    Then the page should contain text "Profile Details"
    And the page should contain text "Influencer Profile"
    And I should see a field with placeholder "Briefly introduce yourself..."
    And I should see a button containing text "Update Information"

  Scenario: KYC entry point is visible
    Then I should see a button containing text "KYC Verification"

  Scenario: Password change requires valid password input
    Then I should see a field with placeholder "Min 6 characters"
    And I should see a field with placeholder "Repeat password"
    And the button containing text "Change Password" should be disabled

  Scenario: Navigate to subscription settings
    When I navigate to the "settings subscription" page
    Then the URL should contain "/settings/subscription"
    And I should see the element with test id "subscription-manager"

  @mobile
  Scenario: Settings on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "settings-page"
