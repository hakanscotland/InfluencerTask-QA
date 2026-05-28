@shared @pricing
Feature: Pricing
  As a logged-in user
  I want to compare subscription plans
  So that I can choose the right plan for my account

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "pricing" page

  Scenario: Pricing page loads
    Then the page should contain text "Choose What Fits Your Needs"
    And the page should contain text "No hidden fees"

  Scenario: Pricing plans are visible
    Then the page should contain text "Free"
    And the page should contain text "Starter"
    And the page should contain text "Growth"
    And the page should contain text "Enterprise"

  @mobile
  Scenario: Pricing page on mobile
    Given I set viewport to mobile
    Then the page should contain text "Choose What Fits Your Needs"
