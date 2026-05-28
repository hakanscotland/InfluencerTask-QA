@influencer @rewards
Feature: Influencer Rewards
  As an influencer user
  I want to view reward status
  So that I can track loyalty and referral benefits

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer rewards" page

  Scenario: Rewards page loads
    Then the URL should contain "/influencer/rewards"
    And the page should contain text "rewards"

  Scenario: Rewards empty state is visible
    Then the page should contain text "Dashboard.influencer.rewards.empty.title"
    And the page should contain text "Dashboard.influencer.rewards.empty.desc"

  @mobile
  Scenario: Rewards page on mobile
    Given I set viewport to mobile
    Then the URL should contain "/influencer/rewards"
