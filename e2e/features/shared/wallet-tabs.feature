@shared @wallet-tabs
Feature: Wallet Tab Switching
  As a user with a wallet
  I want to switch between TRY and Promo token wallets
  So that I can manage both fiat and token balances

  Background:
    Given I am logged in as a "brand" user
    And I navigate to the "wallet" page

  Scenario: Wallet tabs are visible
    Then I should see the element with test id "wallet-tabs-container"
    And I should see the element with test id "wallet-tab-try"
    And I should see the element with test id "wallet-tab-promo"

  Scenario: Switch to Promo token tab
    When I click the element with test id "wallet-tab-promo"
    Then the element with test id "wallet-tab-promo" should be enabled
    And the page should contain text "Web3"

  Scenario: Switch back to TRY wallet tab
    When I click the element with test id "wallet-tab-promo"
    And I click the element with test id "wallet-tab-try"
    Then the element with test id "wallet-tab-try" should be enabled
    And I should see the element with test id "wallet-balance-card"

  Scenario: Deposit button is visible in TRY tab
    Then I should see the element with test id "wallet-deposit-button"
    And I should see the element with test id "wallet-withdraw-button"

  @mobile
  Scenario: Wallet tabs on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "wallet-tabs-container"
