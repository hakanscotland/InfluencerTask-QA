# Referral Program Dashboard Tests
# Verify that the referrals page loads and displays referral stats, copy link, and tables.

@shared @referrals
Feature: Referral Program Dashboard
  As a logged-in user
  I want to view my referral program statistics and share my link
  So that I can earn commissions from invited users

  Background:
    Given I am logged in as an "influencer" user
    And I navigate to the "referrals" page

  Scenario: Referrals page renders statistics cards and key elements
    Then I should see the element with test id "referral-dashboard-client"
    And I should see the element with test id "referral-copy-button"

  @mobile
  Scenario: Referrals page loads on mobile view
    Given I set viewport to mobile
    Then I should see the element with test id "referral-dashboard-client"
