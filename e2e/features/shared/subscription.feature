@shared @subscription
Feature: Subscription Management
  As a subscribed user
  I want to view and manage my account plan
  So that I understand my current billing status

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "settings subscription" page

  Scenario: Subscription page loads
    Then I should see the element with test id "subscription-manager"
    And the page should contain text "Account Plan"
    And the page should contain text "Current Subscription"

  Scenario: Current plan and payment history are visible
    Then the page should contain text "Growth"
    And the page should contain text "Payment History"

  Scenario: Subscription actions are available
    Then I should see the element with test id "subscription-cancel-button"
    And I should see the element with test id "subscription-upgrade-button"
    And I should see a button containing text "Request Refund"
    And I should see a button containing text "Create Support Ticket"

  @mobile
  Scenario: Subscription page on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "subscription-manager"
