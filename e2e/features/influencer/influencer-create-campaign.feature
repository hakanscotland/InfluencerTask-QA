@influencer @campaigns
Feature: Influencer Campaign Creation
  As an influencer user
  I want to start a campaign from my dashboard
  So that I can promote collaborations from my own brand profile

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer create campaign" page

  Scenario: Campaign wizard opens on basic information
    Then I should see the element with test id "campaign-wizard"
    And I should see the element with test id "campaign-wizard-step-1"
    And I should see the element with test id "campaign-wizard-progress-bar"
    And I should see the element with test id "wizard-step-1-title-input"

  Scenario: Previous button is disabled on first wizard step
    Then the element with test id "campaign-wizard-back-button" should be disabled
    And I should see the element with test id "campaign-wizard-next-button"

  Scenario: Paid collaboration is available and future campaign types are disabled
    Then I should see a button containing text "Paid Collaboration"
    And the button containing text "UGC" should be disabled
    And the button containing text "Gifting" should be disabled
    And the button containing text "Affiliate" should be disabled

  Scenario: Campaign title can be entered
    When I fill the field with test id "wizard-step-1-title-input" with "E2E Draft Campaign"
    Then the element with test id "wizard-step-1-title-input" should have value "E2E Draft Campaign"

  @mobile
  Scenario: Campaign wizard on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "campaign-wizard"
