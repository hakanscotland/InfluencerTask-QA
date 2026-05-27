@auth @logout
Feature: User Logout
  As a logged-in user
  I want to log out of the platform
  So that my session is securely terminated

  Scenario: Brand user logs out from sidebar
    Given I am logged in as a "brand" user
    When I click the element with test id "sidebar-logout-button"
    Then the URL should contain "/"

  Scenario: Influencer user logs out from sidebar
    Given I am logged in as an "influencer" user
    When I click the element with test id "sidebar-logout-button"
    Then the URL should contain "/"

  Scenario: Admin user logs out from sidebar
    Given I am logged in as an "admin" user
    When I click the element with test id "sidebar-logout-button"
    Then the URL should contain "/"

  Scenario: Admin user logs out and sees home page
    Given I am logged in as an "admin" user
    When I click the element with test id "sidebar-logout-button"
    Then the URL should contain "/"
