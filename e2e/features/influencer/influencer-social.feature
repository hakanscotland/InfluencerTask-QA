@influencer @social
Feature: Influencer Social Accounts
  As an influencer user
  I want to manage my connected social media accounts
  So that brands can see my reach and engagement

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer social" page

  Scenario: Social accounts page loads
    Then the page should contain text "Social Accounts"
    And I should see the element with test id "connect-social-form"

  Scenario: Social connect form has platform choices
    Then I should see the element with test id "connect-social-platform-instagram"
    And I should see the element with test id "connect-social-platform-tiktok"
    And I should see the element with test id "connect-social-platform-youtube"
    And I should see the element with test id "connect-social-platform-twitter"
    And I should see a field with placeholder "username"

  Scenario: Select a platform to connect
    When I check the checkbox with test id "connect-social-platform-instagram"
    Then the checkbox with test id "connect-social-platform-instagram" should be checked
    And I should see a button containing text "Verify Connection"

  @mobile
  Scenario: Social accounts on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "connect-social-form"
