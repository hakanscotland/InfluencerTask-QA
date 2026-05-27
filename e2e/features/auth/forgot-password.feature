@auth @forgot-password
Feature: Forgot Password
  As a registered user
  I want to reset my password via email
  So that I can regain access to my account

  Background:
    Given I am on the "forgot password" page

  Scenario: Forgot password page has required fields
    Then I should see the element with test id "forgot-password-page"
    And I should see the element with test id "forgot-password-email-input"
    And I should see the element with test id "forgot-password-submit-button"
    And I should see the element with test id "forgot-password-back-link"

  Scenario: Submit forgot password with valid email shows success
    When I fill the field with test id "forgot-password-email-input" with "marka@influencerportal.com.tr"
    And I click the element with test id "forgot-password-submit-button"
    Then I should see the element with test id "forgot-password-success-message"

  Scenario: Navigate back to login from forgot password
    When I click the element with test id "forgot-password-back-link"
    Then the URL should contain "/login"
    And I should see the element with test id "login-page"
