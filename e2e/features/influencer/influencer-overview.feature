@influencer @overview
Feature: Influencer Dashboard Overview
  As an influencer user
  I want to see my dashboard overview
  So that I can track my performance and invitations

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer overview" page

  Scenario: Overview page loads with key elements
    Then I should see the element with test id "influencer-overview-page"

  Scenario: Overview shows profile and stats cards
    Then the page may contain text "Profile"
    And the page may contain text "Campaign"
    And the page may contain text "Status"
    And I should see the element with test id "stat-card-my-created-campaigns"
    And I should see the element with test id "stat-card-wallet-balance"
    And I should see the element with test id "stat-card-profile-reach"
    And I should see the element with test id "stat-card-invitations"

  Scenario: Overview shows performance insights section
    Then the page should contain text "Performance Insights"
    And the page should contain text "Digital Media Kit"

  @mobile
  Scenario: Overview on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "influencer-overview-page"
