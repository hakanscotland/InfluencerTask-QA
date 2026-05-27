@wallet
Feature: Wallet and Treasury Operations
  As a user of the InfluencerPortal
  I want to be able to deposit money to my wallet and request withdrawals
  So that I can fund my campaigns (as a Brand) or get paid for my tasks (as an Influencer)

  Background:
    Given the test data is reset for influencer user

  Scenario: Brand requests and admin approves fiat deposit
    Given I am logged in as a "brand" user
    And I navigate to the "wallet" page
    Then I should see the element with test id "wallet-page"
    And the element with test id "wallet-balance-card" should contain text "₺0"
    When I click the element with test id "wallet-deposit-button"
    Then I should see the element with test id "wallet-deposit-amount-input"
    When I fill the field with test id "wallet-deposit-amount-input" with "5000"
    And I click the element with test id "wallet-deposit-continue-button"
    Then I should see the element with test id "wallet-deposit-method-bank-transfer"
    When I click the element with test id "wallet-deposit-method-bank-transfer"
    And I click the element with test id "wallet-deposit-confirm-method-button"
    Then I should see the element with test id "wallet-deposit-submit-button"
    When I click the element with test id "wallet-deposit-submit-button"
    Then I should see the element with test id "wallet-balance-card"
    And I wait for 2000 milliseconds
    Given I am logged in as an "admin" user
    And I navigate to the "admin finance" page
    Then I should see the element with test id "admin-treasury-page"
    When I click the element with test id matching pattern "admin-deposit-row-.*-approve-button"
    And I wait for 2000 milliseconds
    Given I am logged in as a "brand" user
    And I navigate to the "wallet" page
    Then the element with test id "wallet-balance-card" should contain text "₺5,000"

  Scenario: Influencer requests and admin approves withdrawal
    Given I am logged in as an "influencer" user
    And I navigate to the "wallet" page
    Then the element with test id "wallet-balance-card" should contain text "₺1,000"
    When I click the element with test id "wallet-withdraw-button"
    Then I should see the element with test id "wallet-withdraw-amount-input"
    When I fill the field with test id "wallet-withdraw-amount-input" with "250"
    And I fill the field with test id "wallet-withdraw-bank-input" with "Akbank"
    And I fill the field with test id "wallet-withdraw-iban-input" with "TR123456789012345678901234"
    And I fill the field with test id "wallet-withdraw-holder-input" with "Reklam Influencer"
    And I click the element with test id "wallet-withdraw-submit-button"
    Then I should see the element with test id "wallet-balance-card"
    And the element with test id "wallet-balance-card" should contain text "₺1,000"
    Given I am logged in as an "admin" user
    And I navigate to the "admin withdrawals" page
    Then I should see the element with test id "admin-withdrawal-page"
    When I click the element with test id matching pattern "admin-withdrawal-row-.*-approve-button"
    Then I should see the element with test id "admin-withdrawal-action-modal"
    When I fill the field with test id "withdrawal-modal-note-input" with "Ödeme başarıyla yapıldı, dekont sisteme eklendi."
    And I click the element with test id "withdrawal-modal-confirm-button"
    Then I should not see the element with test id "admin-withdrawal-action-modal"
    And I wait for 2000 milliseconds
    Given I am logged in as an "influencer" user
    And I navigate to the "wallet" page
    Then the element with test id "wallet-balance-card" should contain text "₺750"
