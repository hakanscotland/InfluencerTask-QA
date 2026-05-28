@smoke @regression
Feature: User Authentication - Login
  As a registered user
  I want to log in to the platform
  So that I can access my dashboard

  Background:
    Given I am on the "login" page

  @smoke @critical
  Scenario: Successful login with email and password
    When I log in with configured credentials
    Then I should see the element with test id "dashboard-layout"
    And the page should contain text "Welcome"

  Scenario: Login with invalid credentials shows error
    When I fill the field with test id "login-email-input" with "wrong@example.com"
    And I fill the field with test id "login-password-input" with "WrongPassword"
    And I click the element with test id "login-submit-button"
    Then I should see the element with test id "login-error-message"
    And the element with test id "login-error-message" should contain text "Geçersiz"

  Scenario: Login with empty email shows validation error
    When I fill the field with test id "login-password-input" with "somepassword"
    And I click the element with test id "login-submit-button"
    Then the element with test id "login-email-input" should have value ""

  Scenario: Login with empty password keeps user on login page
    When I fill the field with test id "login-email-input" with "user@example.com"
    And I click the element with test id "login-submit-button"
    Then the element with test id "login-password-input" should have value ""
    And the URL should contain "/login"

  Scenario: Login form contains all required fields
    Then I should see the element with test id "login-email-input"
    And I should see the element with test id "login-password-input"
    And I should see the element with test id "login-submit-button"
    And I should see the element with test id "login-google-button"
    And I should see the element with test id "login-forgot-password-link"
    And I should see the element with test id "login-register-link"

  Scenario: Password visibility toggle works
    When I fill the field with test id "login-password-input" with "Secret123"
    And I click the element with test id "login-password-toggle"
    Then the element with test id "login-password-input" should have value "Secret123"

  Scenario: Navigate to register page from login
    When I click the element with test id "login-register-link"
    Then the URL should contain "/register"
    And I should see the element with test id "register-page"

  Scenario: Navigate to forgot password page from login
    When I click the element with test id "login-forgot-password-link"
    Then the URL should contain "/forgot-password"
    And I should see the element with test id "forgot-password-page"
