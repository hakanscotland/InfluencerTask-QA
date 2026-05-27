@navigation @mobile
Feature: Mobile Navigation
  As a mobile user
  I want to open and navigate via the mobile menu
  So that I can use the platform on small screens

  Background:
    Given I set viewport to mobile

  Scenario: Mobile menu button is visible
    Given I am logged in as a "brand" user
    Then I should see the element with test id "header-mobile-menu-button"

  Scenario: Open and close mobile navigation as brand
    Given I am logged in as a "brand" user
    When I click the mobile menu button
    Then the mobile navigation should be visible
    When I close the mobile navigation
    Then I should not see the element with test id "mobile-nav-overlay"

  Scenario: Mobile navigation shows brand links
    Given I am logged in as a "brand" user
    When I click the mobile menu button
    Then the mobile navigation should be visible
    And I should see the element with test id "mobile-nav-link-brand"
    And I should see the element with test id "mobile-nav-link-brand-campaigns"

  Scenario: Mobile navigation shows influencer links
    Given I am logged in as an "influencer" user
    When I click the mobile menu button
    Then the mobile navigation should be visible
    And I should see the element with test id "mobile-nav-link-influencer"
    And I should see the element with test id "mobile-nav-link-influencer-analytics"

  Scenario: Mobile navigation shows admin links
    Given I am logged in as an "admin" user
    When I click the mobile menu button
    Then the mobile navigation should be visible
    And I should see the element with test id "mobile-nav-link-admin"
    And I should see the element with test id "mobile-nav-link-admin-users"
    And I should see the element with test id "mobile-nav-link-admin-finance"
