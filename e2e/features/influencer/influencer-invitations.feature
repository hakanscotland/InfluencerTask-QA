@influencer @invitations
Feature: Influencer Invitations
  As an influencer user
  I want to review direct campaign invitations
  So that I can respond to brands interested in my profile

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer invitations" page

  Scenario: Invitations page loads
    Then the page should contain text "Invitations"
    And the page should contain text "Exclusive campaign offers"

  Scenario: Empty invitations state is visible
    Then the page should contain text "No invitations yet"
    And the page should contain text "Brands will send you direct invitations"

  @mobile
  Scenario: Invitations page on mobile
    Given I set viewport to mobile
    Then the page should contain text "No invitations yet"
