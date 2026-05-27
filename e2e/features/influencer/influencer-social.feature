@influencer @social
Feature: Influencer Social Accounts
  As an influencer user
  I want to manage my connected social media accounts
  So that brands can see my reach and engagement

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer social" page

  Scenario: Social accounts page loads
    Then I should see the element with test id "social-page"

  Scenario: Social page shows connect button
    Then I should see the element with test id "social-connect-button"

  @mobile
  Scenario: Social accounts on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "social-page"
