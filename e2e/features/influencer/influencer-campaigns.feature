@influencer @campaigns
Feature: Influencer My Campaigns
  As an influencer user
  I want to view my active and past campaigns
  So that I can track my work and earnings

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer campaigns" page

  Scenario: My campaigns page loads
    Then I should see the element with test id "influencer-campaigns-page"

  Scenario: Campaign tabs are visible
    Then the page may contain text "Aktif"
    Then the page may contain text "Active"

  @mobile
  Scenario: My campaigns on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "influencer-campaigns-page"
