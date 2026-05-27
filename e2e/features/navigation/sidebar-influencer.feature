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
    And I should see the element with test id "sidebar-nav-link-influencer-campaigns-new"
    And I should see the element with test id "sidebar-nav-link-brand-discover"
    And I should see the element with test id "sidebar-nav-link-influencer-submissions"
    And I should see the element with test id "sidebar-nav-link-influencer-analytics"
    And I should see the element with test id "sidebar-nav-link-settings-subscription"

  Scenario: Navigate to influencer analytics from sidebar
    When I click the element with test id "sidebar-nav-link-influencer-analytics"
    Then the URL should contain "/influencer/analytics"

  Scenario: Navigate to influencer social accounts from header
    When I click the element with test id "header-social-accounts-button"
    Then the URL should contain "/influencer/social"
