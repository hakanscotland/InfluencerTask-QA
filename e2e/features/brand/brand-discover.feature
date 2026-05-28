@brand @discover
Feature: Brand Discover Influencers
  As a logged-in user
  I want to discover and browse influencers
  So that I can find the right partners for my campaigns

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "brand discover" page

  Scenario: Discover page loads with filters
    Then I should see the element with test id "discover-page"
    And the page should contain text "Influencer Hub"

  Scenario: Category filters are visible
    Then the page should contain text "All Categories"
    And the page should contain text "Fashion"
    And the page should contain text "Technology"

  Scenario: Toggle discover list view
    When I click the button containing text "Show Names"
    Then I should see the element with test id "discover-page"

  Scenario: Search influencers by name or keyword
    When I fill the field with placeholder "Search by name, username or keyword..." with "test"
    Then I should see the element with test id "discover-page"

  @mobile
  Scenario: Discover page on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "discover-page"
