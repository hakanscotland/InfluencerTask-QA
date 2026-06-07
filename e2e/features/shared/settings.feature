# Kullanıcı Ayarları Testleri
# Bu test dosyası, kullanıcının profil ayarları sayfasını
# görüntüleyebildiğini ve profil formunu görebildiğini
# doğrular. Mobil uyumluluk dahildir.

@shared @settings
Feature: User Settings
  As a logged-in user
  I want to update my profile and preferences
  So that my account information stays current

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "settings" page

  Scenario: Settings page loads
    Then I should see the element with test id "settings-page"

  Scenario: Profile form is visible
    Then I should see the element with test id "settings-name-input"
    And I should see the element with test id "settings-bio-textarea"
    And I should see the element with test id "settings-save-button"

  @mobile
  Scenario: Settings on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "settings-page"
