@auth @reset-password
Feature: Reset Password
  As a user with a reset token
  I want to set a new password
  So that I can log in with my new credentials

  Background:
    Given I am on the "login" page

  Scenario: Navigate to forgot password from login
    When I click the element with test id "login-forgot-password-link"
    Then the URL should contain "/forgot-password"
    And I should see the element with test id "forgot-password-page"

  Scenario: Reset password page has required fields
    Given I navigate to the "reset password" page
    Then I should see the element with test id "reset-password-page"
    And I should see the element with test id "reset-password-password-input"
    And I should see the element with test id "reset-password-confirm-input"
    And I should see the element with test id "reset-password-submit-button"
