@influencer @entities
Feature: Influencer Brands
  As an influencer user
  I want to manage my brand entities
  So that campaign ownership is connected to the right brand profile

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer entities" page

  Scenario: My brands page loads
    Then the page should contain text "My Brands"
    And the page should contain text "Add and verify your brands"

  Scenario: Empty brands state or brand list is visible
    Then the page may contain text "No brands added yet"
    And I should see a button containing text "Add New Brand"

  Scenario: Search brands field is available
    Then I should see a field with placeholder "Search brand..."
    When I fill the field with placeholder "Search brand..." with "No Matching Brand"
    Then the page may contain text "No brands"

  @mobile
  Scenario: My brands page on mobile
    Given I set viewport to mobile
    Then the page should contain text "My Brands"
