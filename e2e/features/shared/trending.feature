@shared @trending
Feature: Trending Influencers
  As a logged-in user
  I want to browse trending influencers
  So that I can discover high-growth accounts

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "trending" page

  Scenario: Trending page loads
    Then I should see the element with test id "trending-influencers-client"
    And the page should contain text "Top Trending Influencers"

  Scenario: Region and category filters are visible
    Then the page should contain text "All Regions"
    And the page should contain text "All Categories"

  @mobile
  Scenario: Trending page on mobile
    Given I set viewport to mobile
    Then the page should contain text "Top Trending Influencers"
