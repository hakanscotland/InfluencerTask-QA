@navigation @sidebar
Feature: Influencer Sidebar Navigation
  As an influencer user
  I want to navigate between dashboard sections via the sidebar
  So that I can access all features quickly

  Background:
    Given I am logged in as an "influencer" user

  Scenario: Influencer sidebar navigation links
    Then I should see the element with test id "sidebar-nav-link-influencer"
    And I should see the element with test id "sidebar-nav-link-influencer-campaigns"
    And I should see the element with test id "sidebar-nav-link-influencer-entities"
    And I should see the element with test id "sidebar-nav-link-influencer-campaigns-new"
    And I should see the element with test id "sidebar-nav-link-influencer-opportunities"
    And I should see the element with test id "sidebar-nav-link-brand-discover"
    And I should see the element with test id "sidebar-nav-link-influencer-social"
    And I should see the element with test id "sidebar-nav-link-influencer-messages"
    And I should see the element with test id "sidebar-nav-link-influencer-analytics"
    And I should see the element with test id "sidebar-nav-link-influencer-iqs"
    And I should see the element with test id "sidebar-nav-link-influencer-invitations"
    And I should see the element with test id "sidebar-nav-link-influencer-rewards"
    And I should see the element with test id "sidebar-nav-link-pricing"
    And I should see the element with test id "sidebar-nav-link-settings-subscription"
    And I should see the element with test id "sidebar-nav-link-wallet"

  Scenario: Navigate to influencer analytics from sidebar
    When I click the element with test id "sidebar-nav-link-influencer-analytics"
    Then the URL should contain "/influencer/analytics"

  Scenario: Navigate to influencer social accounts from sidebar
    When I click the element with test id "sidebar-nav-link-influencer-social"
    Then the URL should contain "/influencer/social"

  Scenario: Navigate to influencer messages from sidebar
    When I click the element with test id "sidebar-nav-link-influencer-messages"
    Then the URL should contain "/influencer/messages"

  Scenario: Navigate to influencer IQS from sidebar
    When I click the element with test id "sidebar-nav-link-influencer-iqs"
    Then the URL should contain "/influencer/iqs"
