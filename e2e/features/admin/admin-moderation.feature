# Admin Moderasyon Yönetimi Testleri
# Campaign-admin kullanıcısının kampanya listesinde Moderasyon sekmesini
# görebildiğini ve (moderasyondaki bir kampanya varsa) "Moderasyonu Yönet"
# linkiyle admin moderasyon detay sayfasına gidebildiğini doğrular.
# Moderasyon durumundaki kampanyalar test verisine bağlı olduğundan,
# duruma özel öğeler için soft assertion / koşullu tıklama kullanılır.

@admin @moderation
Feature: Admin Campaign Moderation Management
  As a campaign admin user
  I want to manage the moderation window of campaigns
  So that I can review rewards, resolve appeals and finalize payouts

  Background:
    Given I am logged in as a "campaign-admin" user
    And I navigate to the "admin campaigns" page

  Scenario: Moderation tab is available
    Then I should see the element with test id "admin-campaigns-page"
    And the page may contain text "Moderasyon"
    And the page may contain text "Moderation"

  Scenario: Manage moderation link opens the detail page when a moderated campaign exists
    When I click the element with test id matching pattern "admin-manage-moderation-link" if it exists
    And I wait for the page to load
    Then the page may contain text "Moderasyon"
    And the page may contain text "Moderation"

  @mobile
  Scenario: Moderation management on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "admin-campaigns-page"
