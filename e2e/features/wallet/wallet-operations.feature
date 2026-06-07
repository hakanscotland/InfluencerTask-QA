# Cüzdan İşlemleri Testleri
# Bu test dosyası, influencer kullanıcısının cüzdan bakiyesini
# görüntüleyebildiğini, para yatırma ve çekme formlarını
# açabildiğini doğrular.

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
    Then the page may contain text "Deposit Balance"
    And the page may contain text "Bakiye Yükle"

  Scenario: Open withdrawal request form
    When I click the element with test id "wallet-withdraw-button"
    Then the page should contain text "Withdrawal Request"
    And I should see the element with test id "wallet-withdraw-amount-input"
    And I should see the element with test id "wallet-withdraw-bank-input"
