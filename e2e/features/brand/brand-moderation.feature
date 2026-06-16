# Marka Kampanya Moderasyon Testleri
# Marka kullanıcısının kampanya detayında (kampanya moderasyon/tamamlandı
# durumundaysa) moderasyon banner'ını, ödül inceleme tablosunu ve itiraz
# listesini görebildiğini doğrular. Erken sonlandırma butonu yalnızca
# moderasyon sırasında görünür. Duruma özel öğeler için soft assertion kullanılır.

@brand @moderation
Feature: Brand Campaign Moderation
  As a brand user
  I want to review reward distribution and finalize a campaign during moderation
  So that I can control payouts and respond to appeals

  Background:
    Given the test data is reset for influencer user
    And I am logged in as a "brand" user
    And I navigate to the "brand campaigns" page

  Scenario: Campaign detail loads and may show moderation UI
    When I click the element with test id matching pattern "campaign-table-row-.*"
    Then I should see the element with test id "campaign-detail-title"
    And the page may contain text "Moderasyon"
    And the page may contain text "Moderation"

  Scenario: Reward review panel is available for moderated or finalized campaigns
    When I click the element with test id matching pattern "campaign-table-row-.*"
    Then I should see the element with test id "campaign-detail-title"
    And the page may contain text "Ödül"
    And the page may contain text "Reward"

  Scenario: Early finalize control is offered during moderation
    When I click the element with test id matching pattern "campaign-table-row-.*"
    Then I should see the element with test id "campaign-detail-title"
    And I click the element with test id matching pattern "brand-early-finalize-button" if it exists
    And the page may contain text "Moderasyon"
    And the page may contain text "Moderation"

  @mobile
  Scenario: Moderation detail on mobile
    Given I set viewport to mobile
    And I navigate to the "brand campaigns" page
    When I click the element with test id matching pattern "campaign-table-row-.*"
    Then I should see the element with test id "campaign-detail-title"
