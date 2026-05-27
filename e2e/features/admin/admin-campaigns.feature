@admin @campaigns
Feature: Admin Campaign Moderation
  As an admin user
  I want to review and moderate campaigns
  So that I can ensure quality content on the platform

  Background:
    Given I am logged in as an "admin" user
    And I navigate to the "admin campaigns" page

  Scenario: Campaign moderation page loads
    Then I should see the element with test id "admin-campaigns-page"

  Scenario: Campaign moderation table is visible
    Then the page may contain text "Kampanya"
    Then the page may contain text "Campaign"

  @mobile
  Scenario: Campaign moderation on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "admin-campaigns-page"
