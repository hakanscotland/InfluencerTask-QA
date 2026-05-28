@wallet
Feature: Wallet Operations
  As an influencer user
  I want to review wallet balances and open payment request flows
  So that I can manage earnings without accidentally submitting live requests

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "wallet" page

  Scenario: Wallet page shows balance and transaction history
    Then I should see the element with test id "wallet-page"
    And I should see the element with test id "wallet-balance-card"
    And I should see the element with test id "wallet-transaction-table"

  Scenario: Open fiat deposit amount step
    When I click the element with test id "wallet-deposit-button"
    Then the page should contain text "Bakiye Yükle"
    And I should see a field with placeholder "Örn: 5000"
    And I should see a button containing text "DEVAM ET"

  Scenario: Open withdrawal request form
    When I click the element with test id "wallet-withdraw-button"
    Then the page should contain text "Withdrawal Request"
    And I should see a field with placeholder "Örn: 500"
    And I should see a field with placeholder "Bank Name"
    And I should see a field with placeholder "TR... (IBAN)"
    And I should see a field with placeholder "Account Holder Name"

  Scenario: Promo token wallet tab opens
    When I click the element with test id "wallet-tab-promo"
    Then the element with test id "wallet-tab-promo" should be enabled
    And the page should contain text "Web3"
