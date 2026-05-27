@navigation @sidebar
Feature: Sidebar Navigation
  As a logged-in user
  I want to navigate between dashboard sections via the sidebar
  So that I can access all features quickly

  Background:
    Given I am logged in as a "brand" user

  Scenario: Sidebar is visible on desktop
    Then I should see the element with test id "sidebar"
    And I should see the element with test id "sidebar-logo"
    And I should see the element with test id "sidebar-logout-button"
    And I should see the element with test id "sidebar-settings-link"
    And I should see the element with test id "sidebar-home-link"

  Scenario: Brand sidebar navigation links
    Then I should see the element with test id "sidebar-nav-link-brand"
    And I should see the element with test id "sidebar-nav-link-brand-campaigns"
    And I should see the element with test id "sidebar-nav-link-brand-discover"
    And I should see the element with test id "sidebar-nav-link-brand-ai-brief"
    And I should see the element with test id "sidebar-nav-link-brand-media-tracking"
    And I should see the element with test id "sidebar-nav-link-brand-messages"
    And I should see the element with test id "sidebar-nav-link-settings-subscription"

  Scenario: Navigate to brand campaigns from sidebar
    When I click the element with test id "sidebar-nav-link-brand-campaigns"
    Then the URL should contain "/brand/campaigns"

  Scenario: Navigate to brand discover from sidebar
    When I click the element with test id "sidebar-nav-link-brand-discover"
    Then the URL should contain "/brand/discover"

  Scenario: Navigate to wallet from header
    When I click the element with test id "header-wallet-button"
    Then the URL should contain "/wallet"
