# Influencer Ödül Testleri
# Bu test dosyası, influencer kullanıcısının ödül durumunu
# görüntüleyebildiğini ve sadakat/referans avantajlarını
# görebildiğini doğrular. Mobil uyumluluk dahildir.

@influencer @rewards
Feature: Influencer Rewards
  As an influencer user
  I want to view reward status
  So that I can track loyalty and referral benefits

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "influencer rewards" page

  Scenario: Rewards page loads
    Then the URL should contain "/influencer/rewards"
    And the page should contain text "Rewards"

  Scenario: Rewards empty state is visible
    Then the page should contain text "No rewards yet"

  @mobile
  Scenario: Rewards page on mobile
    Given I set viewport to mobile
    Then the URL should contain "/influencer/rewards"
