@influencer @opportunities
Feature: Influencer Opportunities
  As an influencer user
  I want to discover and inspect campaign opportunities
  So that I can choose suitable brand collaborations

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer opportunities" page

  Scenario: Opportunities page loads with campaign feed
    Then the page should contain text "Campaign Feed"
    And the page should contain text "Discover campaigns"
    And I should see a field with placeholder "Search campaigns..."

  Scenario: Search opportunities by campaign title
    When I fill the field with placeholder "Search campaigns..." with "NewCampaign"
    Then the page should contain text "NewCampaign"

  Scenario: Platform filter options are available
    Then the page should contain text "Instagram"
    And the page should contain text "TikTok"
    And the page should contain text "YouTube"

  Scenario: Navigate to an opportunity detail
    When I click the first link containing href "/influencer/opportunities/"
    Then the URL should contain "/influencer/opportunities/"
    And I should see the element with test id "apply-form"
    And I should see the element with test id "apply-form-submit-button"

  @mobile
  Scenario: Opportunities on mobile
    Given I set viewport to mobile
    Then the page should contain text "Campaign Feed"
