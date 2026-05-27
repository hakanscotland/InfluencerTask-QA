@brand @discover
Feature: Brand Discover Influencers
  As a brand user
  I want to discover and browse influencers
  So that I can find the right partners for my campaigns

  Background:
    Given I am logged in as a "brand" user
    And I navigate to the "brand discover" page

  Scenario: Discover page loads with filters
    Then I should see the element with test id "discover-page"

  Scenario: Filter influencers by platform
    When I click the element with test id "discover-filter-toggle"
    And I click the element with test id "discover-filter-platform"
    Then I should see the element with test id "discover-page"

  Scenario: Search influencers by name or keyword
    When I fill the field with test id "discover-search-input" with "fashion"
    Then I should see the element with test id "discover-page"

  @mobile
  Scenario: Discover page on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "discover-page"
