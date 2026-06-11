# Admin Bayilik & Komisyon/Ödeme Ayarları Testleri
# Admin partnership sayfasının yüklendiğini, partner başvuru panelini ve
# "Komisyon & Ödeme Ayarları" kartının tüm kontrollerini gösterdiğini doğrular.
# NOT: Testler production'a karşı koştuğundan SADECE OKUMA yapar — payout
# ayarlarını kaydetmez (gerçek system_settings mutasyonundan kaçınılır).

@admin @partnership
Feature: Admin Partnership & Payout Settings
  As an admin user
  I want to view and configure referral/partnership payout parameters
  So that commission basis and rates are managed without code changes

  Background:
    Given I am logged in as an "admin" user
    And I navigate to the "admin partnership" page

  Scenario: Partnership page loads with applications dashboard and payout settings
    Then I should see the element with test id "admin-partnership-dashboard"
    And I should see the element with test id "payout-settings-card"

  Scenario: Payout settings card shows all configuration controls
    Then I should see the element with test id "payout-settings-card"
    And I should see the element with test id "payout-basis-platform_commission"
    And I should see the element with test id "payout-basis-budget"
    And I should see the element with test id "payout-referral-pct"
    And I should see the element with test id "payout-partnership-pct"
    And I should see the element with test id "payout-earlybird-toggle"
    And I should see the element with test id "payout-settings-save"

  Scenario: Switching calculation basis is interactive (no save)
    When I click the element with test id "payout-basis-budget"
    Then I should see the element with test id "payout-referral-pct"
    When I click the element with test id "payout-basis-platform_commission"
    Then I should see the element with test id "payout-settings-card"

  @mobile
  Scenario: Partnership payout settings on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "payout-settings-card"
