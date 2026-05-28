@influencer @messages
Feature: Influencer Messages
  As an influencer user
  I want to view and reply to brand conversations
  So that campaign communication stays in one place

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer messages" page

  Scenario: Messages page loads with conversation list
    Then I should see the element with test id "messages-client"
    And I should see the element with test id "conversation-list"
    And I should see a field with placeholder "Search conversation..."

  Scenario: Selecting a conversation opens chat
    When I click the element with test id matching pattern "conversation-item-.*"
    Then I should see the element with test id "chat-window"
    And I should see the element with test id "chat-message-list"
    And I should see the element with test id "chat-message-input"

  Scenario: Send message is disabled before typing
    When I click the element with test id matching pattern "conversation-item-.*"
    Then I should see the element with test id "chat-send-button"
    And the element with test id "chat-send-button" should be disabled

  @mobile
  Scenario: Messages page on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "conversation-list"
