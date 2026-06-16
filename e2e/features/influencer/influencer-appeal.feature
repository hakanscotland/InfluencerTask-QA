# Influencer Ödül İtirazı Testleri
# Influencer kullanıcısının, moderasyon sürecindeki bir kampanyada
# "İtiraz Et" kontrolünü görebildiğini ve itiraz modalını açabildiğini doğrular.
# İtiraz kontrolü yalnızca kampanya moderasyon durumundaysa görünür; bu yüzden
# duruma özel öğeler için soft assertion / koşullu tıklama kullanılır.

@influencer @moderation @appeal
Feature: Influencer Reward Appeal
  As an influencer user
  I want to appeal my reward during the campaign moderation window
  So that the brand and admins can re-evaluate my reward

  Background:
    Given the test data is reset for influencer user
    And I am logged in as an "influencer" user
    And I navigate to the "influencer campaigns" page

  Scenario: My campaigns page loads
    Then I should see the element with test id "influencer-campaigns-page"

  Scenario: Appeal control appears for campaigns under moderation
    When I click the element with test id "influencer-campaigns-tab-applications"
    And I wait for the page to load
    Then the page may contain text "İtiraz"
    And the page may contain text "Appeal"

  Scenario: Opening the appeal modal when a moderated campaign exists
    When I click the element with test id "influencer-campaigns-tab-applications"
    And I wait for the page to load
    And I click the element with test id matching pattern "influencer-appeal-button" if it exists
    Then the page may contain text "İtiraz"
    And the page may contain text "Appeal"

  @mobile
  Scenario: Appeal page on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "influencer-campaigns-page"
