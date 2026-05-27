@brand @submissions
Feature: Brand Submissions Review
  As a brand user
  I want to view influencer submissions for my campaigns
  So that I can track the work being done

  Background:
    Given I am logged in as a "brand" user
    And I navigate to the "brand submissions" page

  Scenario: Submissions page loads
    Then I should see the element with test id "brand-submissions-page"

  Scenario: Campaign submissions panel has correct structure
    Then the page may contain text "Gönderiler"
    Then the page may contain text "Submissions"

  @mobile
  Scenario: Submissions page on mobile
    Given I set viewport to mobile
    Then I should see the element with test id "brand-submissions-page"
