@shared @notifications
Feature: Notifications
  As a logged-in user
  I want to view and manage my notifications
  So that I can stay informed about platform activities

  Background:
    Given I am logged in as an "influencer" user

  Scenario: Notification bell is visible
    Then I should see the element with test id "header-notifications-button"
    And I should see the element with test id "notification-bell-button"

  Scenario: Open notifications popover
    When I click the element with test id "notification-bell-button"
    Then I should see the element with test id "notifications-popover"

  Scenario: Close notifications popover
    When I click the element with test id "notification-bell-button"
    Then I should see the element with test id "notifications-popover"
    When I press the "Escape" key
    Then I should not see the element with test id "notifications-popover"

  @mobile
  Scenario: Notification bell on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "notification-bell-button"
