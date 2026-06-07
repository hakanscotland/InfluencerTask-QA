# Influencer Fırsat Testleri
# Bu test dosyası, influencer kullanıcısının kampanya
# fırsatlarını keşfedebildiğini ve uygun marka işbirliklerini
# görebildiğini doğrular.

@influencer @opportunities
Feature: Influencer Opportunities
  As an influencer user
  I want to discover campaign opportunities
  So that I can choose suitable brand collaborations

  Background:
    Given I am logged in as an "influencer" user

  Scenario: Discover page is accessible from sidebar
    When I navigate to the "brand discover" page
    Then the URL should contain "/brand/discover"

  @mobile
  Scenario: Discover page on mobile
    Given I set viewport to mobile
    When I navigate to the "brand discover" page
    Then the URL should contain "/brand/discover"
