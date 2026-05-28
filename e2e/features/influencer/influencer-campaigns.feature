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
    Then I should see the element with test id "influencer-campaigns-tab-applications"
    And I should see the element with test id "influencer-campaigns-tab-opportunities"
    And I should see the element with test id "influencer-campaigns-tab-created"

  Scenario: Empty participations state is visible
    Then I should see the element with test id "campaign-table-empty-state"
    And the page should contain text "No participations yet"

  Scenario: New opportunities tab shows campaign cards
    When I click the element with test id "influencer-campaigns-tab-opportunities"
    Then I should see the element with test id "influencer-campaigns-tab-panel-opportunities"
    And I should see the element with test id matching pattern "campaign-card-.*"

  Scenario: Created campaigns tab has a create campaign entry point
    When I click the element with test id "influencer-campaigns-tab-created"
    Then I should see the element with test id "influencer-campaigns-tab-panel-created"
    And the page should contain text "Create Campaign"

  @mobile
  Scenario: My campaigns on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "influencer-campaigns-page"
